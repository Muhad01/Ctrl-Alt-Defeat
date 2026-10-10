// Mock payer coverage policies (simplified, written for this demo — not real payer documents).
// Each criterion carries:
//   spec        machine-checkable evidence rule used by the rule-based matcher
//   gapQuestion question the Gap-Closer asks when the criterion is missing
//   denialClass denial reason a payer would use if this criterion is not met

import { INSURERS, REAL_PAYERS } from "./insurers.js";

const PT_PATTERNS =["physical therapy", "physiotherapy", "\\bPT\\b", "home exercise program"];
const NSAID_PATTERNS = ["NSAID", "ibuprofen", "naproxen", "meloxicam", "diclofenac", "acetaminophen", "celecoxib"];
const RED_FLAG_PATTERNS = ["foot drop", "progressive (weakness|neurologic)", "cauda equina", "saddle anesthesia", "bowel or bladder (dysfunction|incontinence|retention)", "history of (cancer|malignancy)", "unexplained weight loss", "fever", "suspected (fracture|infection)"];

function kneePolicy({ id, payer, name, ptWeeks, nsaidRequired, xrayDays, version }) {
  const criteria = [
    {
      id: "K1",
      ref: "3.1",
      text: "Knee pain or mechanical symptoms (locking, catching, giving way, effusion) documented on clinical evaluation",
      required: true,
      spec: { patterns: ["knee pain", "locking", "catching", "giving way", "effusion", "instability"] },
      gapQuestion: "The chart does not clearly document knee symptoms or mechanical findings. Please add the presenting symptoms and exam findings.",
      assignedRole: "physician",
      denialClass: "MISSING_CLINICAL_DOCUMENTATION",
      fixHint: "Document presenting knee symptoms and mechanical findings in the visit note.",
    },
    {
      id: "K2",
      ref: "3.2",
      text: `Failure of at least ${ptWeeks} weeks of conservative therapy including physical therapy`,
      required: true,
      spec: { patterns: PT_PATTERNS, minWeeks: ptWeeks, requireFailure: true },
      gapQuestion: `No documentation of at least ${ptWeeks} weeks of physical therapy with an inadequate response. Was PT completed? Please attach the PT record or add a note with dates and outcome.`,
      assignedRole: "physician",
      denialClass: "INSUFFICIENT_CONSERVATIVE_THERAPY",
      fixHint: `Attach PT notes showing at least ${ptWeeks} weeks of therapy and the outcome.`,
    },
    {
      id: "K3",
      ref: "3.3",
      text: "Trial of NSAIDs or analgesic medication with inadequate response",
      required: nsaidRequired,
      spec: { patterns: NSAID_PATTERNS },
      gapQuestion: "No medication trial (NSAID or analgesic) is documented. Was one tried, and what was the response?",
      assignedRole: "physician",
      denialClass: "INSUFFICIENT_CONSERVATIVE_THERAPY",
      fixHint: "Document the NSAID or analgesic trial, its duration, and the response.",
    },
    {
      id: "K4",
      ref: "3.4",
      text: `Weight-bearing radiographs (X-ray) of the affected knee within the last ${xrayDays} days`,
      required: true,
      spec: { patterns: ["x-ray", "radiograph", "\\bXR\\b"] },
      gapQuestion: `No knee X-ray within the last ${xrayDays} days is documented. Has one been performed? Please attach the radiology report or order one.`,
      assignedRole: "records",
      denialClass: "NO_PRIOR_IMAGING",
      fixHint: "Attach the knee X-ray report (or obtain radiographs before MRI).",
    },
    {
      id: "K5",
      ref: "3.5",
      text: "Exam findings suggesting internal derangement (positive McMurray, joint line tenderness, ligament laxity)",
      required: false,
      spec: { patterns: ["McMurray", "joint line tenderness", "Lachman", "meniscal", "ligament"] },
      gapQuestion: "No specific exam findings for internal derangement are documented. Please add relevant exam findings if present.",
      assignedRole: "physician",
      denialClass: "NOT_MEDICALLY_NECESSARY",
      fixHint: "Document provocative exam tests such as McMurray or joint line tenderness.",
    },
  ];
  return buildPolicy({ id, payer, name, cpts: ["73721"], version, criteria, intro: `This policy describes when ${payer} considers magnetic resonance imaging (MRI) of the knee (CPT 73721) medically necessary for adult members with knee pain or suspected internal derangement.` });
}

function lumbarPolicy({ id, payer, name, ptWeeks, nsaidRequired, xrayRequired, version }) {
  const criteria = [
    {
      id: "L1",
      ref: "4.1",
      text: "Low back pain with or without radiculopathy documented on clinical evaluation",
      required: true,
      spec: { patterns: ["low back pain", "radiculopathy", "sciatica", "radiating", "lumbar pain"] },
      gapQuestion: "The chart does not clearly document low back pain or radicular symptoms. Please add the presenting symptoms.",
      assignedRole: "physician",
      denialClass: "MISSING_CLINICAL_DOCUMENTATION",
      fixHint: "Document back pain characteristics and any radicular symptoms.",
    },
    {
      id: "L2",
      ref: "4.2",
      text: `Presence of a red flag (progressive neurological deficit, cauda equina symptoms, suspected malignancy, infection or fracture) OR failure of at least ${ptWeeks} weeks of conservative therapy`,
      required: true,
      spec: {
        anyOf: [
          { label: "red flag", patterns: RED_FLAG_PATTERNS },
          { label: "conservative therapy", patterns: PT_PATTERNS, minWeeks: ptWeeks, requireFailure: true },
        ],
      },
      gapQuestion: `No red flag and no documentation of ${ptWeeks} weeks of failed conservative therapy. Please document red-flag findings or attach PT records with dates and outcome.`,
      assignedRole: "physician",
      denialClass: "INSUFFICIENT_CONSERVATIVE_THERAPY",
      fixHint: `Attach PT notes (at least ${ptWeeks} weeks) or document red-flag findings.`,
    },
    {
      id: "L3",
      ref: "4.3",
      text: "Neurological examination documented (strength, reflexes, sensation and/or straight leg raise)",
      required: true,
      spec: { patterns: ["straight leg raise", "\\bSLR\\b", "reflex", "strength", "sensation", "dermatom"] },
      gapQuestion: "No neurological exam is documented. Please add strength, reflex, sensation or straight leg raise findings.",
      assignedRole: "physician",
      denialClass: "MISSING_CLINICAL_DOCUMENTATION",
      fixHint: "Add a neurological exam (strength, reflexes, sensation, SLR).",
    },
    {
      id: "L4",
      ref: "4.4",
      text: "Trial of NSAIDs or analgesic medication with inadequate response",
      required: nsaidRequired,
      spec: { patterns: NSAID_PATTERNS },
      gapQuestion: "No medication trial is documented. Was an NSAID or analgesic tried, and what was the response?",
      assignedRole: "physician",
      denialClass: "INSUFFICIENT_CONSERVATIVE_THERAPY",
      fixHint: "Document the medication trial, duration and response.",
    },
    {
      id: "L5",
      ref: "4.5",
      text: "Plain radiographs (X-ray) of the lumbar spine prior to MRI",
      required: xrayRequired,
      spec: { patterns: ["x-ray", "radiograph", "\\bXR\\b"] },
      gapQuestion: "No lumbar spine X-ray is documented. Has one been performed? Please attach the report.",
      assignedRole: "records",
      denialClass: "NO_PRIOR_IMAGING",
      fixHint: "Attach the lumbar spine X-ray report.",
    },
  ];
  return buildPolicy({ id, payer, name, cpts: ["72148"], version, criteria, intro: `This policy describes when ${payer} considers MRI of the lumbar spine (CPT 72148) medically necessary for adult members with low back pain.` });
}

function buildPolicy({ id, payer, name, cpts, version, criteria, intro }) {
  const sections = [
    { ref: "1", title: "Purpose", text: intro },
    { ref: "2", title: "Scope", text: `Applies to all ${payer} members aged 18 and older. Requests must be submitted by the ordering provider with supporting clinical documentation from the medical record. Advanced imaging is not considered medically necessary when the results would not change management.` },
    ...criteria.map((c) => ({
      ref: c.ref,
      title: `Criterion ${c.id}${c.required ? " (required)" : " (supporting)"}`,
      text: `${c.text}. ${c.required ? "This criterion must be met and supported by documentation in the medical record." : "This finding supports medical necessity but is not mandatory."}`,
    })),
    { ref: "5", title: "Documentation requirements", text: "Submitted records must include the most recent office visit note, documentation of prior treatment with dates and outcomes, and relevant imaging reports. Statements without supporting records may not be accepted." },
    { ref: "6", title: "Exclusions", text: "Routine imaging for nonspecific pain without a trial of conservative management, imaging for medicolegal purposes only, and repeat imaging without a change in clinical status are not covered." },
  ];
  return { id, payer, name, cpts, version, effective: "2026-01-01", source: "Mock policy written for demo purposes", sections, criteria };
}

export const POLICIES = [
  kneePolicy({ id: "MCR-KNEE-MRI", payer: "Medicare", name: "Medicare (demo LCD) — MRI of the Knee", ptWeeks: 6, nsaidRequired: false, xrayDays: 90, version: "v2.1" }),
  kneePolicy({ id: "BRH-KNEE-MRI", payer: "BlueRiver Health", name: "BlueRiver Health — Advanced Imaging: Knee MRI", ptWeeks: 6, nsaidRequired: true, xrayDays: 60, version: "v3.0" }),
  kneePolicy({ id: "NSI-KNEE-MRI", payer: "Northstar Insurance", name: "Northstar Insurance — Knee MRI Medical Policy", ptWeeks: 8, nsaidRequired: true, xrayDays: 60, version: "v1.4" }),
  lumbarPolicy({ id: "MCR-LSPINE-MRI", payer: "Medicare", name: "Medicare (demo LCD) — MRI of the Lumbar Spine", ptWeeks: 6, nsaidRequired: false, xrayRequired: false, version: "v2.0" }),
  lumbarPolicy({ id: "BRH-LSPINE-MRI", payer: "BlueRiver Health", name: "BlueRiver Health — Advanced Imaging: Lumbar Spine MRI", ptWeeks: 6, nsaidRequired: true, xrayRequired: true, version: "v3.2" }),
  lumbarPolicy({ id: "NSI-LSPINE-MRI", payer: "Northstar Insurance", name: "Northstar Insurance — Lumbar Spine MRI Medical Policy", ptWeeks: 6, nsaidRequired: true, xrayRequired: false, version: "v1.1" }),
  // Fictional Pakistani panel-hospital insurer (mock), modelled on corporate health-plan pre-approval rules.
  kneePolicy({ id: "IHL-KNEE-MRI", payer: "Indus Health", name: "Indus Health (Pakistan, mock) — Panel Hospital Pre-Approval: Knee MRI", ptWeeks: 4, nsaidRequired: true, xrayDays: 90, version: "v1.0" }),
  lumbarPolicy({ id: "IHL-LSPINE-MRI", payer: "Indus Health", name: "Indus Health (Pakistan, mock) — Panel Hospital Pre-Approval: Lumbar Spine MRI", ptWeeks: 4, nsaidRequired: true, xrayRequired: false, version: "v1.0" }),
];

// Mock payers: used for synthetic outcome history, analytics and the evaluation set.
export const MOCK_PAYERS = ["Medicare", "BlueRiver Health", "Northstar Insurance", "Indus Health"];

// Real insurers: coverage terms come from each insurer's public documents (data/insurers.js).
// Their clinical MRI checklist is the generic demo template, because none of them publish one.
function realInsurerPolicy(insurer, family) {
  const base =
    family === "knee"
      ? kneePolicy({ id: `${insurer.id.toUpperCase()}-KNEE-MRI`, payer: insurer.payer, name: "", ptWeeks: 6, nsaidRequired: true, xrayDays: 90, version: "demo-1" })
      : lumbarPolicy({ id: `${insurer.id.toUpperCase()}-LSPINE-MRI`, payer: insurer.payer, name: "", ptWeeks: 6, nsaidRequired: true, xrayRequired: false, version: "demo-1" });
  const mri = insurer.services.outpatient_imaging;
  const coverageSections = [
    {
      ref: "C.1",
      title: `Plan coverage: ${insurer.plan} (from insurer document)`,
      text: `${insurer.company}. ${insurer.limits.summary}. Outpatient MRI: ${mri.status.replace("_", " ").toLowerCase()}. ${mri.text}${mri.quote ? ` Insurer wording: "${mri.quote}"` : ""} Source: ${insurer.sources[0].url} (retrieved ${insurer.sources[0].retrieved}).`,
    },
    { ref: "C.2", title: "Pre-authorization (from insurer document)", text: `${insurer.preAuth.planned.rule} ${insurer.preAuth.emergency.rule} ${insurer.preAuth.reimbursement}` },
    { ref: "C.3", title: "Waiting period and pre-existing conditions (from insurer document)", text: `${insurer.waitingPeriod.note} ${insurer.preExisting}` },
    { ref: "C.4", title: "Key exclusions (from insurer document)", text: insurer.exclusions.join("; ") + "." },
  ];
  return {
    ...base,
    name: `${insurer.payer}: ${family === "knee" ? "Knee" : "Lumbar Spine"} MRI (real plan terms + demo clinical criteria)`,
    source: `Coverage terms: ${insurer.sources.map((s) => s.url).join(", ")}. Clinical criteria: demo template (not published by the insurer).`,
    real: true,
    insurerId: insurer.id,
    sections: [...coverageSections, ...base.sections.map((s) => (s.title.startsWith("Criterion") ? { ...s, title: `${s.title}, demo clinical criterion` } : s))],
  };
}

for (const insurer of INSURERS) POLICIES.push(realInsurerPolicy(insurer, "knee"), realInsurerPolicy(insurer, "lumbar"));

export const PAYERS = [...MOCK_PAYERS, ...REAL_PAYERS];
