# AuthProof: Project Documentation

*Formerly "Prior Auth Copilot".*

> **Catch the denial before the insurer does.**
> AI agents that check every insurance pre-approval request against the insurer's own rules, with cited evidence, before it is submitted. A human approves every submission.

**Team:** Ctrl+Alt+Defeat · **Event:** Build With AI, AICON'26 · **Domain:** Health Operations

---

## Contents

1. [Overview](#1-overview)
2. [The problem](#2-the-problem)
3. [The solution at a glance](#3-the-solution-at-a-glance)
4. [Data and inputs](#4-data-and-inputs)
5. [How it works, step by step](#5-how-it-works-step-by-step)
6. [Where AI is used, and how it is kept honest](#6-where-ai-is-used-and-how-it-is-kept-honest)
7. [What the user receives](#7-what-the-user-receives)
8. [Users, roles and demo accounts](#8-users-roles-and-demo-accounts)
9. [Procedures and payer policies](#9-procedures-and-payer-policies)
10. [Insurers: real Pakistani plans and mock payers](#10-insurers-real-pakistani-plans-and-mock-payers)
11. [Uploading reports and scans](#11-uploading-reports-and-scans)
12. [Readiness Score and the experimental predictor](#12-readiness-score-and-the-experimental-predictor)
13. [Case lifecycle](#13-case-lifecycle)
14. [Results, evaluation and testing](#14-results-evaluation-and-testing)
15. [Architecture and tech stack](#15-architecture-and-tech-stack)
16. [Data storage](#16-data-storage)
17. [API reference](#17-api-reference)
18. [Configuration](#18-configuration)
19. [Running locally](#19-running-locally)
20. [Deployment](#20-deployment)
21. [Demo script (3 to 4 minutes)](#21-demo-script-3-to-4-minutes)
22. [Impact](#22-impact)
23. [Safety, honesty and limitations](#23-safety-honesty-and-limitations)
24. [Roadmap](#24-roadmap)
25. [Troubleshooting](#25-troubleshooting)

---

## 1. Overview

Before an expensive test, surgery or treatment, most insurers require **prior authorization** (pre-approval). Hospital staff must read the patient's chart, find the insurer's rules for that procedure, prove each rule with evidence, and write a Letter of Medical Necessity. If a single piece of proof is missing, the request is rejected and the cycle starts again.

AuthProof is a **dashboard web app** (not a chatbot) in which a team of AI agents does this work, live and step by step:

- reads the chart and any uploaded reports, scans or phone photos,
- retrieves the insurer's policy for the requested procedure,
- marks every policy criterion **Met / Missing / Unclear** with a word-for-word quote from the chart,
- turns each gap into one clear question for the right clinician,
- drafts a cited letter and form, lets a simulated insurer try to reject it, and verifies every citation,
- waits for a human to approve, submits to a (mock) insurer portal, and drafts an appeal if it is denied.

| Key facts | |
|---|---|
| Procedures | Any. 19 in the catalog across 8 policy families, plus any procedure typed by name |
| Insurers | 9 (5 real Pakistani plans with public coverage terms, 4 mock payers) |
| Policies | 72 (every insurer has all 8 policy families) |
| Demo patients | 20 synthetic patients, 10 seeded cases covering every status |
| AI providers | Claude, Mistral, Groq or a local Ollama model; fully offline rule engine as fallback |
| Storage | MongoDB (Atlas or local) with GridFS for uploads; local JSON file fallback |
| Tests | 93 automated end-to-end checks; 6-case labeled evaluation set |

---

## 2. The problem

**What happens today**

1. Staff read the chart: visit notes, therapy records, test results, history.
2. They find the insurer's rules for this procedure (different for every insurer and procedure).
3. They match each requirement to proof in the chart.
4. They write the Letter of Medical Necessity and fill in the forms, then submit and wait.

One missing piece of proof means **rejection**, and the whole cycle restarts. Often the care was medically necessary; the paperwork was incomplete.

**Who it hurts**

| Group | Effect |
|---|---|
| Hospital staff | An estimated 30 to 45 minutes of manual work per request (industry estimate, not our measurement) |
| Patients | Treatment waits while forms go back and forth |
| Hospitals | Revenue lost to rejections that complete paperwork would have prevented |

**Local relevance.** Prior authorization is most studied in the US, but in Pakistan private and corporate health insurers also require pre-approval at panel hospitals for admissions and costly procedures (for example, Jubilee Life's Royale Plan requires authorization 48 hours before a planned admission). The same chart-to-rules-to-letter work is done by hand.

**Core insight:** many rejections are *documentation gaps*, not unnecessary care. The proof often exists in the chart, or can be added, but nobody catches the gap before submission.

---

## 3. The solution at a glance

```
 Uploads (PDF, scan, photo)
        │
 0. Report Reader ─► 1. Intake ─► 2. Coding ─► 2b. Coverage Check ─► 3. Policy Finder (RAG)
                                                                            │
                         ┌──────────────────────────────────────────────────┘
                         ▼
 4. Criteria Matcher ─► gaps? ─► 5. Gap-Closer ─► (clinician answers) ─► re-run
                         │ no gaps
                         ▼
 6. Packet Writer ─► 7. Insurer Simulator ⇄ rebuttal ─► 8. Verifier (writer retries ≤ 2)
                         │
                         ▼
 9. Readiness Score ─► 10. Human approval ─► Submission ─► Payer decision
                                                               │ denied
                                                               ▼
                                              11. Appeal Agent ─► human ─► appeal decision
                                                               │
                                                               ▼
                                              12. Learning loop (outcome logged)
```

Every step streams to the case timeline in real time (Server-Sent Events) and is written to an **append-only audit log**.

**Differentiators**

1. **Gaps caught before submission**, not just paperwork automation.
2. **Verifiable citations:** every clinical claim maps to a verbatim chart quote, enforced in code.
3. **Same patient, different insurer, different result**, because rules come from retrieved policies, not hard-coded logic.
4. **An AI insurer that argues back** before the real one sees the packet.
5. **Human-in-the-loop** with a full audit trail.
6. **Any procedure, any document:** heart surgery to MRI, typed text to phone photos of reports.

---

## 4. Data and inputs

| Input | What it contains | Where it comes from |
|---|---|---|
| Patient chart | Visit notes, therapy notes, history, medications, exam findings | Synthetic demo charts, a pasted note for a new patient, or uploads |
| Reports and scans | Lab results, ECG, echo, angiography, X-ray/CT/MRI reports, pathology, discharge summaries, prescriptions | Uploaded as PDF, JPG, PNG, WEBP, DOCX or TXT (up to 10 files, 15 MB each) |
| Insurer policy | Approval criteria per procedure family, plus real plan coverage terms for Pakistani insurers | `backend/src/data/policies.js`, `backend/src/data/insurers.js` |
| The order | Procedure (from the catalog or typed by name), insurer, care setting (outpatient / day-care / inpatient), urgency, clinical reason | Entered on **New Case** |
| Code tables | CPT procedures and ICD-10-CM diagnoses | `backend/src/data/codes.js` (the coding agent may only pick codes from here) |

All patients, chart notes and outcome history are **synthetic**. No real patient data is used.

---

## 5. How it works, step by step

| # | Agent | What it does | AI or rules |
|---|---|---|---|
| 0 | **Report Reader** | Turns each uploaded file into chart text, classifies the report and lists key findings. Screens out uploads that are not clinical records of this patient | AI vision / LLM, with offline OCR and keyword fallback |
| 1 | **Intake** | Extracts structured facts (diagnosis, symptoms, prior treatment with duration and outcome, imaging, test results, medications, exam findings, red flags), each with a verbatim quote | LLM, rule fallback |
| 2 | **Coding** | Maps the order and documented diagnoses to CPT and ICD-10 codes from the fixed table; never codes "suspected" or "rule out" diagnoses (ICD-10-CM outpatient rule) | Rules |
| 2b | **Coverage Check** | For real insurers: checks benefit scope (outpatient test / day-care / inpatient), plan exclusions, age limit, inadmissible conditions, waiting period, pre-authorization timing and network, each citing the insurer's document | Rules over published plan terms |
| 3 | **Policy Finder (RAG)** | Retrieves the insurer's procedure-specific policy, or its general medical-necessity policy for anything else; ranks policy sections by semantic search (local `bge-small` embeddings, TF-IDF fallback) | Embeddings + retrieval |
| 4 | **Criteria Matcher** | Marks each criterion MET / MISSING / UNCLEAR with evidence. Rules check durations, thresholds (e.g. BMI ≥ 40), negation and "tried and failed"; the LLM reviews every criterion independently | Rules + LLM reviewer |
| 5 | **Gap-Closer** | Turns each required MISSING/UNCLEAR criterion into one specific question for the right person, with quick actions: attach document (or upload a report), add note, not applicable, confirm not done | Rules |
| 6 | **Packet Writer** | Drafts the Letter of Medical Necessity and auth form; every clinical sentence ends with a citation `[n]` to a verified quote | LLM (hybrid), rule fallback |
| 7 | **Insurer Simulator** | Plays the insurer's medical reviewer and tries to deny the packet, citing policy sections; the copilot answers with evidence or opens a gap (up to 3 rounds) | LLM, rule fallback |
| 8 | **Verifier** | Independent audit: every citation resolves to a real quote, every required criterion is addressed, codes are consistent, patient identity matches across documents; fixable issues go back to the writer (≤ 2 retries) | Code checks + LLM audit |
| 9 | **Readiness Score** | Transparent checklist score 0 to 100 with the top fixes (section 12) | Rules |
| 10 | **Human approval** | The coordinator reviews, edits, approves, rejects or requests changes. Nothing is submitted without this | Person |
| — | **Payer portal (mock)** | Decides using the payer's own policy; a non-covered benefit is rejected as "Not a covered benefit" | Rules |
| 11 | **Appeal Agent** | Classifies the denial reason, searches the current chart for counter-evidence, drafts the appeal and advises whether a peer-to-peer call is worth it | LLM, rule fallback |
| 12 | **Learning loop** | Logs each outcome as a training example for the experimental predictor (retrained from Analytics) | Logistic regression |

**Re-runs.** When a clinician answers a gap, uploads a report, or the coordinator switches the insurer, the copilot re-runs from the right step automatically.

---

## 6. Where AI is used, and how it is kept honest

**What the AI does**

- Reads scanned reports and phone photos (vision).
- Extracts clinical facts with exact quotes.
- Judges evidence against each insurer rule (as an independent reviewer).
- Writes the Medical Necessity section of the letter.
- Argues as the insurer to find weak spots, and drafts appeals.

**Guardrails, enforced in code**

| Guardrail | How |
|---|---|
| Evidence or it did not happen | Every quote from a model is located in the chart text (`backend/src/utils/text.js`). Unverifiable quotes are dropped; a MET verdict without a verified quote becomes UNCLEAR |
| Letter cannot invent facts | The writer may only reference pre-verified evidence ids; sentences citing anything else are removed |
| No made-up insurer rules | Simulated insurer objections without a real policy section are discarded |
| Relevance gate on uploads | Files that are not clinical records, or that name a different patient, never enter the chart (overridable by a coordinator, audited) |
| Disputes go to a person | If keyword rules find "evidence" but the AI reviewer says MISSING, the criterion becomes UNCLEAR, marked **AI disputed**, and opens a gap |
| The AI cannot clear a gap alone | A rule MISSING/UNCLEAR is never upgraded to MET by the model |
| Whole-word matching | Keyword rules match at word boundaries ("exam" does not match "examples"); document title lines are not evidence |
| Human approval | A coordinator approves every submission; approving a verifier FAIL requires explicit acknowledgement |
| Audit trail | Every agent output and human action is appended to `audit_log` (insert-only; no update or delete path) |
| Fallback | If an LLM call fails, the agent uses its rule engine and the timeline says so |

**Matcher authority** (`MATCHER_AUTHORITY`):

- `rules` (default): rules decide; the LLM reviewer can only downgrade a disputed MET to UNCLEAR. Best for small models.
- `llm`: the LLM's verdicts are used directly (recommended for large models).

**Letter style** (`LETTER_STYLE`): `hybrid` (default) builds clinical sections from verified quotes and lets the model write only the Medical Necessity paragraph; `full` lets the model write every section (the verifier then audits it).

---

## 7. What the user receives

**In the case workspace**

- The patient chart with every cited quote highlighted (click a criterion to jump to its evidence).
- A criteria checklist: each insurer rule Met / Missing / Unclear, with confidence, reasoning and the exact quote.
- Gap cards: one clear question per missing item, assigned to the physician, coordinator or records, with one-click actions.
- The Readiness Score gauge with the top fixes, and the coverage check against real plan terms.
- A live agent timeline showing each step as it runs.
- Uploaded reports with how they were read, the report type, key findings (abnormal values flagged) and a link to the original file.

**In the packet**

- A Letter of Medical Necessity with clickable citation chips, editable by staff (re-verified on save).
- A prior-authorization form pre-filled from structured data.
- The Insurer Simulator "courtroom" (objections and rebuttals) and the verifier report.
- **Download PDF:** letter, form, verified citation appendix and verification summary.

**After a denial**

- The classified denial reason, counter-evidence per disputed criterion, a drafted appeal letter and peer-to-peer advice.

**For managers**

- Dashboard KPIs (open cases, average readiness, estimated time saved, rejections caught), analytics, payer statistics (mock payers only), evaluation results, predictor retraining and the audit log.

**App pages**

| Route | Page |
|---|---|
| `/` | Landing page |
| `/login` | Sign in with one-click demo accounts |
| `/dashboard` | Workload KPIs, attention queue, pipeline, requests per day |
| `/cases` | Case queue with filters |
| `/cases/new` | New case: patient, reports upload, procedure, insurer |
| `/cases/[id]` | Case workspace: chart, criteria, gaps, readiness, timeline |
| `/cases/[id]/packet` | Packet review, courtroom, verifier, approve, PDF |
| `/cases/[id]/appeal` | Denial and appeal |
| `/policies` | Policy library and semantic search |
| `/insurers` | Real insurer plan terms and "is this covered?" lookup |
| `/analytics` | Analytics, evaluation, predictor |
| `/audit` | Append-only audit log |
| `/settings` | AI mode, storage, demo reset |

---

## 8. Users, roles and demo accounts

Password for all demo accounts: `demo123`.

| Account | Role | Can do |
|---|---|---|
| priya@demo.health | PA Coordinator | Create cases, upload reports, edit/approve/reject packets, record denials, submit appeals |
| khan@demo.health | Ordering Physician | Answer documentation gaps, upload reports, edit letters |
| sara@demo.health | Revenue Cycle Manager | Analytics, retrain predictor, audit log, reset demo data |

---

## 9. Procedures and payer policies

| Policy family | Procedures (CPT) | What the criteria check |
|---|---|---|
| Knee MRI | 73721 | Knee symptoms, weeks of physiotherapy with failure, NSAID trial, recent X-ray, exam findings |
| Lumbar MRI | 72148 | Back pain, red flag **or** weeks of failed therapy, neuro exam, medication trial, X-ray |
| Cardiac surgery | CABG 33533, AVR 33405, TAVR 33361 | Angiography/echo confirmation, symptoms or ischemia, high-risk anatomy **or** failed medical therapy, heart-team risk score, pre-op tests |
| Cardiac intervention | Cath 93458, PCI 92928 | Symptoms, ACS **or** positive stress test, medical therapy (weeks vary by payer), ECG, renal function |
| Joint replacement | TKA 27447, THA 27130 | Advanced arthritis on X-ray, functional limitation, weeks of conservative care, medical clearance, BMI |
| Oncology | Chemo 96413, PET-CT 78815 | Pathology, stage, oncologist or tumour-board plan, performance status, baseline labs |
| Bariatric | Gastric bypass 43644 | BMI threshold, comorbidities, supervised weight-loss program, psychology clearance, nutrition review |
| General medical necessity | Brain MRI 70553, CT 74177, echo 93306, lap chole 47562, colonoscopy 45378, hysterectomy 58150, cataract 66984, and **any procedure typed by name** | Diagnosis, objective findings, prior treatment or reason it is not appropriate, clinician recommendation, pre-procedure assessment |

**Payer strictness differs**, which is what makes "same patient, different insurer" work. Examples: knee MRI physiotherapy (BlueRiver 6 weeks, Northstar 8, Indus Health 4); joint replacement conservative care (Medicare 12 weeks, Indus Health 6); bariatric BMI (40, or 37.5 at Indus Health, an Asian threshold).

Policies are defined in code and refreshed in the database on every API start. CPT descriptions are our own plain-language wording (demo only; verify before real use).

---

## 10. Insurers: real Pakistani plans and mock payers

**Real plans** (coverage terms from each insurer's public documents, retrieved 10 Oct 2026):

| Insurer / plan | Source | Notable terms used |
|---|---|---|
| Jubilee Life: Royale Plan | [brochure PDF](https://www.jubileelife.com/assets/documents/Royale_Plan.pdf) | Outpatient services excluded; 48-hour pre-authorization for planned admissions, 24 hours for emergencies; 60-day waiting period; obesity treatment excluded |
| EFU Life: Mukammal Sehat | [brochure PDF](https://www.efulife.com/assets/documents/Mukammal-Sehat-Plan-Brochure.pdf) | Specialized investigations (MRI, CT, PET, echo) and day-care procedures covered; pre-existing cancer and HIV/AIDS inadmissible |
| State Life: Sahara Family Health | [product page](https://www.statelife.com.pk/en/product/protect-your-health/sahara-family-health) | Investigations covered only within 30 days of a covered admission; day-care (chemotherapy, dialysis) covered |
| Adamjee Insurance: Health | [product page](https://www.adamjeeinsurance.com/health-insurance) | Outpatient and specialized investigations excluded; maximum age 60 |
| Sehat Card Plus (KP Government) | [programme site](https://sehatsahulat.com.pk/) | Inpatient programme; outpatient not covered |

**Mock payers** (written for the demo): Medicare (demo LCD), BlueRiver Health, Northstar Insurance, and **Indus Health**, a fictional Pakistani panel-hospital insurer.

**Honesty limits:** none of these insurers publish clinical criteria, so their clinical checklist is a labeled demo template. Synthetic outcome statistics only ever describe mock payers, never real companies. Plans change; verify with the insurer.

A non-covered benefit becomes a coordinator gap ("Written authorization obtained" or "Proceed anyway"), caps readiness at 40, and is rejected by the mock portal as "Not a covered benefit".

---

## 11. Uploading reports and scans

Upload on **New Case**, with **Add reports** on the chart, or with **Attach document** on a gap. Files are stored as-is, then read by the Report Reader at the start of the next copilot run.

| File | How it is read |
|---|---|
| TXT, DOCX, PDF with a text layer | Text extracted directly |
| Scanned PDF, photo, image | AI vision transcription (Claude reads PDFs natively; other providers get page images). Without an LLM: offline OCR (Tesseract) |

Each report then gets a type (lab, ECG, echo, angiography, pathology, imaging, discharge summary, prescription, clinical note), a short summary and key findings (abnormal values flagged). A finding is kept only if its quote exists in the transcription.

**Relevance gate.** A file enters the chart only if it is a clinical record of this patient:

- With an LLM: the model decides whether it is a medical record, whose name is printed on it, and whether it is relevant to the requested service.
- Without an LLM: a medical-vocabulary check (seeded clinical records score 4 or more term groups; a slide deck scores 0; threshold 3).
- A printed patient name that differs from the patient's name excludes the file.

Excluded files stay visible with the reason; a coordinator can choose **Add to chart anyway** (audited). Low-quality reads are flagged so staff check them against the original.

---

## 12. Readiness Score and the experimental predictor

The main score is a **transparent checklist**, not an approval probability:

```
score = 100 × Σ weight(MET) / Σ weight(all criteria)
weight: required = 2, supporting = 1;  UNCLEAR counts as half;  NOT_APPLICABLE excluded
cap at 60 if any required criterion is MISSING
cap at 40 if the service is not a covered benefit (unless written authorization is recorded)
```

The label never says "Ready" while a required criterion is unmet.

An **experimental** logistic-regression denial predictor (with exact per-feature contributions) is shown collapsed and labeled as such, because it is trained on synthetic outcome history generated from known rules. Its AUC shows the pipeline works, not real-world accuracy.

---

## 13. Case lifecycle

```
DRAFT → READING_REPORTS → INTAKE → CRITERIA_CHECK → NEEDS_INFO ⇄ (clinician answers)
      → PACKET_DRAFTING → ADVERSARIAL_REVIEW → READY_FOR_REVIEW
      → APPROVED_BY_HUMAN → SUBMITTED → APPROVED | DENIED
      → DENIED → APPEAL_DRAFTED → APPEAL_SUBMITTED → OVERTURNED | UPHELD
Other: REJECTED (by the coordinator), ERROR
```

Cases interrupted by a server restart resume automatically.

---

## 14. Results, evaluation and testing

**Evaluation set:** 6 hand-labeled cases (8 weeks of physio; 4 weeks vs an insurer needing 6; the same chart vs an insurer needing 4; vague physio history; no X-ray; red-flag exception).

| Engine | Criteria accuracy | Grounding rate | Gap recall |
|---|---|---|---|
| Rules only (offline) | 100% (30/30) | 100% (40/40 cited quotes verbatim) | 100% (5/5), 0 false gaps |
| Rules + Mistral `ministral-3b-2512` reviewer (default) | 100% (30/30), two runs | 100% | 100% (5/5), 0 false gaps |

The rule engine was written against these same synthetic charts, so this is not a held-out result.

**Automated tests:** `npm --prefix backend test` runs **93 end-to-end checks** on a throwaway database (your data and your MongoDB are never touched). They cover criteria matching on every patient, coding rules, coverage checks for every real insurer, seeded cases, gap closing, insurer switching, non-covered benefits, human-review safeguards, appeals, any-procedure cases, uploads, the relevance gate, evaluation, retrieval, PDF export and the audit log.

```bash
npm --prefix backend test                 # 93 checks
npm --prefix backend run eval             # evaluation with the configured AI
npm --prefix backend run eval -- --rules  # rule engine only
```

---

## 15. Architecture and tech stack

```
frontend/  Next.js 16 (App Router), React 19, Tailwind CSS, Motion, Recharts, lucide-react
backend/   Node.js + Express 5, Server-Sent Events, MongoDB driver (GridFS), pdf-lib,
           unpdf + @napi-rs/canvas (PDF text and page images), tesseract.js (offline OCR),
           mammoth (DOCX), @huggingface/transformers (local bge-small embeddings),
           @anthropic-ai/sdk, OpenAI-compatible calls for Mistral and Groq, Ollama HTTP
```

**Repository layout**

```
backend/src/
  server.js              REST API, SSE, uploads, startup sync of policies
  db.js                  in-memory state persisted to MongoDB or data/db.json
  files.js               original uploads (GridFS or data/uploads/)
  llm.js                 provider wrapper: Claude, Mistral, Groq, Ollama, vision, JSON schema
  auth.js events.js      bearer-token sessions; timeline events + append-only audit
  pdf.js                 packet PDF export
  analytics.js           KPIs and charts
  evaluate.js selftest.js dbcheck.js seed.js
  agents/
    workflow.js          the resumable agent graph and human actions
    reader.js            0  Report Reader + relevance gate
    intake.js            1  Intake
    coding.js            2  Coding
    coverage.js          2b Coverage Check
    policyRag.js         3  Policy Finder (RAG)
    matcher.js           4  Criteria Matcher
    gapCloser.js         5  Gap-Closer
    packetWriter.js      6  Packet Writer
    insurerSimulator.js  7  Insurer Simulator
    verifier.js          8  Verifier
    readiness.js         9  Readiness Score
    denialPredictor.js      experimental predictor
    payerMock.js            mock payer portal
    appeal.js            11 Appeal Agent
  data/
    codes.js             CPT procedures, ICD-10 table, denial classes
    policies.js          72 payer policies (8 families × 9 payers)
    insurers.js          real Pakistani plan terms with sources
    patients.js          20 synthetic patients and their chart documents
  utils/text.js          sentence splitting, verbatim quote validation, negation, durations

frontend/
  app/                   landing, login, and the (app) pages listed in section 7
  components/            ChartViewer, CriteriaChecklist, GapPanel, AgentTimeline, Insights,
                         ReportUploader, CoveragePanel, EvalPanel, charts, ui, Logo, landing/*
  lib/                   api client (incl. uploads), auth context, formatting
```

---

## 16. Data storage

With `MONGODB_URI` set, MongoDB is the system of record; otherwise everything is stored in `backend/data/db.json`. The app keeps a working copy in memory and writes only changed documents after each action.

| Collection | Contents |
|---|---|
| `users`, `sessions` | Demo accounts and login tokens |
| `patients`, `documents` | Synthetic patients, chart notes, uploaded reports (text, analysis, read status) |
| `policies`, `policy_chunks` | Payer policies, and policy sections with 384-dimension bge-small embeddings |
| `cases` | Each case with facts, coding, coverage, criteria, gaps, packet, simulator, verifier, readiness and timeline embedded |
| `audit_log` | Append-only: the code only ever inserts |
| `outcome_history` | Synthetic plus live outcomes for analytics and the learning loop |
| `settings` | Predictor model, counters, seed metadata |
| `uploads.files`, `uploads.chunks` | GridFS: original uploaded files |

The demo data is seeded automatically on first start. Reset with `npm run seed` or **Settings → Reset demo data** (manager).

---

## 17. API reference

All endpoints except health and login require `Authorization: Bearer <token>` (SSE and file links accept `?token=`).

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Status, AI mode, storage |
| GET | `/api/meta` | AI mode, storage, embeddings, procedures, payers |
| POST | `/api/auth/login` · `/api/auth/logout` · GET `/api/auth/me` | Session |
| GET / POST | `/api/patients` · GET `/api/patients/:id` | List, create (note optional), get with chart |
| POST | `/api/patients/:id/uploads` | Upload reports / scans (base64 JSON, ≤ 10 files, 15 MB each) |
| GET | `/api/documents/:id/file` | Original uploaded file |
| GET / POST | `/api/cases` | Case queue (filters: status, payer, risk, q) / create a case (`cpt` from the catalog, or `cpt: "CUSTOM"` + `procedureName`) |
| GET | `/api/cases/:id` | Full case state incl. documents and uploads |
| GET | `/api/cases/:id/events` | SSE stream of agent progress |
| POST | `/api/cases/:id/rerun` | Re-run the copilot |
| POST | `/api/cases/:id/insurer` | Re-check the same chart against another insurer |
| POST | `/api/cases/:id/gaps/:gapId/resolve` | Attach document(s) / add note / not applicable / confirm not done |
| POST | `/api/cases/:id/gaps/skip` | Proceed without the missing evidence |
| POST | `/api/cases/:id/documents/:docId/include` | Add an excluded upload to the chart anyway |
| GET / PUT | `/api/cases/:id/packet` | Packet, verifier, readiness / save human edits (re-verified) |
| GET | `/api/cases/:id/packet.pdf` | Download the packet as PDF |
| POST | `/api/cases/:id/adversarial-review` | Re-run the Insurer Simulator |
| POST | `/api/cases/:id/approve` · `/reject` · `/request-changes` | Human decisions |
| POST | `/api/cases/:id/denial` | Record a pasted denial letter (triggers the Appeal Agent) |
| POST · PUT · POST | `/api/cases/:id/appeal/draft` · `/appeal` · `/appeal/submit` | Draft / edit / submit the appeal |
| GET | `/api/policies` · `/api/policies/:id` | Policy library + search / one policy |
| GET · POST | `/api/insurers` · `/api/insurers/coverage-check` | Real plan terms / coverage lookup |
| GET · POST | `/api/eval` · `/api/eval/run` | Latest evaluation / run it |
| GET | `/api/analytics/summary` · `/api/analytics` | KPIs and charts |
| POST | `/api/analytics/retrain` | Retrain the predictor (manager) |
| GET | `/api/audit` | Append-only audit log |
| POST | `/api/admin/reset` | Reset demo data (manager) |

---

## 18. Configuration

**Backend** (`backend/.env`, see `backend/.env.example`; every value is optional):

| Variable | Purpose | Default |
|---|---|---|
| `PORT` | API port | 4000 |
| `MONGODB_URI`, `MONGODB_DB` | MongoDB connection (empty = local JSON store) | empty, `prior_auth_copilot` |
| `LLM_PROVIDER` | `auto` / `mistral` / `claude` / `groq` / `ollama` / `rules` (alias `AI_PROVIDER`) | `auto` |
| `MISTRAL_API_KEY`, `MISTRAL_MODEL` | Mistral | `ministral-3b-2512` |
| `GROQ_API_KEY`, `GROQ_MODEL`, `GROQ_JSON_MODE` | Groq | `openai/gpt-oss-120b`, `schema` |
| `ANTHROPIC_API_KEY`, `CLAUDE_MODEL` | Claude | `claude-opus-5-5` |
| `OLLAMA_URL`, `OLLAMA_MODEL`, `OLLAMA_VISION_MODEL` | Local Ollama models | `http://localhost:11434`, `qwen2.5:7b-instruct`, `qwen2.5vl:7b` |
| `VISION_MODEL` | Override the model that reads scans | provider default |
| `MATCHER_AUTHORITY` | `rules` or `llm` (section 6) | `rules` |
| `LETTER_STYLE` | `hybrid` or `full` | `hybrid` |
| `EMBEDDINGS` | `off` = TF-IDF search only | on |
| `PIPELINE_STEP_DELAY_MS` | Pause between agent steps (readable timeline) | 500 |
| `PAYER_DECISION_DELAY_MS` | Mock payer decision delay | 3000 |
| `ESTIMATED_MANUAL_MINUTES_PER_PACKET` | Baseline for the "time saved" estimate | 45 |
| `CORS_ORIGIN` | Allowed frontend origins, comma-separated (empty = any) | empty |

**Frontend** (`frontend/.env.local`, see `frontend/.env.example`):

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend URL. Inlined at **build time**: set it before `npm run build` |

---

## 19. Running locally

Requirements: Node.js 20.9 or newer.

```bash
npm run setup      # installs root, backend and frontend dependencies
npm run dev        # API on http://localhost:4000, web app on http://localhost:3000
npm run db:check   # optional: test the MongoDB connection (prints host and collection counts)
```

Open http://localhost:3000, click **Open the demo**, and pick a demo account. Without any keys, the app runs fully offline on the rule engine and the local JSON store.

**MongoDB Atlas:** create a free M0 cluster, add a database user, allow your IP (or `0.0.0.0/0` for a demo), copy the connection string into `MONGODB_URI`, run `npm run db:check`, then restart the API (it seeds itself). If `mongodb+srv://` times out on your network, use the standard `mongodb://host1,host2,host3/?tls=true&authSource=admin&replicaSet=...` address from Atlas (older driver version under Connect → Drivers).

---

## 20. Deployment

The **frontend** deploys to Vercel. The **backend** is a long-running Express server (in-memory state, SSE streams, background agents, file uploads), so it needs an always-on Node host such as Render or Railway, not serverless functions.

1. **MongoDB Atlas:** create a cluster and user, allow `0.0.0.0/0`, copy the connection string.
2. **Backend on Render:** New Web Service from the repo; Root Directory `backend`; Build `npm ci`; Start `npm start`; Health Check `/api/health`. Environment: `MONGODB_URI`, `MONGODB_DB`, `LLM_PROVIDER`, the provider key and model, `PIPELINE_STEP_DELAY_MS`. Render sets `PORT`.
3. **Frontend on Vercel:** import the repo; Root Directory `frontend`; add `NEXT_PUBLIC_API_URL=https://<backend>.onrender.com`; deploy.
4. **CORS:** set `CORS_ORIGIN=https://<your-app>.vercel.app` on the backend and redeploy.
5. **Check:** open the Vercel URL, sign in as Priya, run a case and watch the live timeline.

**Other hosts:** `frontend/Dockerfile` builds a standalone production image (`docker build --build-arg NEXT_PUBLIC_API_URL=... -t pac-frontend frontend`). `npm run build` also produces `.next/standalone` (run with `npm run start:standalone`).

**Notes:** changing `NEXT_PUBLIC_API_URL` requires a frontend redeploy. Render's free tier sleeps after about 15 minutes idle (first request about 50 seconds); open `/api/health` before a demo. The first boot downloads the 30 MB embedding model.

---

## 21. Demo script (3 to 4 minutes)

1. **Problem (30 s).** Pre-approval is manual chart-to-rules-to-letter work; one missing proof means rejection. Same at Pakistani panel hospitals. Any time figure is an estimate.
2. **Start the case (20 s).** As Priya: **New Case** → *Hamza Qureshi* → knee MRI → **BlueRiver Health** → **Run Copilot**. The agent timeline streams live.
3. **The catch (40 s).** K2 is **Missing**: "Only 4 weeks documented; policy requires at least 6." Readiness **60 (capped)**. Click the quote to highlight it in the chart.
4. **Same patient, different insurer (30 s).** Switch the insurer to **Indus Health** (needs 4 weeks). The same chart turns green, readiness **100**. No code changed, only the retrieved policy.
5. **Packet and trust (40 s).** Open **Review packet**: citation chips, the Insurer Simulator, the verifier, **Download PDF**. **Approve & submit**, then show the **Audit Log**.
6. **Any procedure, any document (optional, 20 s).** A heart-surgery case with an uploaded angiography photo read by AI vision.
7. **Impact and honesty (20 s).** Measured results; synthetic data and mock policies; next steps.

Reset the demo data (Settings, as Sara) before repeating the demo: attaching an outside record changes the chart permanently.

---

## 22. Impact

| | Today | With AuthProof |
|---|---|---|
| Missing proof | Found after the insurer rejects | Found before submission |
| Evidence | Searched for by hand | Every rule linked to an exact quote |
| New insurer | Learn its rules again | Its policy is retrieved; recheck in one click |
| Denials | Start the cycle over | Appeal drafted with counter-evidence |
| Trust | Hard to audit | Cited, verified, human-approved, logged |

Expected outcomes: fewer preventable rejections, patients treated sooner, and less staff time per request (the dashboard reports an estimated baseline vs. measured agent time; time savings remain an estimate until piloted).

---

## 23. Safety, honesty and limitations

- **Synthetic data only.** All patients, notes and outcome history are synthetic. Mock payer policies were written for the demo; real insurer clinical checklists are labeled demo templates.
- **Decision support, not care.** The system supports administrative staff. It does not diagnose or order care.
- **Measured on our own cases.** The evaluation set was written by us, and the rule engine was developed against it; this is not a held-out clinical validation.
- **Experimental predictor.** Trained on synthetic history; shown collapsed and labeled experimental.
- **Codes are a demo subset.** CPT descriptions are our own wording; verify every code before real use.
- **Privacy in production** would require de-identification before any LLM call, a vendor agreement or a self-hosted model (the Ollama path), and encryption at rest.
- **Labels in the UI:** SYNTHETIC PATIENT and MOCK POLICY badges in the workspace, and a banner on every PDF page.

---

## 24. Roadmap

- Ingest real insurer policy documents (PDF to structured criteria).
- Integrate with hospital systems via HL7 FHIR (and payer prior-auth APIs).
- Pilot with a panel hospital in Pakistan and measure real turnaround and rejection rates.
- Train the denial predictor on real outcome data.
- Point-of-care gap prevention during the visit, peer-to-peer call rehearsal, and an Urdu patient status portal.

---

## 25. Troubleshooting

| Symptom | Fix |
|---|---|
| "Cannot reach the API" on login | Backend not running, asleep (free hosting), or `NEXT_PUBLIC_API_URL` wrong. Check `/api/health` |
| API exits with "Could not connect to MongoDB" | Check user/password (URL-encode special characters), Atlas Network Access, or use the non-SRV address; `npm run db:check` explains which |
| Timeline says "falling back to rules" | LLM key missing, out of credit or model unavailable; the rule engine continued |
| An upload shows "not added to the chart" | The relevance gate judged it non-clinical or another patient's; check the reason, then **Add to chart anyway** if it is correct |
| A scan reads poorly | Low-confidence OCR is flagged; compare with the original, or paste the text with **Add note** |
| A demo step no longer behaves as expected | Reset demo data (Settings, as the manager) |
| Changed `NEXT_PUBLIC_API_URL` has no effect | It is baked in at build time: rebuild / redeploy the frontend |
