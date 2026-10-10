// Small CPT / ICD-10-CM lookup table. The Coding Agent may only pick codes from here,
// so codes are never invented.

export const PROCEDURES = {
  "73721": {
    cpt: "73721",
    name: "MRI, any joint of lower extremity, without contrast",
    short: "Knee MRI",
    family: "knee",
  },
  "72148": {
    cpt: "72148",
    name: "MRI, spinal canal and contents, lumbar, without contrast",
    short: "Lumbar spine MRI",
    family: "lumbar",
  },
};

// Each ICD entry lists the procedures it supports and keyword patterns that must
// all appear in the same sentence for the code to be suggested.
export const ICD10 = [
  { code: "M23.91", desc: "Unspecified internal derangement of right knee", cpts: ["73721"], all: [/right knee/i, /(meniscal|meniscus|internal derangement|mechanical symptoms)/i], specific: true },
  { code: "M23.92", desc: "Unspecified internal derangement of left knee", cpts: ["73721"], all: [/left knee/i, /(meniscal|meniscus|internal derangement|mechanical symptoms|instability|giving way)/i], specific: true },
  { code: "M17.11", desc: "Unilateral primary osteoarthritis, right knee", cpts: ["73721"], all: [/right knee/i, /osteoarthritis/i], specific: true },
  { code: "M17.12", desc: "Unilateral primary osteoarthritis, left knee", cpts: ["73721"], all: [/left knee/i, /osteoarthritis/i], specific: true },
  { code: "M25.561", desc: "Pain in right knee", cpts: ["73721"], all: [/right knee/i, /pain/i], specific: false },
  { code: "M25.562", desc: "Pain in left knee", cpts: ["73721"], all: [/left knee/i, /pain/i], specific: false },
  { code: "M21.371", desc: "Foot drop, right foot", cpts: ["72148"], all: [/foot drop/i, /right/i], specific: true },
  { code: "M21.372", desc: "Foot drop, left foot", cpts: ["72148"], all: [/foot drop/i, /left/i], specific: true },
  { code: "M51.26", desc: "Other intervertebral disc displacement, lumbar region", cpts: ["72148"], all: [/(disc herniation|disc displacement|herniated disc)/i], specific: true },
  { code: "M54.16", desc: "Radiculopathy, lumbar region", cpts: ["72148"], all: [/radiculopathy/i], specific: true },
  { code: "M54.41", desc: "Lumbago with sciatica, right side", cpts: ["72148"], all: [/(sciatica|radiating)/i, /right (leg|lower extremity)/i], specific: true },
  { code: "M54.42", desc: "Lumbago with sciatica, left side", cpts: ["72148"], all: [/(sciatica|radiating)/i, /left (leg|lower extremity)/i], specific: true },
  { code: "M54.50", desc: "Low back pain, unspecified", cpts: ["72148"], all: [/low back pain/i], specific: false },
];

export const DENIAL_CLASSES = {
  INSUFFICIENT_CONSERVATIVE_THERAPY: "Insufficient conservative therapy documentation",
  NO_PRIOR_IMAGING: "Required prior imaging not documented",
  MISSING_CLINICAL_DOCUMENTATION: "Missing clinical documentation",
  NOT_MEDICALLY_NECESSARY: "Not medically necessary",
  NOT_A_COVERED_BENEFIT: "Not a covered benefit under the plan",
  CODING_ERROR: "Coding / diagnosis mismatch",
  OUT_OF_NETWORK: "Out of network",
  ELIGIBILITY: "Member eligibility",
};
