# Prior Auth Copilot: Innovation Features
### New features that turn it from "paperwork automation" into an AI that argues your case

> **New one-liner:** Before you submit, our AI argues with a simulated insurer and keeps fixing the packet until there's no valid reason left to deny it. It also catches documentation gaps while the patient is still in the room.

This document extends [PRIOR_AUTH_COPILOT.md](PRIOR_AUTH_COPILOT.md). It covers only what is **new or changed**. Everything else (stack, schema, safety model) stays as described there.

---

## Table of Contents

1. [Why These Features](#1-why-these-features)
2. [Feature Priority Map](#2-feature-priority-map)
3. [Feature 1: Insurer Simulator (Adversarial Review)](#3-feature-1-insurer-simulator-adversarial-review) ⭐ Hero
4. [Feature 2: Point-of-Care Gap Prevention](#4-feature-2-point-of-care-gap-prevention) ⭐
5. [Feature 3: Peer-to-Peer Voice Rehearsal](#5-feature-3-peer-to-peer-voice-rehearsal)
6. [Feature 4: Payer Accountability Engine](#6-feature-4-payer-accountability-engine)
7. [Feature 5: Patient Portal](#7-feature-5-patient-portal)
8. [Feature 6: Covered Alternative Finder](#8-feature-6-covered-alternative-finder)
9. [Feature 7: Messy Document Intake (Fax and Scan OCR)](#9-feature-7-messy-document-intake-fax-and-scan-ocr)
10. [Optional: Local Market Track (Pakistan / South Asia)](#10-optional-local-market-track-pakistan--south-asia)
11. [Updated Workflow](#11-updated-workflow)
12. [Fixes to the Original Plan](#12-fixes-to-the-original-plan)
13. [New Pages, APIs and Tables](#13-new-pages-apis-and-tables)
14. [Revised 48-Hour Build Plan](#14-revised-48-hour-build-plan)
15. [Revised Demo Script (3 Minutes)](#15-revised-demo-script-3-minutes)
16. [New Judge Q&A](#16-new-judge-qa)
17. [Updated Pitch](#17-updated-pitch)

---

## 1. Why These Features

AI prior authorization is already a crowded space (Cohere Health, Infinitus, Rhyme, Waystar, Availity and others). Regulators are also pushing payers toward standard electronic PA APIs. A plain "AI fills the PA form" pitch will look like a good version of something that already exists.

These features differentiate on three axes that competitors mostly don't cover:

| Axis | Competitors today | Our new angle |
|---|---|---|
| **When** gaps are caught | After the visit, at submission time | **During the visit**, before the note is even signed |
| **How** risk is judged | A black-box score | **An AI insurer that argues back**, with every objection shown |
| **Who** benefits | Hospital staff only | Staff, **doctors** (P2P rehearsal), **patients** (portal), **regulators** (accountability) |

---

## 2. Feature Priority Map

| # | Feature | Wow factor | Build effort | Recommendation |
|---|---|---|---|---|
| 1 | **Insurer Simulator** | 🔥🔥🔥 | Low | **Must build: this is the hero** |
| 2 | **Point-of-Care Gap Prevention** | 🔥🔥🔥 | Medium | **Build if possible** |
| 3 | Peer-to-Peer Voice Rehearsal | 🔥🔥🔥 | Medium | Build one of #2 or #3 |
| 4 | Payer Accountability Engine | 🔥🔥 | Low (with seeded data) | Dashboard panel only |
| 5 | Patient Portal | 🔥🔥 | Low | One page, quick win |
| 6 | Covered Alternative Finder | 🔥 | Low | Small add-on to the predictor panel |
| 7 | Fax / Scan OCR Intake | 🔥 | Low–Medium | One messy sample doc in the demo |

**Minimum innovative MVP:** Core flow + #1 + (#2 or #3) + #5.

---

## 3. Feature 1: Insurer Simulator (Adversarial Review)

### 3.1 Concept
An agent plays the **insurance company's medical reviewer**. Its only goal is to find a valid reason to deny the packet, using the payer's own policy. The Copilot fixes each objection, or flags it for a human, and the two go back and forth until the reviewer can't find a legitimate reason left.

This replaces "trust our score" with **an argument the user can watch and check**.

### 3.2 How it works

```
 Packet draft (from Packet Writer)
          │
          ▼
 ┌──────────────────────────┐
 │ INSURER SIMULATOR AGENT  │  "Deny if you can. Cite the policy section."
 └──────────┬───────────────┘
            │ objections[]
            ▼
     Any valid objections? ── no ──▶ "Survived review" ✅ → Verifier → Human
            │ yes
            ▼
 ┌──────────────────────────┐
 │ REBUTTAL / FIX AGENT     │  For each objection:
 │                          │   • Evidence exists in chart → add citation to letter
 │                          │   • Evidence missing        → create Gap for clinician
 │                          │   • Objection invalid       → rebut with policy text
 └──────────┬───────────────┘
            │
            └──── loop (max 3 rounds) ────▶ back to Insurer Simulator
```

### 3.3 Objection schema
```json
{
  "objection_id": "O1",
  "round": 1,
  "denial_reason_class": "INSUFFICIENT_CONSERVATIVE_THERAPY",
  "statement": "Policy requires documented failure of NSAIDs. Letter mentions ibuprofen but no outcome.",
  "policy_citation": {"policy_id": "AETNA-MRI-KNEE-v3", "section": "2.b"},
  "severity": "BLOCKING",
  "validity_check": "VALID",
  "resolution": {
    "type": "EVIDENCE_ADDED",
    "quote": "Ibuprofen 600mg TID x 4 weeks without relief.",
    "doc_id": "note_2024_02_10"
  }
}
```
- `severity`: `BLOCKING` (would cause denial), `WEAK` (might cause a request for more info), `MINOR`
- `resolution.type`: `EVIDENCE_ADDED`, `GAP_CREATED`, `REBUTTED`, `UNRESOLVED`

### 3.4 Guardrails
- The simulator **must cite a real policy section**. Objections without a resolvable citation are discarded by code. This prevents made-up rules.
- Fixes follow the same **verbatim-quote rule** as the rest of the system. The Copilot can never invent evidence to win the argument.
- Use a **different model or system prompt** from the Packet Writer so the two agents don't share blind spots.
- Hard cap of 3 rounds. Anything still unresolved goes to the human.

### 3.5 Output: the "Denial Defense Score"
Replaces or sits next to the XGBoost probability:

| Signal | Example |
|---|---|
| Rounds survived | 3 / 3 |
| Blocking objections raised → resolved | 2 → 2 |
| Weak objections remaining | 1 (non-blocking) |
| **Status** | 🛡️ **Survived simulated review** |

### 3.6 UI: "Courtroom" panel on the Packet Review page
- Chat-style thread: 🏢 **Insurer** on the left, 🤖 **Copilot** on the right.
- Each objection is a card with its policy citation. Each rebuttal shows a green evidence chip.
- A live counter at the top: `Blocking objections: 2 → 0`.

### 3.7 Payer personas (stretch)
Configurable strictness per payer ("Strict commercial", "Medicare LCD", "Lenient regional"), learned from denial history in the Learning Loop. This also makes it easy to tune the simulator to match real payer behavior later.

---

## 4. Feature 2: Point-of-Care Gap Prevention

### 4.1 Concept
Today gaps are found **after** the visit, and staff have to chase the doctor for days. Instead, Copilot watches the visit (an ambient transcript or the note being typed). When it detects an order that needs prior authorization, it shows the **payer's requirements as a live checklist** while the patient is still in the room.

> *"Knee MRI for Aetna requires: ✅ pain > 6 weeks · ❌ PT duration not mentioned · ❌ NSAID trial outcome not mentioned. Ask now?"*

### 4.2 How it works
```
 Live transcript / note text (streamed in chunks)
          │
          ▼
 ┌──────────────────────────┐
 │ ORDER DETECTOR           │  Detects intent: "let's get an MRI of the knee"
 └──────────┬───────────────┘
            ▼
 ┌──────────────────────────┐
 │ Policy Agent (existing)  │  Fetches criteria for CPT + payer
 └──────────┬───────────────┘
            ▼
 ┌──────────────────────────┐
 │ LIVE CRITERIA TRACKER    │  Re-runs a light matcher on each new chunk
 └──────────┬───────────────┘
            ▼
   Sidebar nudges: suggested questions for the doctor to ask
            ▼
   Visit ends → pre-filled case created with criteria already MET
```

### 4.3 Design rules
- **Nudges, never interrupts.** A quiet sidebar, not pop-ups.
- Suggested questions are **neutral and clinical** ("How long did PT last?"). They must never coach the doctor to document something that didn't happen. State this explicitly in the pitch.
- At the end of the visit, the case starts with most criteria already `MET`, and the whole Gap-Closer loop is skipped.

### 4.4 Demo version (realistic for 48 h)
- A pre-recorded or typed doctor–patient conversation plays line by line on the screen.
- The checklist fills in live, ❌ turns to ✅ as the doctor asks the suggested question.
- Optional: browser Web Speech API for live microphone input.

### 4.5 Integration story for judges
In production this runs as a **CDS Hooks** service (`order-select` / `order-sign` hooks) inside the EHR, aligned with the HL7 Da Vinci **CRD** (Coverage Requirements Discovery) standard.

---

## 5. Feature 3: Peer-to-Peer Voice Rehearsal

### 5.1 Concept
After a denial, a doctor can get on a call with the insurer's medical director to argue the case (a **peer-to-peer**, or P2P). Doctors usually go in unprepared and lose. Copilot gives them:

1. **A one-page prep sheet:** the denial reason, the 3 strongest pieces of evidence, the exact policy section that supports approval, and likely counter-arguments.
2. **A voice rehearsal:** the AI plays the payer's medical director and asks tough questions in real time.
3. **A scorecard:** which key points the doctor made, which they missed, and suggested phrasing.

### 5.2 How it works
```
 Denial + packet + chart + policy
          │
          ▼
 P2P PREP AGENT ──▶ Prep sheet (PDF / on-screen)
          │
          ▼
 VOICE REHEARSAL (speech-to-text → Medical Director persona LLM → text-to-speech)
          │
          ▼
 SCORING AGENT ──▶ Points covered ✅ / missed ❌ + suggested phrasing
```

### 5.3 Tech
- STT: browser Web Speech API (free) or Whisper
- TTS: browser `speechSynthesis`, or a hosted TTS for a more natural voice
- Persona: reuses the **Insurer Simulator** prompt with a conversational wrapper

### 5.4 Scorecard schema
```json
{
  "key_points": [
    {"point": "8 weeks PT failed", "covered": true},
    {"point": "Mechanical locking suggests meniscal tear", "covered": false,
     "suggested_phrasing": "The locking symptoms documented on 3/12 point to a structural cause that PT can't resolve."}
  ],
  "overall_readiness": "MEDIUM"
}
```

---

## 6. Feature 4: Payer Accountability Engine

### 6.1 Concept
Across all cases, detect when a payer **denied a request that met the payer's own published criteria**. This turns the product from paperwork automation into a tool that **pushes back on unfair denials**.

### 6.2 What it shows
- **Inappropriate denial rate per payer:** denials where all required criteria were `MET` with verified evidence
- **Denial reason vs. policy mismatch:** e.g. "Denied for missing imaging, but policy section 2 doesn't require imaging"
- **Appeal overturn rate per payer:** a high overturn rate suggests systematic over-denial
- **One-click evidence bundle:** a timeline, criteria-vs-evidence table and policy excerpts, exported as PDF for a regulator complaint or a payer contract negotiation

### 6.3 Logic
```
inappropriate_denial =
    decision == DENIED
    AND all(required criteria status == MET with verified evidence)
    AND denial_reason_class NOT IN (ADMINISTRATIVE, OUT_OF_NETWORK, ELIGIBILITY)
```

### 6.4 Who uses it
- **Revenue Cycle Manager:** payer contract negotiations
- **Compliance / Legal:** regulatory complaints
- **Hospital leadership:** deciding which payers to prioritize

> For the demo, seed ~200 synthetic historical cases with one payer deliberately over-denying, so the dashboard has a clear story.

---

## 7. Feature 5: Patient Portal

### 7.1 Concept
Almost every competitor is built only for staff. Patients just wait without knowing anything. A simple, read-only patient page:

- **Status tracker:** a parcel-tracking style timeline (Submitted → Under review → Approved / Denied → Appeal filed)
- **Plain-language explanations:** "Your insurer asked for proof of physical therapy. Your clinic is sending it."
- **Multi-language:** English, Urdu, Hindi (generated, with the original shown alongside)
- **What you can do:** patient rights after a denial, and how to request an external review
- **Upload button:** the patient can upload records they have (e.g. PT discharge summary from another clinic). These feed straight into the Gap-Closer loop.

### 7.2 Access
- A magic-link URL sent by SMS or email (mock for the demo)
- Shows **no clinical detail beyond what the patient already knows**. Wording is reviewed by templates, not free-generated.

---

## 8. Feature 6: Covered Alternative Finder

When the Insurer Simulator or the predictor says approval is unlikely, suggest **clinically reasonable alternatives that are more likely to be covered**, for the clinician to consider:

| Ordered | Likely issue | Alternative to consider |
|---|---|---|
| Knee MRI | No prior X-ray (step requirement) | Knee X-ray first; MRI if inconclusive |
| Brand-name drug | Step therapy required | Generic first-line agent on formulary |
| Outpatient MRI at hospital | Site-of-care restriction | Same MRI at an in-network freestanding imaging center |

**Safety rule:** shown as "Coverage information for clinician review", never as medical advice. The clinician decides.

---

## 9. Feature 7: Messy Document Intake (Fax and Scan OCR)

Real charts arrive as **faxes, scanned PDFs, phone photos and handwritten notes**, not clean text.

- **Pipeline:** image/PDF → OCR (Tesseract, or a vision-capable LLM) → text with page and bounding-box coordinates → existing Intake Agent
- **Citation upgrade:** evidence quotes highlight the exact region **on the scanned image**, not just in text
- **Quality flag:** low-confidence OCR regions are marked ⚠️ and can't be used as evidence without human confirmation

> Demo: include one deliberately ugly scanned PT note. Watching the system pull the evidence out of it makes the product feel real.

---

## 10. Optional: Local Market Track (Pakistan / South Asia)

If the competition judges are local, consider re-targeting the same engine:

| US concept | Local equivalent |
|---|---|
| Commercial payer PA | Pre-approval from **State Life, Jubilee, EFU, Adamjee**, and corporate health panels |
| Medicare | **Sehat Sahulat Program / Sehat Card** package rules |
| Payer policy PDFs | Panel hospital agreements, package rate lists, insurer pre-auth forms |
| Fax | WhatsApp images, paper files, phone photos |

Why it can win: almost nobody is solving this locally, Feature 7 (messy intake) becomes essential, and the multi-language patient portal (Feature 5) becomes a core feature.

---

## 11. Updated Workflow

New and changed steps are marked 🆕.

```
 🆕 0. POINT-OF-CARE TRACKER (during visit) ── criteria pre-met before note is signed
          │
          ▼
 🆕 1. INTAKE (now with OCR for faxes/scans)
          ▼
    2. CODING
          ▼
    3. POLICY RAG
          ▼
    4. CRITERIA MATCHER ──gaps──▶ 5. GAP-CLOSER (clinician 🆕 or patient upload)
          ▼
    6. PACKET WRITER
          ▼
 🆕 7. INSURER SIMULATOR ⇄ REBUTTAL AGENT  (max 3 rounds)
          │        └── 🆕 Covered Alternative Finder if still high risk
          ▼
    8. VERIFIER
          ▼
    9. HUMAN REVIEW  (graph pauses)
          ▼
   10. SUBMISSION ──────────────▶ 🆕 Patient Portal status updates
          ▼
     Denied? ──▶ 11. APPEAL AGENT ──▶ 🆕 P2P PREP + VOICE REHEARSAL
          ▼
   12. LEARNING LOOP ──▶ 🆕 PAYER ACCOUNTABILITY ENGINE
```

### Updated case status lifecycle
```
PRE_VISIT_TRACKING → DRAFT → INTAKE → CRITERIA_CHECK → NEEDS_INFO
  → ADVERSARIAL_REVIEW → READY_FOR_REVIEW → APPROVED_BY_HUMAN → SUBMITTED
  → (APPROVED | DENIED)
  → DENIED → APPEAL_DRAFTED → P2P_SCHEDULED → APPEAL_SUBMITTED → (OVERTURNED | UPHELD)
```

---

## 12. Fixes to the Original Plan

| Issue in original plan | Risk with judges | Fix |
|---|---|---|
| ~10 agents + 13 pages in 48 h | Half-finished demo | Core flow + Insurer Simulator + one of (Point-of-Care / P2P). Seed everything else. |
| XGBoost trained on synthetic data generated from our own rules | "Your model just learned the rules you wrote" | Say it openly, **or** lead with the Denial Defense Score from the Insurer Simulator, which can be shown and checked |
| "41% → 92%", "45 min → 4 min" | Looks made up | Only show numbers **measured** on the 20-case evaluation set. Honest numbers beat big ones. |
| Clean text-only charts | Feels like a toy | Add one OCR'd scanned document (Feature 7) |
| Staff-only product | Little human story | Add the patient portal (Feature 5) |

### New evaluation metrics

| Metric | How to measure | Target |
|---|---|---|
| **Simulator objection validity** | % of objections citing a real, relevant policy section (manual check on 20 cases) | > 90% |
| **Planted-weakness catch rate** | Weaknesses injected into packets → caught by the Insurer Simulator | > 85% |
| **Fabrication rate in rebuttals** | Rebuttals with a non-verbatim or invented quote | 0% (code-enforced) |
| **Point-of-care gap capture** | Gaps resolved during the visit vs. after (scripted demo visits) | Report count |
| **P2P key-point coverage** | Key points before vs. after a rehearsal (team self-test) | Report delta |

---

## 13. New Pages, APIs and Tables

### 13.1 New / changed pages

| Route | Page | Feature | Priority |
|---|---|---|---|
| `/cases/[id]/packet` | Add **Courtroom panel** (Insurer vs. Copilot thread) | #1 | ⭐ |
| `/visit/live` | **Live Visit Assistant:** transcript + live criteria checklist | #2 | ⭐ |
| `/cases/[id]/p2p` | **P2P Prep & Rehearsal:** prep sheet, voice session, scorecard | #3 | Core |
| `/analytics/payers` | **Payer Accountability** dashboard + evidence bundle export | #4 | Core |
| `/patient/[token]` | **Patient Portal:** status tracker, plain-language, upload | #5 | Core |

### 13.2 New backend files
```
backend/app/agents/
├── insurer_simulator.py      # adversarial reviewer
├── rebuttal.py               # fixes / rebuts objections
├── order_detector.py         # point-of-care order intent
├── live_tracker.py           # streaming criteria matcher
├── p2p_prep.py               # prep sheet + persona
├── p2p_scorer.py             # rehearsal scorecard
├── alternative_finder.py     # covered alternatives
└── patient_explainer.py      # plain-language + translation (template-bound)
backend/app/services/
├── ocr.py                    # Tesseract / vision OCR with bounding boxes
└── accountability.py         # inappropriate-denial analytics
```

### 13.3 New API endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/cases/{id}/adversarial-review` | Run the Insurer Simulator loop |
| GET | `/api/cases/{id}/adversarial-review/events` | **SSE** stream of objections and rebuttals |
| POST | `/api/visits` | Start a live visit session |
| POST | `/api/visits/{id}/chunks` | Push transcript chunk, returns updated checklist |
| POST | `/api/visits/{id}/finalize` | End visit, create a pre-filled case |
| GET | `/api/cases/{id}/p2p/prep` | Get the P2P prep sheet |
| POST | `/api/cases/{id}/p2p/sessions` | Start a rehearsal; WebSocket for voice turns |
| GET | `/api/cases/{id}/alternatives` | Covered alternative suggestions |
| GET | `/api/analytics/payer-accountability` | Inappropriate-denial stats per payer |
| GET | `/api/analytics/payer-accountability/{payer}/bundle` | Export evidence bundle (PDF) |
| GET | `/api/patient/{token}` | Patient-safe case status |
| POST | `/api/patient/{token}/uploads` | Patient uploads a record → Gap-Closer |

### 13.4 New tables
```sql
adversarial_rounds(id, case_id, round, created_at)

objections(id, case_id, round_id, denial_reason_class, statement,
           policy_id, policy_section, severity, validity_check,
           resolution_type, resolution_json)

visit_sessions(id, patient_id, payer, detected_cpt, transcript_text,
               live_criteria_json, status, case_id)

p2p_sessions(id, case_id, prep_sheet_md, transcript_json,
             scorecard_json, created_at)

alternatives(id, case_id, suggested_cpt, rationale, policy_citation, shown_to)

patient_access_tokens(id, case_id, token_hash, language, expires_at)

patient_uploads(id, case_id, document_id, uploaded_at, linked_gap_id)

document_regions(id, document_id, page, bbox_json, ocr_confidence)  -- OCR citations
```

---

## 14. Revised 48-Hour Build Plan

| Hours | Frontend | Backend / AI |
|---|---|---|
| **0–4** | Setup, layout, sidebar | FastAPI skeleton, schema, pick knee MRI + lumbar MRI |
| **4–12** | Case Queue, New Case (mock data) | Synthetic patients/notes, policy RAG ingest, **1 scanned doc** |
| **12–22** | **Case Workspace** (checklist + chart highlighter + timeline) | Intake, Coding, Policy, Matcher with quote validation |
| **22–30** | **Packet Review + Courtroom panel** | Packet Writer, **Insurer Simulator + Rebuttal loop**, Verifier |
| **30–38** | **Live Visit page** *or* **P2P page** (pick one) | Order Detector + Live Tracker *or* P2P Prep + voice |
| **38–43** | Patient Portal, Payer Accountability panel | Patient explainer, seeded accountability data, Appeal Agent |
| **43–48** | Landing page, polish, demo mode | Evaluation numbers, rehearse, record backup video |

**Cut order if behind:** Payer Accountability → Alternative Finder → Patient Portal → OCR → second of (Live Visit / P2P).
**Never cut:** Criteria-vs-evidence view, **Insurer Simulator**, citations, human approval.

---

## 15. Revised Demo Script (3 Minutes)

1. **Pain (15 s):** "Prior auth burns about 45 minutes of staff time per request, and many denials are just missing paperwork."
2. **Live visit (35 s):** Play the doctor–patient conversation. The doctor says *"let's get an MRI."* The checklist appears, and a nudge says *"PT duration not documented."* The doctor asks, the patient answers, and ❌ turns ✅. **The gap is closed before the note is signed.**
3. **Case runs (25 s):** Agents stream. The checklist fills with evidence quotes, including one pulled from an **ugly scanned fax**.
4. **🔥 The Courtroom (45 s):** The Insurer Simulator raises *"No documented NSAID outcome. Deny per §2.b."* The Copilot finds the quote and rebuts. Round 2 brings a new objection, which becomes a one-click clinician gap. Round 3: **"No valid denial reason found. 🛡️ Survived review."**
5. **Human approval (15 s):** The coordinator reads the letter with citation chips and clicks **Approve & Submit**. The patient portal updates in Urdu.
6. **Denial path (25 s):** A seeded denied case: appeal drafted, and the doctor does **10 seconds of voice P2P rehearsal** with the AI medical director.
7. **Impact (20 s):** Payer Accountability panel: *"Payer X denied 18% of requests that met its own criteria."* Then the measured numbers from our 20-case evaluation.

---

## 16. New Judge Q&A

| Question | Answer |
|---|---|
| "Can't the Copilot just make up evidence to win the argument?" | No. Every rebuttal must use a verbatim chart quote, checked in code. If the evidence doesn't exist, it creates a gap for a human instead. |
| "Can't the Insurer Simulator invent fake rules?" | Every objection must cite a real policy section from the RAG corpus. Objections without a valid citation are thrown away automatically. |
| "Isn't nudging doctors during the visit coaching them to over-document?" | The nudges are neutral clinical questions about care that already happened. The system never suggests documenting anything that didn't happen, and everything is logged. |
| "How is this different from existing PA tools?" | Existing tools automate the paperwork after the fact. We catch gaps during the visit, stress-test every packet against a simulated insurer, and help doctors and patients after a denial. |
| "Is the payer accountability data real?" | It's synthetic for the demo. The logic is deterministic, comparing denial reasons to the payer's own published criteria, so it works the same on real data. |
| "How does it fit into a real hospital?" | Point-of-care runs as a CDS Hooks service (Da Vinci CRD). Submission maps to the Da Vinci PAS / FHIR PA APIs. Data sits in a VPC with a BAA. |

---

## 17. Updated Pitch

> **"Other tools fill out the form. Ours argues your case. It catches gaps while the patient is still in the room, stress-tests every request against a simulated insurer, and when a denial still happens, it prepares the doctor to win the call and keeps the patient informed."**

**Tagline options**
- *"We argue with the insurer, so you don't have to."*
- *"Every denial, defeated before it's written."*
- *"Catch it in the room. Defend it in the packet. Win it on the call."*

---

## Quick Summary

| Item | Answer |
|---|---|
| **Hero feature** | Insurer Simulator: an adversarial AI reviewer with cited objections and evidence-backed rebuttals |
| **Second wow** | Point-of-care gap prevention *or* P2P voice rehearsal |
| **Human angle** | Patient portal (multi-language) + payer accountability |
| **Realism** | Fax/scan OCR with on-image citations |
| **Safety additions** | Objections must cite real policy, rebuttals must cite real chart quotes, neutral nudges, template-bound patient text |
| **Biggest plan fix** | Smaller scope, honest measured metrics, explainable Denial Defense Score instead of a circular ML score |
