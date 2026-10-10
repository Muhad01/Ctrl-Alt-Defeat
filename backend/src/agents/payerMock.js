// Mock payer portal. Decides submissions by applying its own policy to the submitted
// criteria evidence. Northstar occasionally denies fully documented requests, which
// gives the appeal flow and the accountability analytics something realistic to show.
import { DENIAL_CLASSES } from "../data/codes.js";
import { hashString } from "../utils/text.js";

export function decide({ caseObj, policy, results, isAppeal = false }) {
  const unmet = policy.criteria.filter((c) => {
    if (!c.required) return false;
    const r = results.find((x) => x.criterionId === c.id);
    return !r || !["MET", "NOT_APPLICABLE"].includes(r.status);
  });
  const reference = `${policy.payer.split(" ")[0].toUpperCase()}-${Math.floor(100000 + (hashString(caseObj.id + (isAppeal ? "A" : "")) % 900000))}`;

  // Real plan terms: a service outside the benefit is rejected before clinical review
  const cv = caseObj.coverage;
  if (cv?.status === "NOT_COVERED" && caseObj.decisions?.COVERAGE !== "na") {
    return {
      decision: "DENIED",
      reference,
      reasonClass: "NOT_A_COVERED_BENEFIT",
      reasonText: `${DENIAL_CLASSES.NOT_A_COVERED_BENEFIT}: ${cv.blocker.rule} under ${cv.plan}. ${cv.blocker.detail}`,
      unmetCriteria: [],
    };
  }

  if (unmet.length) {
    const c = unmet[0];
    return {
      decision: "DENIED",
      reference,
      reasonClass: c.denialClass,
      reasonText: `${DENIAL_CLASSES[c.denialClass]}: policy ${policy.id} §${c.ref} requires "${c.text}". The submitted records do not demonstrate this requirement.`,
      unmetCriteria: unmet.map((u) => u.id),
    };
  }
  if (!isAppeal && policy.payer === "Northstar Insurance" && hashString(caseObj.id) % 4 === 0) {
    return {
      decision: "DENIED",
      reference,
      reasonClass: "NOT_MEDICALLY_NECESSARY",
      reasonText: "Not medically necessary: the reviewer determined that the requested service would not change management at this time.",
      unmetCriteria: [],
    };
  }
  return { decision: "APPROVED", reference, reasonClass: null, reasonText: "Request meets medical policy criteria.", unmetCriteria: [] };
}

export function denialLetter({ patient, policy, decision, coding }) {
  return `NOTICE OF ADVERSE DETERMINATION
${policy.payer}, Utilization Management
Reference: ${decision.reference}

Member: ${patient.name}   Member ID: ${coding.memberId}
Requested service: ${coding.procedure} (CPT ${coding.cpt})

Determination: DENIED

Reason: ${decision.reasonText}

You or your provider may request an appeal within 60 days of this notice. Your provider may also request a peer-to-peer discussion with a medical director.`;
}
