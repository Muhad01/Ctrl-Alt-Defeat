// 11. Appeal Agent — reads the denial, classifies the reason, searches the *current*
// chart for counter-evidence, cites the policy, drafts the appeal and advises on peer-to-peer.
import { DENIAL_CLASSES } from "../data/codes.js";
import { matchCriterionRules } from "./matcher.js";
import { validateQuote } from "../utils/text.js";
import { callJSON, withFallback } from "../llm.js";

const KEYWORDS = [
  ["NOT_A_COVERED_BENEFIT", /(not a covered benefit|outpatient services|excluded under|exclusion \d+|not covered under (the|this) plan)/i],
  ["INSUFFICIENT_CONSERVATIVE_THERAPY", /(conservative|physical therapy|\bPT\b|therapy|NSAID|medication trial)/i],
  ["NO_PRIOR_IMAGING", /(x-ray|radiograph|prior imaging)/i],
  ["CODING_ERROR", /(coding|code|diagnosis mismatch|ICD|CPT)/i],
  ["OUT_OF_NETWORK", /(out of network|out-of-network|non-participating)/i],
  ["ELIGIBILITY", /(eligib|coverage terminated|not active)/i],
  ["NOT_MEDICALLY_NECESSARY", /(not medically necessary|would not change management|medical necessity)/i],
  ["MISSING_CLINICAL_DOCUMENTATION", /(documentation|records|not demonstrate)/i],
];

function ruleClassify(text) {
  for (const [cls, re] of KEYWORDS) if (re.test(text)) return { reasonClass: cls, confidence: 0.8 };
  return { reasonClass: "NOT_MEDICALLY_NECESSARY", confidence: 0.4 };
}

const CLASSIFY_SCHEMA = {
  type: "object",
  properties: {
    reason_class: { type: "string", enum: Object.keys(DENIAL_CLASSES) },
    confidence: { type: "number" },
    summary: { type: "string" },
  },
  required: ["reason_class", "confidence", "summary"],
  additionalProperties: false,
};

async function llmClassify(text) {
  const out = await callJSON({
    system: "Classify the primary reason for this insurance prior-authorization denial. Summarize the payer's stated reason in one sentence.",
    prompt: text,
    schema: CLASSIFY_SCHEMA,
    effort: "low",
  });
  return { reasonClass: out.reason_class, confidence: out.confidence, summary: out.summary };
}

export async function runAppeal({ caseObj, patient, policy, documents, denial }) {
  const { result: cls, mode } = await withFallback(() => llmClassify(denial.letterText || denial.reasonText), () => ruleClassify(denial.letterText || denial.reasonText));

  // Re-check every required criterion against the chart as it is now (new records may have arrived).
  const related = policy.criteria.filter((c) => c.required && (denial.unmetCriteria?.includes(c.id) || c.denialClass === cls.reasonClass));
  const targets = related.length ? related : policy.criteria.filter((c) => c.required);
  const counter = targets.map((c) => {
    const r = matchCriterionRules(c, documents);
    const verified = r.evidence.filter((e) => validateQuote(documents, e.docId, e.quote));
    return { criterionId: c.id, ref: c.ref, text: c.text, status: r.status, reasoning: r.reasoning, evidence: verified };
  });
  const supported = counter.filter((c) => c.status === "MET");
  const strength = targets.length ? supported.length / targets.length : 0;

  const citations = [];
  const cite = (e) => {
    let c = citations.find((x) => x.quote === e.quote);
    if (!c) {
      c = { n: citations.length + 1, ...e };
      citations.push(c);
    }
    return c.n;
  };

  const lines = [
    "# Appeal of Adverse Determination",
    "",
    `**Date:** ${new Date().toISOString().slice(0, 10)}`,
    `**To:** ${policy.payer}, Appeals Department`,
    `**Reference:** ${denial.reference}`,
    `**Patient:** ${patient.name} | DOB ${patient.dob} | Member ID ${caseObj.coding.memberId}`,
    `**Service:** ${caseObj.coding.procedure} (CPT ${caseObj.coding.cpt})`,
    "",
    "## Reason for Appeal",
    `The request was denied for: ${DENIAL_CLASSES[cls.reasonClass]}. We respectfully disagree. The medical record demonstrates that the requirements of ${policy.id} are met, as detailed below.`,
    "",
    "## Policy Criteria and Supporting Evidence",
  ];
  for (const c of supported) {
    const ns = c.evidence.slice(0, 2).map(cite);
    lines.push(`- **${policy.id} §${c.ref}, ${c.text}:** "${c.evidence[0].quote}" ${ns.map((n) => `[${n}]`).join("")}`);
  }
  if (!supported.length) lines.push("- No additional supporting documentation was found in the chart. Consider requesting records or a peer-to-peer discussion.");
  const newDocs = documents.filter((d) => d.receivedAfterSubmission);
  if (newDocs.length) {
    lines.push("", "## Additional Records Enclosed");
    newDocs.forEach((d) => lines.push(`- ${d.title} (${d.date})`));
  }
  lines.push(
    "",
    "## Request",
    `Based on the enclosed documentation, we request that ${policy.payer} overturn the denial and authorize CPT ${caseObj.coding.cpt}.`,
    "",
    "Sincerely,",
    "",
    patient.provider.name,
    `${patient.provider.specialty} | NPI ${patient.provider.npi}`
  );

  const p2pRecommended = cls.reasonClass === "NOT_MEDICALLY_NECESSARY" || strength < 1;
  return {
    reasonClass: cls.reasonClass,
    reasonLabel: DENIAL_CLASSES[cls.reasonClass],
    classificationConfidence: cls.confidence,
    summary: cls.summary || denial.reasonText,
    counterEvidence: counter,
    strength: Number(strength.toFixed(2)),
    letter: lines.join("\n"),
    citations,
    p2p: {
      recommended: p2pRecommended,
      reason: p2pRecommended
        ? cls.reasonClass === "NOT_MEDICALLY_NECESSARY"
          ? "Medical-necessity denials are often overturned in a physician-to-physician discussion."
          : "Some denial criteria still lack documentation. A peer-to-peer discussion can add clinical context."
        : "Documentation fully addresses the denial. A written appeal should be sufficient.",
      talkingPoints: supported.map((c) => `${c.text}: "${c.evidence[0].quote}"`).slice(0, 3),
    },
    mode,
    status: "DRAFTED",
    draftedAt: new Date().toISOString(),
  };
}
