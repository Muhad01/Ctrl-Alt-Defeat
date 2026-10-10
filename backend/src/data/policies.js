// Mock payer coverage policies (simplified, written for this demo: not real payer documents).
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

function buildPolicy({ id, payer, name, cpts, version, criteria, intro, family = null, scopeNote = "Advanced imaging is not considered medically necessary when the results would not change management.", exclusions = "Routine imaging for nonspecific pain without a trial of conservative management, imaging for medicolegal purposes only, and repeat imaging without a change in clinical status are not covered." }) {
  const sections = [
    { ref: "1", title: "Purpose", text: intro },
    { ref: "2", title: "Scope", text: `Applies to all ${payer} members aged 18 and older. Requests must be submitted by the ordering provider with supporting clinical documentation from the medical record. ${scopeNote}` },
    ...criteria.map((c) => ({
      ref: c.ref,
      title: `Criterion ${c.id}${c.required ? " (required)" : " (supporting)"}`,
      text: `${c.text}. ${c.required ? "This criterion must be met and supported by documentation in the medical record." : "This finding supports medical necessity but is not mandatory."}`,
    })),
    { ref: "5", title: "Documentation requirements", text: "Submitted records must include the most recent office visit note, documentation of prior treatment with dates and outcomes, and relevant imaging reports. Statements without supporting records may not be accepted." },
    { ref: "6", title: "Exclusions", text: exclusions },
  ];
  return { id, payer, name, cpts, family: family || (cpts.includes("73721") ? "knee" : "lumbar"), version, effective: "2026-01-01", source: "Mock policy written for demo purposes", sections, criteria };
}

// ───────────── Templates for other specialties (any disease, not only imaging) ─────────────
// Same structure as the knee/lumbar policies: each criterion has a machine-checkable spec, a gap
// question for the clinician, and the denial reason a payer would use if it is not met.

const MEDICAL_THERAPY = ["aspirin", "statin", "atorvastatin", "rosuvastatin", "beta.?blocker", "metoprolol", "bisoprolol", "nitrate", "nitroglycerin", "isosorbide", "clopidogrel", "ticagrelor", "ranolazine", "diuretic", "furosemide", "ACE inhibitor", "ramipril", "medical therapy", "medical management"];
const ECG = ["\\bECG\\b", "\\bEKG\\b", "electrocardiogra"];
const ACS = ["\\bSTEMI\\b", "\\bNSTEMI\\b", "myocardial infarction", "acute coronary syndrome", "troponin (was |is )?(elevated|raised|positive)", "elevated troponin"];

const C = (id, ref, text, required, spec, gapQuestion, denialClass, fixHint, assignedRole = "physician") => ({ id, ref, text, required, spec, gapQuestion, assignedRole, denialClass, fixHint });

const TEMPLATES = {
  cardiac_surgery: {
    label: "Cardiac Surgery (CABG / Valve Replacement / TAVR)",
    prefix: "CS",
    cpts: ["33533", "33405", "33361"],
    intro: (payer) => `This policy describes when ${payer} considers open-heart and transcatheter cardiac surgery (coronary artery bypass grafting, surgical or transcatheter aortic valve replacement) medically necessary.`,
    scopeNote: "Elective cardiac surgery requires a documented heart-team decision and must be pre-authorized before admission; emergency surgery may be notified within 24 hours.",
    exclusions: "Surgery without diagnostic confirmation of the lesion, procedures for asymptomatic disease without high-risk anatomy, and experimental devices are not covered.",
    criteria: (p) => [
      C("CS1", "3.1", "Diagnosis confirmed by diagnostic testing (coronary angiography showing significant stenosis, or echocardiography showing severe valve disease)", true,
        { patterns: ["angiogra", "catheteri[sz]ation", "\\d+\\s?% (stenosis|occlusion)", "stenosis", "occlu", "echocardiogra", "valve area", "mean gradient"] },
        "No diagnostic confirmation (angiography or echocardiography report) is in the record. Please attach the cath lab or echo report.", "NO_PRIOR_IMAGING", "Attach the coronary angiography or echocardiography report.", "records"),
      C("CS2", "3.2", "Symptoms or objective ischemia documented (angina, dyspnea, syncope, heart failure, or a positive stress test)", true,
        { patterns: ["angina", "chest pain", "dyspnea", "dyspnoea", "shortness of breath", "breathless", "syncope", "heart failure", "NYHA", "stress test", "ischemi", "ischaemi"] },
        "Cardiac symptoms or ischemia are not documented. Please add the presenting symptoms (angina class, NYHA class) or stress test result.", "MISSING_CLINICAL_DOCUMENTATION", "Document symptoms (CCS/NYHA class) or objective ischemia."),
      C("CS3", "3.3", "High-risk anatomy or severe symptomatic valve disease, OR persistent symptoms despite optimal medical therapy", true,
        { anyOf: [
          { label: "high-risk anatomy / severe valve disease", patterns: ["left main", "three.vessel", "triple.vessel", "multi.?vessel", "severe (symptomatic )?aortic stenosis", "critical (aortic )?stenosis", "proximal LAD"] },
          { label: "failed medical therapy", patterns: MEDICAL_THERAPY, requireFailure: true },
        ] },
        "Neither high-risk anatomy nor failure of optimal medical therapy is documented. Please document the anatomy from the angiogram or the medications tried and the response.", "INSUFFICIENT_CONSERVATIVE_THERAPY", "Document high-risk anatomy, or the medical therapy tried and why it failed."),
      C("CS4", "3.4", "Heart-team or cardiothoracic surgical evaluation with documented operative risk (e.g., STS score or EuroSCORE)", p.heartTeamRequired,
        { patterns: ["heart team", "cardiothoracic", "cardiac surg", "\\bSTS\\b", "EuroSCORE", "surgical risk", "operative risk", "fit for surgery", "candidate for (CABG|surgery|bypass|valve|TAVR)"] },
        "No heart-team or cardiac surgery evaluation is documented. Please attach the surgical consult with the operative risk assessment.", "MISSING_CLINICAL_DOCUMENTATION", "Attach the cardiothoracic consult with STS/EuroSCORE risk."),
      C("CS5", "3.5", "Pre-operative work-up completed (ECG, ejection fraction, renal function, blood counts)", false,
        { patterns: [...ECG, "ejection fraction", "\\bLVEF\\b", "\\bEF\\b", "creatinine", "eGFR", "hemoglobin", "haemoglobin", "\\bCBC\\b"] },
        "Pre-operative tests are not documented. Please add the ECG, ejection fraction and basic labs.", "MISSING_CLINICAL_DOCUMENTATION", "Add ECG, LVEF and basic pre-operative labs.", "records"),
    ],
  },
  cardiac_intervention: {
    label: "Cardiac Catheterization and Coronary Intervention (PCI)",
    prefix: "CI",
    cpts: ["93458", "92928"],
    intro: (payer) => `This policy describes when ${payer} considers diagnostic coronary angiography and percutaneous coronary intervention (angioplasty with stenting) medically necessary.`,
    scopeNote: "Acute coronary syndromes are exempt from the medical-therapy requirement. Elective procedures must be pre-authorized.",
    exclusions: "Screening angiography in asymptomatic patients and intervention on non-significant lesions are not covered.",
    criteria: (p) => [
      C("CI1", "3.1", "Symptoms suggestive of coronary artery disease (angina, chest pain, exertional dyspnea) or an acute coronary syndrome", true,
        { patterns: ["angina", "chest pain", "chest tightness", "exertional dyspnea", "dyspnea on exertion", "shortness of breath", ...ACS] },
        "Cardiac symptoms are not documented. Please add the presenting complaint and its character.", "MISSING_CLINICAL_DOCUMENTATION", "Document the anginal symptoms or the acute presentation."),
      C("CI2", "3.2", "Acute coronary syndrome, OR non-invasive testing showing ischemia (stress test, myocardial perfusion, CT coronary angiography)", true,
        { anyOf: [
          { label: "acute coronary syndrome", patterns: ACS },
          { label: "positive non-invasive test", patterns: ["stress test", "treadmill", "exercise tolerance test", "\\bETT\\b", "stress echo", "myocardial perfusion", "\\bSPECT\\b", "nuclear stress", "\\bCT coronary", "\\bCCTA\\b", "calcium score"] },
        ] },
        "No acute coronary syndrome and no non-invasive ischemia test is documented. Please attach the stress test or CT coronary angiography report.", "NO_PRIOR_IMAGING", "Attach the stress test / CCTA report showing ischemia.", "records"),
      C("CI3", "3.3", p.medWeeks ? `Acute coronary syndrome, OR persistent symptoms despite at least ${p.medWeeks} weeks of optimal medical therapy` : "Acute coronary syndrome, OR persistent symptoms despite optimal medical therapy", true,
        { anyOf: [
          { label: "acute coronary syndrome", patterns: ACS },
          { label: "failed medical therapy", patterns: MEDICAL_THERAPY, requireFailure: true, ...(p.medWeeks ? { minWeeks: p.medWeeks } : {}) },
        ] },
        `Medical therapy and its outcome are not documented${p.medWeeks ? ` for at least ${p.medWeeks} weeks` : ""}. Please list the anti-anginal medications, duration and response.`, "INSUFFICIENT_CONSERVATIVE_THERAPY", "Document anti-anginal medications, duration and persistent symptoms."),
      C("CI4", "3.4", "Baseline 12-lead ECG documented", true,
        { patterns: ECG },
        "No ECG is documented. Please attach the 12-lead ECG report.", "MISSING_CLINICAL_DOCUMENTATION", "Attach the baseline ECG.", "records"),
      C("CI5", "3.5", "Renal function and bleeding risk assessed before contrast (creatinine or eGFR, hemoglobin)", false,
        { patterns: ["creatinine", "eGFR", "renal function", "hemoglobin", "haemoglobin", "platelet"] },
        "Pre-procedure labs are not documented. Please add creatinine/eGFR and hemoglobin.", "MISSING_CLINICAL_DOCUMENTATION", "Add creatinine/eGFR and hemoglobin.", "records"),
    ],
  },
  joint_replacement: {
    label: "Total Joint Replacement (Knee / Hip)",
    prefix: "J",
    cpts: ["27447", "27130"],
    intro: (payer) => `This policy describes when ${payer} considers total knee or total hip arthroplasty medically necessary for adults with end-stage joint disease.`,
    scopeNote: "Elective joint replacement must be pre-authorized before admission.",
    exclusions: "Joint replacement for mild radiographic disease, without a trial of conservative care, or with an active joint infection is not covered.",
    criteria: (p) => [
      C("J1", "3.1", "Radiographic evidence of advanced arthritis (joint space narrowing, osteophytes, bone-on-bone, Kellgren-Lawrence grade 3-4)", true,
        { patterns: ["bone.on.bone", "severe (joint space )?narrowing", "joint space (narrowing|loss)", "osteophyte", "Kellgren", "grade (3|4|III|IV)", "x-ray", "radiograph"] },
        "No radiograph showing advanced arthritis is documented. Please attach the X-ray report.", "NO_PRIOR_IMAGING", "Attach the weight-bearing X-ray report describing advanced arthritis.", "records"),
      C("J2", "3.2", "Pain and functional limitation affecting daily activities", true,
        { patterns: ["pain", "difficulty walking", "limits walking", "walking distance", "activities of daily living", "\\bADLs?\\b", "functional", "stairs", "night pain", "walking aid", "cane"] },
        "Pain and functional limitation are not documented. Please describe the impact on walking and daily activities.", "MISSING_CLINICAL_DOCUMENTATION", "Document pain severity and functional limitation."),
      C("J3", "3.3", `Failure of at least ${p.weeks} weeks of conservative treatment (physical therapy, analgesics/NSAIDs, injections, weight loss or walking aid)`, true,
        { patterns: [...PT_PATTERNS, ...NSAID_PATTERNS, "injection", "conservative"], minWeeks: p.weeks, requireFailure: true },
        `No documentation of at least ${p.weeks} weeks of failed conservative treatment. Please attach PT records or note the treatments, dates and outcome.`, "INSUFFICIENT_CONSERVATIVE_THERAPY", `Document at least ${p.weeks} weeks of conservative care and the outcome.`),
      C("J4", "3.4", "Pre-operative medical evaluation or fitness for surgery documented", p.clearanceRequired,
        { patterns: ["medical clearance", "cleared for surgery", "fit for surgery", "pre-?op(erative)? (assessment|evaluation)", "anaesthe", "anesthe", "\\bASA\\b"] },
        "No pre-operative medical evaluation is documented. Please attach the medical clearance or anesthesia review.", "MISSING_CLINICAL_DOCUMENTATION", "Attach the pre-operative medical clearance."),
      C("J5", "3.5", "BMI recorded (below 40, or weight management addressed)", false,
        { patterns: ["\\bBMI\\b", "body mass index"] },
        "BMI is not documented. Please record height, weight and BMI.", "MISSING_CLINICAL_DOCUMENTATION", "Record BMI."),
    ],
  },
  oncology: {
    label: "Oncology (Chemotherapy / PET-CT)",
    prefix: "O",
    cpts: ["96413", "78815"],
    intro: (payer) => `This policy describes when ${payer} considers systemic anticancer therapy and PET-CT staging medically necessary.`,
    scopeNote: "Regimens must be consistent with a recognised guideline (e.g., NCCN) or tumour-board recommendation.",
    exclusions: "Treatment without a tissue diagnosis, off-label regimens without supporting evidence, and surveillance PET-CT without a clinical change are not covered.",
    criteria: (p) => [
      C("O1", "3.1", "Cancer diagnosis confirmed by pathology (biopsy or cytology)", true,
        { patterns: ["biopsy", "patholog", "histolog", "cytolog", "adenocarcinoma", "carcinoma", "lymphoma"] },
        "No pathology confirming the cancer is in the record. Please attach the biopsy/histopathology report.", "MISSING_CLINICAL_DOCUMENTATION", "Attach the histopathology report.", "records"),
      C("O2", "3.2", "Stage or extent of disease documented (TNM stage or staging imaging)", true,
        { patterns: ["\\bstage\\b", "\\bTNM\\b", "\\bT[0-4]N[0-3]", "metasta", "staging"] },
        "The stage of disease is not documented. Please add the TNM stage or staging scan result.", "MISSING_CLINICAL_DOCUMENTATION", "Document the TNM stage."),
      C("O3", "3.3", "Treatment plan from the treating oncologist or tumour board (regimen, cycles, intent)", true,
        { patterns: ["tumou?r board", "multidisciplinary", "oncolog", "regimen", "\\bNCCN\\b", "cycles", "adjuvant", "neoadjuvant", "palliative chemotherapy", "protocol"] },
        "No oncology treatment plan is documented. Please attach the regimen, number of cycles and treatment intent.", "NOT_MEDICALLY_NECESSARY", "Attach the oncologist's treatment plan (regimen, cycles, intent)."),
      C("O4", "3.4", "Performance status documented (ECOG or Karnofsky)", p.performanceRequired,
        { patterns: ["\\bECOG\\b", "Karnofsky", "performance status"] },
        "Performance status is not documented. Please record the ECOG or Karnofsky score.", "MISSING_CLINICAL_DOCUMENTATION", "Record ECOG/Karnofsky performance status."),
      C("O5", "3.5", "Baseline labs documented (blood counts, liver and kidney function)", false,
        { patterns: ["\\bCBC\\b", "blood count", "hemoglobin", "haemoglobin", "neutrophil", "creatinine", "liver function", "\\bLFTs?\\b", "bilirubin", "\\bALT\\b"] },
        "Baseline labs are not documented. Please attach CBC, liver and renal function.", "MISSING_CLINICAL_DOCUMENTATION", "Attach baseline CBC, LFT and renal function.", "records"),
    ],
  },
  bariatric: {
    label: "Bariatric Surgery",
    prefix: "B",
    cpts: ["43644"],
    intro: (payer) => `This policy describes when ${payer} considers bariatric (weight-loss) surgery medically necessary for adults with severe obesity.`,
    scopeNote: "Surgery must be performed at an accredited bariatric centre and pre-authorized before admission.",
    exclusions: "Surgery for cosmetic purposes, without a supervised weight-loss attempt, or with untreated psychiatric contraindications is not covered.",
    criteria: (p) => [
      C("B1", "3.1", `BMI of at least ${p.bmi} kg/m² documented`, true,
        { numeric: { label: "BMI", re: "(?:\\bBMI\\b|body mass index)[^0-9.]{0,20}(\\d{2}(?:\\.\\d+)?)", min: p.bmi } },
        `BMI of at least ${p.bmi} is not documented. Please record the current height, weight and BMI.`, "NOT_MEDICALLY_NECESSARY", `Document a BMI of at least ${p.bmi}.`),
      C("B2", "3.2", "Obesity-related comorbidity documented (type 2 diabetes, hypertension, sleep apnea, dyslipidemia, fatty liver)", p.comorbidityRequired,
        { patterns: ["type 2 diabetes", "diabetes mellitus", "hypertension", "sleep apnea", "sleep apnoea", "\\bOSA\\b", "dyslipid", "fatty liver", "\\bNAFLD\\b"] },
        "No obesity-related comorbidity is documented. Please list relevant comorbidities.", "NOT_MEDICALLY_NECESSARY", "Document obesity-related comorbidities."),
      C("B3", "3.3", `Supervised weight-loss program of at least ${p.weeks} weeks without durable success`, true,
        { patterns: ["weight.loss program", "weight management", "dietitian", "dietician", "supervised diet", "diet program", "lifestyle program"], minWeeks: p.weeks, requireFailure: true },
        `No supervised weight-loss program of at least ${p.weeks} weeks is documented. Please attach the program records with dates and outcome.`, "INSUFFICIENT_CONSERVATIVE_THERAPY", `Attach records of at least ${p.weeks} weeks of supervised weight management.`),
      C("B4", "3.4", "Psychological evaluation clearing the patient for surgery", true,
        { patterns: ["psycholog", "psychiatr", "mental health evaluation"] },
        "No psychological evaluation is documented. Please attach the psychology clearance.", "MISSING_CLINICAL_DOCUMENTATION", "Attach the psychological evaluation.", "records"),
      C("B5", "3.5", "Nutrition evaluation by a dietitian", false,
        { patterns: ["dietitian", "dietician", "nutrition"] },
        "No nutrition evaluation is documented.", "MISSING_CLINICAL_DOCUMENTATION", "Attach the dietitian assessment."),
    ],
  },
  general: {
    label: "General Medical Necessity (any procedure, test or treatment)",
    prefix: "G",
    cpts: ["*"],
    intro: (payer) => `This policy describes the general criteria ${payer} applies to any procedure, test, surgery or treatment that has no procedure-specific policy. The requested service must be reasonable and necessary for the diagnosis or treatment of a documented condition.`,
    scopeNote: "Requests are reviewed against the documented diagnosis, the objective findings, prior treatment and the treating specialist's recommendation.",
    exclusions: "Services that are cosmetic, experimental, for convenience, or that would not change management are not covered.",
    criteria: (p) => [
      C("G1", "3.1", "A diagnosis or clinical problem that the requested service evaluates or treats is documented", true,
        { patterns: ["assessment\\s*:", "impression\\s*:", "diagnosis\\s*:", "diagnosed with", "chief complaint", "presents with", "complains of", "history of present illness"] },
        "No diagnosis or clinical problem is documented for this request. Please add the working diagnosis.", "MISSING_CLINICAL_DOCUMENTATION", "Document the diagnosis the service is for."),
      C("G2", "3.2", "Objective findings support the indication (examination, laboratory, imaging, pathology or other test results)", true,
        { patterns: ["(physical )?exam(ination)?\\b", "tenderness", "\\bon palpation", "laboratory (results?|tests?)", "\\blabs?\\b", "ultrasound", "x-ray", "radiograph", "\\bCT\\b", "\\bMRI\\b", "\\bECG\\b", "\\bEKG\\b", "echocardiogra", "endoscop", "colonoscop", "biopsy", "histolog", "patholog", "hemoglobin", "haemoglobin", "creatinine", "\\d+(\\.\\d+)?\\s?(mg\\/dL|g\\/dL|mmol\\/L|U\\/L)", "blood pressure", "\\bBMI\\b"] },
        "No objective findings (exam, labs, imaging or test results) are documented. Please attach the relevant reports.", "NO_PRIOR_IMAGING", "Attach the exam findings and relevant test reports.", "records"),
      C("G3", "3.3", "Less invasive treatment tried and failed, OR documented reason it is not appropriate", p.conservativeRequired,
        { anyOf: [
          { label: "failed prior treatment", patterns: ["tried", "trial of", "treated with", "medication", "conservative", "physiotherapy", "physical therapy", "antibiotic", "analgesic", "therapy"], requireFailure: true },
          { label: "conservative care not appropriate", patterns: ["not appropriate", "not suitable", "contraindicat", "\\burgent\\b", "emergenc", "definitive (treatment|management)", "surgery is indicated", "only (effective )?treatment", "recurrent"] },
        ] },
        "Prior treatment and its outcome are not documented, and no reason is given why conservative care is not appropriate. Please add either.", "INSUFFICIENT_CONSERVATIVE_THERAPY", "Document prior treatment and outcome, or why it is not appropriate."),
      C("G4", "3.4", "The treating clinician recommends the requested service (plan or referral in the record)", true,
        { patterns: ["plan\\s*:", "recommend(ed|s)? (an? |the )?(surgery|procedure|operation|admission|referral|treatment)", "referred (to|for)", "is indicated", "candidate for", "scheduled for", "advised (to undergo|surgery)", "request(ed)? (an? |the )?(surgery|procedure|scan|test|admission)"] },
        "No clinician recommendation for this service is documented. Please add the plan or referral.", "NOT_MEDICALLY_NECESSARY", "Add the treating clinician's plan or referral."),
      C("G5", "3.5", "Pre-procedure assessment documented where relevant (fitness, anesthesia review, consent, risks discussed)", false,
        { patterns: ["fit for (surgery|the procedure|anaesthesia|anesthesia)", "anaesthe", "anesthe", "informed consent", "consent (was )?(obtained|signed)", "risks (and benefits )?(were )?discussed", "pre-?op(erative)?", "medical clearance"] },
        "No pre-procedure assessment is documented.", "MISSING_CLINICAL_DOCUMENTATION", "Document fitness/anesthesia review and consent."),
    ],
  },
};

// Payer-specific strictness for each template (demo values; real payers publish their own).
const STRICTNESS = {
  Medicare: { heartTeamRequired: true, medWeeks: 0, weeks: 12, clearanceRequired: true, performanceRequired: true, bmi: 40, comorbidityRequired: false, conservativeRequired: true, version: "v1.2" },
  "BlueRiver Health": { heartTeamRequired: true, medWeeks: 6, weeks: 12, clearanceRequired: true, performanceRequired: true, bmi: 40, comorbidityRequired: true, conservativeRequired: true, version: "v2.0" },
  "Northstar Insurance": { heartTeamRequired: true, medWeeks: 8, weeks: 12, clearanceRequired: true, performanceRequired: true, bmi: 40, comorbidityRequired: true, conservativeRequired: true, version: "v1.1" },
  // Fictional Pakistani insurer: Asian BMI thresholds (37.5), shorter conservative-care requirements.
  "Indus Health": { heartTeamRequired: false, medWeeks: 0, weeks: 6, clearanceRequired: false, performanceRequired: false, bmi: 37.5, comorbidityRequired: false, conservativeRequired: false, version: "v1.0" },
};
const DEMO_STRICTNESS = { heartTeamRequired: true, medWeeks: 0, weeks: 12, clearanceRequired: true, performanceRequired: true, bmi: 40, comorbidityRequired: false, conservativeRequired: true, version: "demo-1" };

const PAYER_CODE = { Medicare: "MCR", "BlueRiver Health": "BRH", "Northstar Insurance": "NSI", "Indus Health": "IHL" };
const FAMILY_CODE = { cardiac_surgery: "CARDIAC-SURG", cardiac_intervention: "CARDIAC-PCI", joint_replacement: "JOINT-REPL", oncology: "ONCOLOGY", bariatric: "BARIATRIC", general: "GENERAL" };

function templatePolicy(family, { id, payer, name, params }) {
  const t = TEMPLATES[family];
  return buildPolicy({
    id,
    payer,
    name: name || `${payer}: ${t.label}`,
    cpts: t.cpts,
    version: params.version,
    criteria: t.criteria(params),
    intro: t.intro(payer),
    family,
    scopeNote: t.scopeNote,
    exclusions: t.exclusions,
  });
}

export const POLICY_FAMILIES = ["knee", "lumbar", ...Object.keys(TEMPLATES)];

export const POLICIES = [
  kneePolicy({ id: "MCR-KNEE-MRI", payer: "Medicare", name: "Medicare (demo LCD): MRI of the Knee", ptWeeks: 6, nsaidRequired: false, xrayDays: 90, version: "v2.1" }),
  kneePolicy({ id: "BRH-KNEE-MRI", payer: "BlueRiver Health", name: "BlueRiver Health: Advanced Imaging: Knee MRI", ptWeeks: 6, nsaidRequired: true, xrayDays: 60, version: "v3.0" }),
  kneePolicy({ id: "NSI-KNEE-MRI", payer: "Northstar Insurance", name: "Northstar Insurance: Knee MRI Medical Policy", ptWeeks: 8, nsaidRequired: true, xrayDays: 60, version: "v1.4" }),
  lumbarPolicy({ id: "MCR-LSPINE-MRI", payer: "Medicare", name: "Medicare (demo LCD): MRI of the Lumbar Spine", ptWeeks: 6, nsaidRequired: false, xrayRequired: false, version: "v2.0" }),
  lumbarPolicy({ id: "BRH-LSPINE-MRI", payer: "BlueRiver Health", name: "BlueRiver Health: Advanced Imaging: Lumbar Spine MRI", ptWeeks: 6, nsaidRequired: true, xrayRequired: true, version: "v3.2" }),
  lumbarPolicy({ id: "NSI-LSPINE-MRI", payer: "Northstar Insurance", name: "Northstar Insurance: Lumbar Spine MRI Medical Policy", ptWeeks: 6, nsaidRequired: true, xrayRequired: false, version: "v1.1" }),
  // Fictional Pakistani panel-hospital insurer (mock), modelled on corporate health-plan pre-approval rules.
  kneePolicy({ id: "IHL-KNEE-MRI", payer: "Indus Health", name: "Indus Health (Pakistan, mock): Panel Hospital Pre-Approval: Knee MRI", ptWeeks: 4, nsaidRequired: true, xrayDays: 90, version: "v1.0" }),
  lumbarPolicy({ id: "IHL-LSPINE-MRI", payer: "Indus Health", name: "Indus Health (Pakistan, mock): Panel Hospital Pre-Approval: Lumbar Spine MRI", ptWeeks: 4, nsaidRequired: true, xrayRequired: false, version: "v1.0" }),
];

// Mock payers: used for synthetic outcome history, analytics and the evaluation set.
export const MOCK_PAYERS = ["Medicare", "BlueRiver Health", "Northstar Insurance", "Indus Health"];

for (const payer of MOCK_PAYERS) {
  for (const family of Object.keys(TEMPLATES)) {
    POLICIES.push(templatePolicy(family, { id: `${PAYER_CODE[payer]}-${FAMILY_CODE[family]}`, payer, params: STRICTNESS[payer] }));
  }
}

const BENEFIT_LABEL = { outpatient_imaging: "Outpatient diagnostics (MRI / CT / specialised tests)", inpatient: "Inpatient hospitalization and surgery", day_care: "Day-care procedures" };
const FAMILY_BENEFIT = { knee: "outpatient_imaging", lumbar: "outpatient_imaging", cardiac_surgery: "inpatient", cardiac_intervention: "day_care", joint_replacement: "inpatient", oncology: "day_care", bariatric: "inpatient", general: "inpatient" };

// Real insurers: coverage terms come from each insurer's public documents (data/insurers.js).
// Their clinical checklist is the generic demo template, because none of them publish one.
function realInsurerPolicy(insurer, family) {
  const code = insurer.id.toUpperCase();
  const base =
    family === "knee"
      ? kneePolicy({ id: `${code}-KNEE-MRI`, payer: insurer.payer, name: "", ptWeeks: 6, nsaidRequired: true, xrayDays: 90, version: "demo-1" })
      : family === "lumbar"
        ? lumbarPolicy({ id: `${code}-LSPINE-MRI`, payer: insurer.payer, name: "", ptWeeks: 6, nsaidRequired: true, xrayRequired: false, version: "demo-1" })
        : templatePolicy(family, { id: `${code}-${FAMILY_CODE[family]}`, payer: insurer.payer, params: DEMO_STRICTNESS });
  const benefitKey = FAMILY_BENEFIT[family];
  const benefit = insurer.services[benefitKey];
  const label = family === "knee" || family === "lumbar" ? "Outpatient MRI" : BENEFIT_LABEL[benefitKey];
  const coverageSections = [
    {
      ref: "C.1",
      title: `Plan coverage: ${insurer.plan} (from insurer document)`,
      text: `${insurer.company}. ${insurer.limits.summary}. ${label}: ${benefit.status.replace("_", " ").toLowerCase()}. ${benefit.text}${benefit.quote ? ` Insurer wording: "${benefit.quote}"` : ""} Source: ${insurer.sources[0].url} (retrieved ${insurer.sources[0].retrieved}).`,
    },
    { ref: "C.2", title: "Pre-authorization (from insurer document)", text: `${insurer.preAuth.planned.rule} ${insurer.preAuth.emergency.rule} ${insurer.preAuth.reimbursement}` },
    { ref: "C.3", title: "Waiting period and pre-existing conditions (from insurer document)", text: `${insurer.waitingPeriod.note} ${insurer.preExisting}` },
    { ref: "C.4", title: "Key exclusions (from insurer document)", text: insurer.exclusions.join("; ") + "." },
  ];
  return {
    ...base,
    name: `${insurer.payer}: ${family === "knee" ? "Knee MRI" : family === "lumbar" ? "Lumbar Spine MRI" : TEMPLATES[family].label} (real plan terms + demo clinical criteria)`,
    source: `Coverage terms: ${insurer.sources.map((s) => s.url).join(", ")}. Clinical criteria: demo template (not published by the insurer).`,
    real: true,
    insurerId: insurer.id,
    sections: [...coverageSections, ...base.sections.map((s) => (s.title.startsWith("Criterion") ? { ...s, title: `${s.title}, demo clinical criterion` } : s))],
  };
}

for (const insurer of INSURERS) for (const family of POLICY_FAMILIES) POLICIES.push(realInsurerPolicy(insurer, family));

export const PAYERS = [...MOCK_PAYERS, ...REAL_PAYERS];

/** The payer's policy for a procedure: the procedure-specific one, else the payer's general policy. */
export function findPolicy(policies, payer, cpt) {
  return policies.find((p) => p.payer === payer && p.cpts.includes(cpt)) || policies.find((p) => p.payer === payer && p.cpts.includes("*")) || null;
}
