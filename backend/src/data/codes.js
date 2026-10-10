// CPT / ICD-10-CM lookup table across specialties. The Coding Agent may only pick codes from here,
// so codes are never invented. Procedures not in the list can still be requested by name (custom).
//
// family  → which policy template applies (data/policies.js); "general" = any other procedure
// benefit → which plan benefit it falls under (insurer.services key, used by the Coverage Check agent)
// kind    → diagnostic (a test) or therapeutic (a treatment), used for letter wording
// CPT descriptions are our own short plain-language wording (demo only; verify before real use).
const P = (cpt, short, name, specialty, family, benefit, kind) => [cpt, { cpt, short, name, specialty, family, benefit, kind }];

export const PROCEDURES = Object.fromEntries([
  P("73721", "Knee MRI", "MRI, any joint of lower extremity, without contrast", "Imaging", "knee", "outpatient_imaging", "diagnostic"),
  P("72148", "Lumbar spine MRI", "MRI, spinal canal and contents, lumbar, without contrast", "Imaging", "lumbar", "outpatient_imaging", "diagnostic"),
  P("70553", "Brain MRI", "MRI brain, without contrast followed by contrast", "Imaging", "general", "outpatient_imaging", "diagnostic"),
  P("74177", "CT abdomen and pelvis", "CT abdomen and pelvis, with contrast", "Imaging", "general", "outpatient_imaging", "diagnostic"),
  P("78815", "PET-CT (skull base to mid-thigh)", "PET imaging with concurrently acquired CT, skull base to mid-thigh", "Oncology", "oncology", "outpatient_imaging", "diagnostic"),
  P("96413", "Chemotherapy infusion", "Chemotherapy administration, intravenous infusion, up to 1 hour, initial drug", "Oncology", "oncology", "day_care", "therapeutic"),
  P("33533", "Coronary artery bypass graft (CABG)", "Coronary artery bypass, using arterial graft, single", "Cardiac surgery", "cardiac_surgery", "inpatient", "therapeutic"),
  P("33405", "Aortic valve replacement (open)", "Replacement of aortic valve, open, with prosthetic valve", "Cardiac surgery", "cardiac_surgery", "inpatient", "therapeutic"),
  P("33361", "Transcatheter aortic valve replacement (TAVR)", "Transcatheter aortic valve replacement, percutaneous femoral approach", "Cardiac surgery", "cardiac_surgery", "inpatient", "therapeutic"),
  P("93458", "Cardiac catheterization with coronary angiography", "Left heart catheterization with coronary angiography", "Cardiology", "cardiac_intervention", "day_care", "diagnostic"),
  P("92928", "Coronary angioplasty with stent (PCI)", "Percutaneous transcatheter placement of intracoronary stent, single major coronary artery", "Cardiology", "cardiac_intervention", "inpatient", "therapeutic"),
  P("93306", "Echocardiogram (TTE)", "Transthoracic echocardiography, complete, with Doppler", "Cardiology", "general", "outpatient_imaging", "diagnostic"),
  P("27447", "Total knee replacement", "Total knee arthroplasty", "Orthopedic surgery", "joint_replacement", "inpatient", "therapeutic"),
  P("27130", "Total hip replacement", "Total hip arthroplasty", "Orthopedic surgery", "joint_replacement", "inpatient", "therapeutic"),
  P("43644", "Laparoscopic gastric bypass", "Laparoscopic gastric bypass (Roux-en-Y) for morbid obesity", "Bariatric surgery", "bariatric", "inpatient", "therapeutic"),
  P("47562", "Laparoscopic cholecystectomy", "Laparoscopic removal of the gallbladder", "General surgery", "general", "inpatient", "therapeutic"),
  P("45378", "Diagnostic colonoscopy", "Colonoscopy, flexible, diagnostic", "Gastroenterology", "general", "day_care", "diagnostic"),
  P("58150", "Total abdominal hysterectomy", "Total abdominal hysterectomy", "Gynecology", "general", "inpatient", "therapeutic"),
  P("66984", "Cataract surgery with lens implant", "Cataract removal with intraocular lens insertion", "Ophthalmology", "general", "day_care", "therapeutic"),
]);

/** Catalog entry for an order, or a custom entry when staff typed a procedure that is not in the list. */
export function resolveProcedure(order = {}) {
  if (PROCEDURES[order.cpt]) return PROCEDURES[order.cpt];
  const name = (order.procedureName || "").trim() || "Requested procedure";
  const setting = order.setting || "outpatient";
  return {
    cpt: order.cpt && order.cpt !== "CUSTOM" ? order.cpt : "CUSTOM",
    short: name,
    name,
    specialty: "Other",
    family: "general",
    benefit: setting === "inpatient" ? "inpatient" : setting === "day_care" ? "day_care" : "outpatient_imaging",
    kind: order.kind === "diagnostic" ? "diagnostic" : "therapeutic",
    custom: true,
  };
}

// Each ICD entry lists the procedure families it supports and keyword patterns that must
// all appear in the same sentence for the code to be suggested. "general" procedures may use any entry.
export const ICD10 = [
  { code: "M23.91", desc: "Unspecified internal derangement of right knee", families: ["knee"], all: [/right knee/i, /(meniscal|meniscus|internal derangement|mechanical symptoms)/i], specific: true },
  { code: "M23.92", desc: "Unspecified internal derangement of left knee", families: ["knee"], all: [/left knee/i, /(meniscal|meniscus|internal derangement|mechanical symptoms|instability|giving way)/i], specific: true },
  { code: "M17.11", desc: "Unilateral primary osteoarthritis, right knee", families: ["knee", "joint_replacement"], all: [/right knee/i, /osteoarthritis/i], specific: true },
  { code: "M17.12", desc: "Unilateral primary osteoarthritis, left knee", families: ["knee", "joint_replacement"], all: [/left knee/i, /osteoarthritis/i], specific: true },
  { code: "M16.11", desc: "Unilateral primary osteoarthritis, right hip", families: ["joint_replacement"], all: [/right hip/i, /osteoarthritis/i], specific: true },
  { code: "M16.12", desc: "Unilateral primary osteoarthritis, left hip", families: ["joint_replacement"], all: [/left hip/i, /osteoarthritis/i], specific: true },
  { code: "M25.561", desc: "Pain in right knee", families: ["knee"], all: [/right knee/i, /pain/i], specific: false },
  { code: "M25.562", desc: "Pain in left knee", families: ["knee"], all: [/left knee/i, /pain/i], specific: false },
  { code: "M21.371", desc: "Foot drop, right foot", families: ["lumbar"], all: [/foot drop/i, /right/i], specific: true },
  { code: "M21.372", desc: "Foot drop, left foot", families: ["lumbar"], all: [/foot drop/i, /left/i], specific: true },
  { code: "M51.26", desc: "Other intervertebral disc displacement, lumbar region", families: ["lumbar"], all: [/(disc herniation|disc displacement|herniated disc)/i], specific: true },
  { code: "M54.16", desc: "Radiculopathy, lumbar region", families: ["lumbar"], all: [/radiculopathy/i], specific: true },
  { code: "M54.41", desc: "Lumbago with sciatica, right side", families: ["lumbar"], all: [/(sciatica|radiating)/i, /right (leg|lower extremity)/i], specific: true },
  { code: "M54.42", desc: "Lumbago with sciatica, left side", families: ["lumbar"], all: [/(sciatica|radiating)/i, /left (leg|lower extremity)/i], specific: true },
  { code: "M54.50", desc: "Low back pain, unspecified", families: ["lumbar"], all: [/low back pain/i], specific: false },
  // Cardiac
  { code: "I21.4", desc: "Non-ST elevation (NSTEMI) myocardial infarction", families: ["cardiac_surgery", "cardiac_intervention"], all: [/(NSTEMI|non-ST elevation)/i], specific: true },
  { code: "I25.10", desc: "Atherosclerotic heart disease of native coronary artery without angina pectoris", families: ["cardiac_surgery", "cardiac_intervention"], all: [/(coronary artery disease|\bCAD\b|multivessel|three-vessel|triple vessel|left main)/i], specific: true },
  { code: "I20.9", desc: "Angina pectoris, unspecified", families: ["cardiac_surgery", "cardiac_intervention"], all: [/angina/i], specific: true },
  { code: "I35.0", desc: "Nonrheumatic aortic (valve) stenosis", families: ["cardiac_surgery", "cardiac_intervention"], all: [/aortic (valve )?stenosis/i], specific: true },
  { code: "I50.9", desc: "Heart failure, unspecified", families: ["cardiac_surgery", "cardiac_intervention"], all: [/heart failure/i], specific: false },
  { code: "R07.9", desc: "Chest pain, unspecified", families: ["cardiac_intervention"], all: [/chest pain/i], specific: false },
  // Oncology
  { code: "C50.911", desc: "Malignant neoplasm of unspecified site of right female breast", families: ["oncology"], all: [/right breast/i, /(carcinoma|cancer|malignan)/i], specific: true },
  { code: "C50.912", desc: "Malignant neoplasm of unspecified site of left female breast", families: ["oncology"], all: [/left breast/i, /(carcinoma|cancer|malignan)/i], specific: true },
  { code: "C34.90", desc: "Malignant neoplasm of unspecified part of unspecified bronchus or lung", families: ["oncology"], all: [/lung/i, /(carcinoma|cancer|malignan)/i], specific: true },
  { code: "C18.9", desc: "Malignant neoplasm of colon, unspecified", families: ["oncology"], all: [/colon/i, /(carcinoma|cancer|malignan)/i], specific: true },
  { code: "C61", desc: "Malignant neoplasm of prostate", families: ["oncology"], all: [/prostate/i, /(carcinoma|cancer|malignan)/i], specific: true },
  // Bariatric
  { code: "E66.01", desc: "Morbid (severe) obesity due to excess calories", families: ["bariatric"], all: [/(morbid|severe) obesity/i], specific: true },
  { code: "Z68.41", desc: "Body mass index 40.0-44.9, adult", families: ["bariatric"], all: [/\bBMI\b[^.]{0,15}\b4[0-4](\.\d)?\b/i], specific: false },
  { code: "E11.9", desc: "Type 2 diabetes mellitus without complications", families: ["bariatric"], all: [/type 2 diabetes/i], specific: false },
  { code: "I10", desc: "Essential (primary) hypertension", families: ["bariatric"], all: [/hypertension/i], specific: false },
  // Other common diagnoses (used by "general" procedures, which may match any entry)
  { code: "K80.20", desc: "Calculus of gallbladder without cholecystitis without obstruction", families: [], all: [/(gallstone|cholelithiasis)/i], specific: true },
  { code: "K81.0", desc: "Acute cholecystitis", families: [], all: [/acute cholecystitis/i], specific: true },
  { code: "H25.9", desc: "Unspecified age-related cataract", families: [], all: [/cataract/i], specific: true },
  { code: "D25.9", desc: "Leiomyoma of uterus, unspecified", families: [], all: [/(fibroid|leiomyoma)/i], specific: true },
  { code: "N92.0", desc: "Excessive and frequent menstruation with regular cycle", families: [], all: [/(menorrhagia|heavy menstrual bleeding)/i], specific: false },
  { code: "K92.1", desc: "Melena", families: [], all: [/melena/i], specific: false },
  { code: "R51.9", desc: "Headache, unspecified", families: [], all: [/headache/i], specific: false },
];

export const DENIAL_CLASSES = {
  INSUFFICIENT_CONSERVATIVE_THERAPY: "Insufficient conservative therapy documentation",
  NO_PRIOR_IMAGING: "Required prior imaging or diagnostic test not documented",
  MISSING_CLINICAL_DOCUMENTATION: "Missing clinical documentation",
  NOT_MEDICALLY_NECESSARY: "Not medically necessary",
  NOT_A_COVERED_BENEFIT: "Not a covered benefit under the plan",
  CODING_ERROR: "Coding / diagnosis mismatch",
  OUT_OF_NETWORK: "Out of network",
  ELIGIBILITY: "Member eligibility",
};
