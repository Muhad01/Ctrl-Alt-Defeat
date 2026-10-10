# Prior Auth Copilot

An agentic prior authorization and denial-prevention system for any procedure, test, surgery or treatment (imaging, heart surgery, angioplasty, joint replacement, chemotherapy, bariatric surgery, or anything typed in by name). A team of agents reads the patient's uploaded reports and scans, reads the chart, retrieves the payer's coverage criteria, matches every criterion to verbatim chart evidence, closes documentation gaps with the clinician, drafts the Letter of Medical Necessity, argues with a simulated insurer, verifies the packet, predicts denial risk, waits for human approval, submits to a (mock) payer, and drafts the appeal if a request is denied.

**Full documentation (how it works, every agent, API, configuration, deployment, demo script): [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md).**

See [PRIOR_AUTH_COPILOT_MVP.md](PRIOR_AUTH_COPILOT_MVP.md) for the product spec and [INNOVATION_FEATURES.md](INNOVATION_FEATURES.md) for the differentiating features.

## Quick start

Requirements: Node.js 20 or newer (tested on Node 24).

```bash
npm run setup     # installs root, backend and frontend dependencies
npm run dev       # API on http://localhost:4000, web app on http://localhost:3000
```

Open http://localhost:3000 and use a one-click demo account (password `demo123`):

| Account | Role | Can do |
|---|---|---|
| priya@demo.health | PA Coordinator | Create cases, edit/approve/reject packets, record denials, submit appeals |
| khan@demo.health | Physician | Answer documentation gaps, edit letters |
| sara@demo.health | Revenue Cycle Manager | Analytics, retrain predictor, audit log, reset demo data |

The database is seeded automatically on first start (MongoDB if `MONGODB_URI` is set, otherwise `backend/data/db.json`). Reset it with `npm run seed` or from **Settings → Reset demo data** as the manager.

## Any procedure, not only MRI

The order form lists procedures by specialty, and **Other procedure** accepts any name (kidney transplant, tonsillectomy, dialysis…).

| Procedure family | Examples (CPT) | Policy template | What the criteria check |
|---|---|---|---|
| Knee / lumbar MRI | 73721, 72148 | Knee MRI, Lumbar MRI | Symptoms, weeks of physio, NSAIDs, X-ray, red flags |
| Cardiac surgery | CABG 33533, AVR 33405, TAVR 33361 | Cardiac Surgery | Angiography/echo confirmation, symptoms, high-risk anatomy or failed medical therapy, heart-team risk score, pre-op tests |
| Cardiac intervention | Cath 93458, PCI 92928 | Catheterization and PCI | Symptoms, ACS or positive stress test, medical therapy (weeks vary by payer), ECG, renal function |
| Joint replacement | TKA 27447, THA 27130 | Total Joint Replacement | Advanced arthritis on X-ray, functional limitation, weeks of conservative care, medical clearance, BMI |
| Oncology | Chemo 96413, PET-CT 78815 | Oncology | Pathology, stage, oncologist/tumour-board plan, ECOG, baseline labs |
| Bariatric | Gastric bypass 43644 | Bariatric Surgery | BMI threshold (40, or 37.5 at Indus Health), comorbidities, supervised weight-loss program, psychology clearance |
| Everything else | Lap chole, colonoscopy, hysterectomy, cataract, brain MRI, CT, echo, any typed procedure | General Medical Necessity | Diagnosis, objective findings, prior treatment or reason it is not appropriate, clinician recommendation, pre-procedure assessment |

Every payer (4 mock + 5 real) has all 8 policies (72 in total). The Coverage Check uses the matching plan benefit: outpatient test, day-care procedure or inpatient surgery. It also checks plan exclusions, so Jubilee rejects obesity surgery. Policies are defined in `backend/src/data/policies.js` and refreshed in the database on every API start.

## Uploading reports and scans

On **New Case** (existing or new patient), and from the case workspace (**Add reports**, or **Attach document** on a gap), staff can upload up to 10 files of 15 MB each: PDF, JPG, PNG, WEBP, DOCX or TXT. The **Report Reader** agent runs first in the pipeline:

| File | How it is read |
|---|---|
| TXT / DOCX / PDF with a text layer | Text extracted directly |
| Scanned PDF, photo or image | Vision model transcription (Claude reads PDFs natively; other providers get page images). With no LLM configured: offline OCR (Tesseract, ~10 MB language data downloaded once) |

It then analyses each report: report type (lab, ECG, echo, angiography, pathology, imaging, discharge summary…), a short summary, and key findings with abnormal values flagged. A finding is kept only if its quote is found in the transcribed text.

**Relevance gate.** An upload enters the chart only if it is a clinical record of this patient. The LLM screens it (clinical document? whose name is on it? relevant to the requested service?). Without an LLM, a medical-vocabulary check is used: seeded clinical records score 4 or more term groups, a slide deck scores 0, and the threshold is 3. A document printing a different patient's name is also kept out. Excluded files stay visible in the chart panel with the reason, and a coordinator can **Add to chart anyway** (audited). Clinical documents judged unrelated to the request are added with a warning. The transcription becomes a normal chart document, so intake, criteria matching and the letter must still quote it verbatim. Low-confidence reads are flagged, and the original file opens from the chart. Originals are stored in MongoDB GridFS (`uploads.files` / `uploads.chunks`), or in `backend/data/uploads/` without MongoDB.

## AI modes

Every agent has a deterministic rule-based implementation, so the app works fully offline. To use an LLM, set a provider and key in `backend/.env` (see `backend/.env.example`) and restart the API:

```
LLM_PROVIDER=auto      # auto | mistral | claude | groq | ollama | rules
                       # auto = Claude, else Mistral, else Groq (whichever key is set), else rules
MISTRAL_API_KEY=...    MISTRAL_MODEL=ministral-3b-2512
GROQ_API_KEY=...       GROQ_MODEL=openai/gpt-oss-120b   GROQ_JSON_MODE=schema
ANTHROPIC_API_KEY=...  CLAUDE_MODEL=claude-opus-5-5
OLLAMA_URL=http://localhost:11434   OLLAMA_MODEL=qwen2.5:7b-instruct   OLLAMA_VISION_MODEL=qwen2.5vl:7b
VISION_MODEL=          # optional override for reading scans (Groq default: llama-4-scout)
```

`AI_PROVIDER` still works as an alias of `LLM_PROVIDER`. `PIPELINE_STEP_DELAY_MS` sets the pause between agent steps, and `ESTIMATED_MANUAL_MINUTES_PER_PACKET` sets the baseline behind the "minutes saved" estimate.

With a key set, the Report Reader, Intake, Criteria Matcher, Packet Writer, Verifier audit, Insurer Simulator and Appeal classifier call the model with JSON-schema structured outputs. Model output is never trusted as-is:

- Every quote is resolved to verbatim chart text (`backend/src/utils/text.js`); anything that cannot be matched is dropped, and a MET verdict without a verifiable quote becomes UNCLEAR.
- The letter writer may only reference pre-verified evidence ids; sentences citing anything else are removed.
- Simulated payer objections without a real policy section are discarded.
- If an LLM call fails, the agent falls back to its rule engine and the timeline says so.

Small-model safeguards (`ministral-3b-2512` agreed with the expected criteria verdicts on 29 of 40 test criteria, mostly by answering UNCLEAR where the chart was clear):

- `MATCHER_AUTHORITY=rules` (default): rule checks run first, and the LLM independently reviews every criterion. It sees the patient, the requested service and the clinical reason. If the rules found a keyword but the LLM says MISSING (not real evidence, wrong patient, or a recommendation rather than a result), the criterion becomes **UNCLEAR, marked "AI disputed"**, and a human must confirm it. If the LLM is only unsure, the rule verdict stands and the doubt is shown. The LLM can never turn a MISSING into MET on its own. Use `llm` for larger models.
- Keyword rules match whole-word stems only ("exam" does not match "examples"), and document title lines are not evidence.
- `LETTER_STYLE=hybrid` (default): clinical sections of the letter are built from verified quotes and the model writes only the Medical Necessity paragraph. Use `full` to let the model write every section.

## Test data and automated tests

```bash
npm --prefix backend test   # 93 end-to-end checks on a throwaway database (your data is untouched)
```

**Patients (20)**

| Patient | Insurer | What it tests |
|---|---|---|
| Maria Lopez | BlueRiver | Strong case, all criteria met |
| James Carter | Medicare | PT missing; record available in outside records |
| Aisha Rahman | Northstar | Strong lumbar case; seeded as an arbitrary "not medically necessary" denial (C-1008) |
| Robert Chen | Medicare | Red-flag pathway (foot drop) bypasses the therapy requirement |
| Fatima Malik | BlueRiver | PT duration unclear plus missing X-ray (two gaps) |
| David Okafor | Northstar | 6 of 8 PT weeks, no X-ray; seeded denial whose appeal is UPHELD (C-1005) |
| Linda Park | Medicare | PT records arrived after denial; appeal OVERTURNED (C-1002) |
| Omar Siddiqui | BlueRiver | Seeded approved case |
| Hamza Qureshi | BlueRiver | 4 weeks of physio: fails BlueRiver (6), passes Indus Health (4) |
| Sana Javed | Medicare | Tricky negation: "No improvement despite 8 weeks…" counts as MET; "Denies prior imaging" means no X-ray |
| Bilal Ahmed | Indus Health | Duration in months ("three months" = 12 weeks) |
| Ghulam Rasool | Adamjee (real) | Perfect documentation, but outpatient MRI excluded and age 63 is over the limit of 60 (C-1006) |
| Nadia Hussain | EFU (real) | Red flags met; cancer history makes coverage conditional (C-1007) |
| Kamran Ali | Medicare | Misfiled physio note for "Kamran Alvi"; verifier identity mismatch (C-1009) |
| Zainab Bibi | Northstar | 8 weeks of PT with no outcome stated (UNCLEAR); only negative exam tests |
| Usman Tariq | BlueRiver | Everything documented but no codable diagnosis; verifier coding failure, rejected (C-1010) |
| Tariq Mehmood | BlueRiver | Heart surgery (CABG): angiography, heart team and STS score all documented |
| Rubina Akhtar | Northstar | Angioplasty (PCI): no stress test (outside record can be attached) and only 3 of 8 weeks of medication |
| Saima Khan | Medicare | Knee replacement: 8 weeks of physio fails Medicare (12) but passes Indus Health (6) |
| Imran Butt | Indus Health | Gastric bypass: BMI 38.5 passes Indus Health (37.5), fails BlueRiver (40); Jubilee excludes obesity surgery |

**Seeded cases:** C-1001 approved; C-1002, C-1005 and C-1008 appeal drafted; C-1003 and C-1006 needs info; C-1004, C-1007 and C-1009 ready for review; C-1010 rejected.

**Note:** attaching an outside record adds it to the patient's chart permanently. Reset the demo data (Settings, as Sara) before repeating a demo.

## Real insurers (Pakistan)

The **Insurers** page and the **Coverage Check** agent use real health plans from Pakistani insurers. The facts come from each insurer's own public documents, retrieved 10 Oct 2026:

| Insurer / plan | Source | Outpatient MRI | Key facts used |
|---|---|---|---|
| Jubilee Life: Royale Plan | [brochure PDF](https://www.jubileelife.com/assets/documents/Royale_Plan.pdf) | Not covered (exclusion 20 "Outpatient Services"; exclusion 14 diagnostic admissions) | PKR 1M inpatient; 48-hour pre-authorization for planned admissions, 24 hours for emergencies; 60-day waiting period; pre-existing 0-20% |
| EFU Life: Mukammal Sehat | [brochure PDF](https://www.efulife.com/assets/documents/Mukammal-Sehat-Plan-Brochure.pdf) | Covered ("Specialized Investigations": MRI, CT, thallium, PET, echo) | PKR 100k-1M tiers; 15-day waiting period; pre-existing 25/50/100%; pre-existing cancer and HIV/AIDS inadmissible |
| State Life: Sahara Family Health | [product page](https://www.statelife.com.pk/en/product/protect-your-health/sahara-family-health) | Conditional (only within 30 days of a covered admission; OPD excluded) | PKR 75k-450k per person; 15-45 day waiting period |
| Adamjee Insurance: Health | [product page](https://www.adamjeeinsurance.com/health-insurance) | Not covered (OPD and specialized investigations excluded) | Pre-existing conditions excluded; maximum age 60; 30-day waiting period |
| Sehat Card Plus (KP Govt, administered by State Life) | [programme site](https://sehatsahulat.com.pk/), [Lancet RH-SEA 2022](https://pmc.ncbi.nlm.nih.gov/articles/PMC10305855/) | Not covered (inpatient programme) | Up to Rs 1M per family per year; covers cancer, cardiac, kidney/dialysis/transplant, hepatitis B/C, diabetes, burns, accidents, maternity and more |

How the app uses this data:
- **Coverage Check agent** (runs after coding): checks benefit scope, age limit, inadmissible conditions, waiting period, pre-authorization timing and network. Each finding cites its source. A non-covered benefit becomes a coordinator gap ("Written authorization obtained" or "Proceed anyway"), caps readiness at 40, and is rejected by the mock payer as "Not a covered benefit".
- **Coverage lookup** on the Insurers page answers "is this covered?" without creating a case.
- **Honesty limits:** none of these insurers publish clinical MRI criteria, so their clinical checklist is a labeled demo template. Synthetic outcome statistics (analytics, payer accountability, the experimental model) only ever describe the mock payers, never real companies. I found no reliable public ranking of the "best" insurer, so the page lists them as major providers rather than ranking them. Plans change, so verify with the insurer.

Demo idea: create a case for *Maria Lopez* and switch the insurer between **EFU Life** (covered), **State Life** (conditional) and **Jubilee Life** (not covered). The same chart and the same clinical evidence give three different coverage answers, each traced to the insurer's own document.

## Building and deploying the frontend

`NEXT_PUBLIC_API_URL` is inlined into the browser bundle at build time, so set it to the deployed backend URL before building. Then add the frontend's URL to `CORS_ORIGIN` in `backend/.env` (comma-separated; empty allows any origin).

```bash
cd frontend
NEXT_PUBLIC_API_URL=https://your-api.example.com npm run build   # also copies static assets into .next/standalone
npm start                    # or: npm run start:standalone (node .next/standalone/server.js), honours PORT
```

- **Vercel:** set the project root to `frontend` and add `NEXT_PUBLIC_API_URL` as an environment variable.
- **Docker / any Node host:** `docker build --build-arg NEXT_PUBLIC_API_URL=https://your-api.example.com -t pac-frontend frontend`, then `docker run -p 3000:3000 pac-frontend`.
- The backend is a long-running Express server with SSE and file uploads, so host it on a Node server or container (not serverless) with `MONGODB_URI` set, since the local JSON store does not survive redeploys.

## MongoDB (Atlas)

The backend stores everything in MongoDB when `MONGODB_URI` is set, and in `backend/data/db.json` otherwise.

1. At [cloud.mongodb.com](https://cloud.mongodb.com), create a free **M0** cluster.
2. Under **Database Access**, add a database user with a password.
3. Under **Network Access**, add your current IP address (or `0.0.0.0/0` for the demo).
4. Click **Connect → Drivers** and copy the `mongodb+srv://...` string.
5. In `backend/.env` set:
   ```
   MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
   MONGODB_DB=prior_auth_copilot
   ```
   If your network times out on the DNS lookup that `mongodb+srv://` needs, use the standard address that lists the three shard hosts instead (`mongodb://<user>:<password>@<shard-00-00>:27017,<shard-00-01>:27017,<shard-00-02>:27017/?tls=true&authSource=admin&replicaSet=<replica-set>`). In Atlas you get it by choosing an older driver version under Connect → Drivers. Special characters in the password must be URL-encoded.
6. Check the connection: `npm run db:check`. It prints the host (never the password) and the collection counts, and changes nothing.
7. Restart the API (`npm run dev`). On first start it seeds the demo data into Atlas automatically. To reseed later, run `npm run seed`. The self-test (`npm --prefix backend test`) always uses a throwaway local file and never touches your MongoDB.

| Collection | Contents |
|---|---|
| `users`, `sessions` | Demo accounts and login tokens |
| `patients`, `documents` | Synthetic patients and chart notes |
| `policies`, `policy_chunks` | Mock payer policies, and policy sections with their 384-dimension bge-small embeddings |
| `uploads.files`, `uploads.chunks` | GridFS: original uploaded reports, scans and photos |
| `cases` | Each case with facts, criteria results, gaps, packet, verifier, simulator, readiness and timeline embedded (one read per case) |
| `audit_log` | Append-only: the code only ever inserts |
| `outcome_history` | Synthetic plus live outcomes for analytics and the learning loop |
| `settings` | Predictor model and counters |

The app keeps a working copy in memory and writes only the changed documents after each action. Settings and `/api/health` show which storage is active.

## Demo script (5 minutes, matches PRIOR_AUTH_COPILOT_MVP.md)

1. **Problem (0:00-0:40).** Pre-approval is manual chart-to-criteria-to-letter work, in the US and at Pakistani panel hospitals. Any time figure is an estimate.
2. **Start the case (0:40-1:10).** As Priya: **New Case** → *Hamza Qureshi* → insurer **BlueRiver Health** → **Run Copilot**. The timeline streams.
3. **The checklist (1:10-2:20).** K2 is ❌ *"Only 4 weeks documented; policy requires at least 6."* Readiness is **60 (capped)**. Click the quote to highlight it in the chart.
4. **Insurer (RAG) moment (2:20-2:50).** Switch the insurer dropdown to **Indus Health** (a fictional Pakistani insurer that needs 4 weeks). The same chart turns green and readiness goes to 100. No code changed, only the retrieved policy.
5. **Fix and packet (2:50-3:30).** Switch back to BlueRiver, **Attach** the updated physiotherapy note (7 weeks). K2 turns ✅. Open **Review packet**: citation chips, Insurer Simulator, verifier, **Download PDF**.
6. **Trust (3:30-4:15).** **Analytics → Evaluation: Run** shows criteria accuracy, grounding rate, gap recall and the insurer effect on 6 labeled cases. **Approve & submit**, then show the entry in **Audit Log**.
7. **Impact and honesty (4:15-5:00).** Open the seeded denied case (Linda Park): drafted appeal with counter-evidence. Close with the honest limits below.

## Evaluation

```bash
npm --prefix backend run eval            # configured AI mode
npm --prefix backend run eval -- --rules # rule engine only
```

Six hand-labeled cases (8 weeks PT; 4 weeks vs an insurer needing 6; the same chart vs an insurer needing 4; vague PT history; no X-ray; red-flag exception). Results on the current build:

| Engine | Criteria accuracy | Grounding rate | Gap recall |
|---|---|---|---|
| Rules only (no LLM) | 100% (30/30) | 100% | 100% (5/5), 0 false gaps |
| Rules + Mistral `ministral-3b-2512` reviewer (default `MATCHER_AUTHORITY=rules`) | 100% (30/30), two runs | 100% | 100% (5/5), 0 false gaps |
| Mistral `ministral-3b-2512` deciding alone (`MATCHER_AUTHORITY=llm`) | 76.7% (23/30) | 100% | 80% (4/5), 4 false gaps |

The rule engine was written against these same synthetic charts, so its score is not a held-out result. Results also appear on the Analytics page.

## Readiness Score

The main score is a transparent checklist, not an approval probability: `100 × Σ weight(MET) / Σ weight(all)`, with required criteria weighted 2 and supporting criteria 1, UNCLEAR counting as half, and a cap of 60 if any required criterion is MISSING. The label never says "ready" while a required criterion is unmet. The logistic-regression model is still shown, collapsed and labeled **experimental**, because it was trained on synthetic outcomes.

## Other MVP features

- **Same patient, different insurer:** an insurer dropdown on the workspace and New Case form re-checks the same chart against another policy.
- **PDF export:** the packet page has **Download PDF** (letter, form, verified citation appendix, verification summary).
- **Local embeddings:** policy search uses `BAAI/bge-small-en-v1.5` through transformers.js, running locally with no key. The model downloads about 30 MB on first start and is then cached. Search falls back to TF-IDF while it loads (`EMBEDDINGS=off` disables it).
- **Labels:** SYNTHETIC PATIENT and MOCK POLICY badges in the workspace, and a banner on every PDF page.

## Architecture

```
frontend/  Next.js 16 (App Router), Tailwind, Recharts, lucide-react
  app/(app)/dashboard | cases | cases/new | cases/[id] | cases/[id]/packet | cases/[id]/appeal
           policies | analytics | audit | settings
  components/  AgentTimeline, CriteriaChecklist, ChartViewer, GapPanel, Insights (gauge, courtroom, verifier)

backend/   Node.js + Express 5, MongoDB (JSON-file fallback), Server-Sent Events
  src/agents/workflow.js        resumable agent graph with human pause points
  src/agents/intake.js          1. structured facts with verified quotes
  src/agents/coding.js          2. CPT / ICD-10 from a fixed lookup table
  src/agents/policyRag.js       3. TF-IDF retrieval over policy sections (payer/CPT filters)
  src/agents/matcher.js         4. MET / MISSING / UNCLEAR per criterion
  src/agents/gapCloser.js       5. targeted clinician questions + quick actions
  src/agents/packetWriter.js    6. Letter of Medical Necessity + auth form, cited
  src/agents/insurerSimulator.js 7. adversarial payer reviewer ⇄ rebuttal
  src/agents/verifier.js        8. independent audit, writer retries ≤ 2
  src/agents/denialPredictor.js 9. logistic regression + exact SHAP contributions
  src/agents/payerMock.js       10. mock payer portal decisions
  src/agents/appeal.js          11. denial classification, counter-evidence, appeal, P2P advice
  workflow.js → learn()         12. outcomes feed the predictor (retrain from Analytics)
```

### API

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Login, returns bearer token |
| GET | `/api/cases` | Case queue (filters: status, payer, risk, q) |
| POST | `/api/cases` | Create a case and start the agent graph (`cpt` from the catalog, or `cpt: "CUSTOM"` + `procedureName`) |
| POST | `/api/patients/:id/uploads` | Upload reports / scans (base64 JSON, ≤ 10 files, 15 MB each); read at the next copilot run |
| GET | `/api/documents/:id/file` | Original uploaded file |
| GET | `/api/cases/:id` | Full case state |
| GET | `/api/cases/:id/events` | SSE stream of agent progress |
| POST | `/api/cases/:id/gaps/:gapId/resolve` | Attach document / add note / N/A / confirm not done |
| GET/PUT | `/api/cases/:id/packet` | Packet, verifier, prediction / save human edits (re-verifies) |
| POST | `/api/cases/:id/adversarial-review` | Re-run the Insurer Simulator |
| POST | `/api/cases/:id/approve` · `/reject` · `/request-changes` | Human decisions |
| POST | `/api/cases/:id/denial` | Record a pasted denial letter, triggers the Appeal Agent |
| PUT/POST | `/api/cases/:id/appeal` · `/appeal/submit` | Edit / submit appeal |
| GET | `/api/policies?q=` | Policy library + retrieval search |
| GET | `/api/analytics/summary` · `/api/analytics` | KPIs and charts |
| POST | `/api/analytics/retrain` | Retrain the denial predictor (manager) |
| GET/POST | `/api/insurers` · `/api/insurers/coverage-check` | Real insurer plan terms / coverage lookup |
| POST | `/api/cases/:id/insurer` | Re-check the case against another insurer |
| GET | `/api/cases/:id/packet.pdf` | Download the packet as PDF |
| GET/POST | `/api/eval` · `/api/eval/run` | Latest evaluation / run it |
| GET | `/api/audit` | Append-only audit log |

## Honesty notes

- All patients, notes, payer policies and historical outcomes are **synthetic**. Policies are simplified mock documents, not real payer policies.
- The denial predictor is trained on synthetic history generated from known rules; its AUC shows the pipeline works, not real-world accuracy.
- "45 → 5 minutes" uses an industry estimate for the manual baseline and an estimated review time; the measured number is the agents' processing time.
- This is decision support for administrative staff. It does not diagnose or order care.
