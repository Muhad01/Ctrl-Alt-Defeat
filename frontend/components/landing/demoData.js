// Output of the real rule engine for Hamza Qureshi (synthetic patient P009), right knee MRI.
// Generated from backend/src (matcher + readiness) so the landing page shows what the app actually returns.
const quote = (q) => [{ quote: q, docTitle: "Orthopedic Progress Note" }];

const K1 = { criterionId: "K1", ref: "3.1", required: true, status: "MET", confidence: 0.92, text: "Knee pain or mechanical symptoms (locking, catching, giving way, effusion) documented on clinical evaluation", reasoning: "Documented in 1 document(s).", evidence: quote("Chief complaint: Right knee pain for 3 months after a cricket injury.") };
const K3 = { criterionId: "K3", ref: "3.3", required: true, status: "MET", confidence: 0.84, text: "Trial of NSAIDs or analgesic medication with inadequate response", reasoning: "Documented in 1 document(s).", evidence: quote("He took naproxen 500 mg twice daily for 4 weeks with inadequate relief.") };
const K5 = { criterionId: "K5", ref: "3.5", required: false, status: "MET", confidence: 0.92, text: "Exam findings suggesting internal derangement (positive McMurray, joint line tenderness, ligament laxity)", reasoning: "Documented in 1 document(s).", evidence: quote("Medial joint line tenderness is present.") };
const xray = (days) => ({ criterionId: "K4", ref: "3.4", required: true, status: "MET", confidence: 0.84, text: `Weight-bearing radiographs (X-ray) of the affected knee within the last ${days} days`, reasoning: "Documented in 1 document(s).", evidence: quote("Imaging: Weight-bearing X-ray of the right knee on 09/20/2026 shows no fracture and preserved joint spaces.") });

export const DEMO = {
  blueriver: {
    payer: "BlueRiver Health",
    rule: "needs 6 weeks of physiotherapy",
    policy: { id: "BRH-KNEE-MRI", version: "v3.0", name: "BlueRiver Health: Advanced Imaging: Knee MRI" },
    readiness: { score: 60, level: "NEEDS_WORK", capped: true, capReason: "Capped at 60: a required criterion is missing" },
    criteria: [
      K1,
      { criterionId: "K2", ref: "3.2", required: true, status: "MISSING", confidence: 0.88, text: "Failure of at least 6 weeks of conservative therapy including physical therapy", reasoning: "Only 4 weeks documented; policy requires at least 6 weeks.", evidence: quote("He completed 4 weeks of physiotherapy with minimal relief.") },
      K3,
      xray(60),
      K5,
    ],
  },
  indus: {
    payer: "Indus Health",
    rule: "needs 4 weeks of physiotherapy",
    policy: { id: "IHL-KNEE-MRI", version: "v1.0", name: "Indus Health (Pakistan, mock): Panel Hospital Pre-Approval: Knee MRI" },
    readiness: { score: 100, level: "READY", capped: false, capReason: null },
    criteria: [
      K1,
      { criterionId: "K2", ref: "3.2", required: true, status: "MET", confidence: 0.93, text: "Failure of at least 4 weeks of conservative therapy including physical therapy", reasoning: "4 weeks documented (≥ 4 required) with inadequate response.", evidence: quote("He completed 4 weeks of physiotherapy with minimal relief.") },
      K3,
      xray(90),
      K5,
    ],
  },
};

// Timeline messages from a real rule-engine run of the same case.
export const TIMELINE = [
  { step: "Intake Agent", message: "Extracted 9 facts, all with verified source quotes" },
  { step: "Coding Agent", message: "CPT 73721 · ICD-10 M23.91, M25.561" },
  { step: "Policy Agent", message: "BlueRiver Health Knee MRI: 5 criteria (4 required)" },
  { step: "Criteria Matcher", message: "4 met, 1 missing" },
  { step: "Gap-Closer", message: "1 documentation gap sent to the physician" },
];
