// Coverage Check agent: before checking clinical criteria, is this service a covered benefit under
// the patient's actual plan? It uses the insurer's published terms (data/insurers.js): benefit
// scope (outpatient MRI), age limits, inadmissible conditions, waiting period, pre-authorization
// timing and network rules. Every finding cites the insurer document it came from.
import { insurerByPayer } from "../data/insurers.js";

const CANCER = /(cancer|malignan|carcinoma|lymphoma|tumou?r)/i;
const HIV = /\b(hiv|aids)\b/i;

export function runCoverageCheck({ payer, patient, coding, order, documents }) {
  const insurer = insurerByPayer(payer);
  if (!insurer) return null; // mock payer: no published plan terms to check
  const src = insurer.sources[0];
  const findings = [];
  const add = (rule, result, detail, quote = null) => findings.push({ rule, result, detail, quote, source: src.title, url: src.url });

  // 1. Benefit scope: diagnostic MRI ordered as an outpatient test
  const mri = insurer.services.outpatient_imaging;
  const setting = order.setting || "outpatient";
  if (setting === "inpatient") {
    add("Benefit scope", "PASS", `Requested during an inpatient admission: ${insurer.services.inpatient.text}`);
  } else {
    const result = mri.status === "COVERED" ? "PASS" : mri.status === "CONDITIONAL" ? "CONDITION" : "FAIL";
    add(`Outpatient MRI (${mri.ref})`, result, mri.text + (mri.condition ? ` Condition: ${mri.condition}` : "") + (mri.override ? ` Possible override: ${mri.override}` : ""), mri.quote);
  }

  // 2. Age eligibility
  const maxAge = insurer.eligibility.maxClaimAge;
  if (maxAge && patient.age > maxAge) add("Age limit", "FAIL", `Patient is ${patient.age}; ${insurer.eligibility.note}`);
  else add("Age limit", "PASS", insurer.eligibility.note);

  // 3. Inadmissible conditions found in the chart
  const chart = documents.map((d) => d.text).join("\n");
  const flagged = [];
  if (insurer.inadmissible.some((c) => /cancer/i.test(c)) && CANCER.test(chart)) flagged.push("cancer");
  if (insurer.inadmissible.some((c) => /hiv/i.test(c)) && HIV.test(chart)) flagged.push("HIV/AIDS");
  if (flagged.length) add("Inadmissible conditions", "CONDITION", `The chart mentions ${flagged.join(" and ")}. The plan lists as inadmissible: ${insurer.inadmissible.join(", ")}. Confirm this is unrelated to the request.`);
  else add("Inadmissible conditions", "PASS", insurer.inadmissible.length ? `No mention of: ${insurer.inadmissible.join(", ")}.` : "None listed for this plan.");

  // 4. Waiting period and pre-existing rules (policy start date is not in the chart, so staff must confirm)
  if (insurer.waitingPeriod.days) add("Waiting period", "VERIFY", `${insurer.waitingPeriod.note} Confirm the policy start date.`);
  add("Pre-existing conditions", "VERIFY", insurer.preExisting);

  // 5. Pre-authorization timing and network
  add("Pre-authorization timing", "INFO", insurer.preAuth.planned.rule, insurer.preAuth.planned.quote);
  add("Network", "INFO", insurer.network);

  const status = findings.some((f) => f.result === "FAIL") ? "NOT_COVERED" : findings.some((f) => f.result === "CONDITION") ? "CONDITIONAL" : "COVERED";
  const blocker = findings.find((f) => f.result === "FAIL");
  return {
    insurerId: insurer.id,
    payer: insurer.payer,
    company: insurer.company,
    plan: insurer.plan,
    status,
    summary:
      status === "COVERED"
        ? `${coding.procedureShort} is a covered benefit under ${insurer.plan}.`
        : status === "CONDITIONAL"
          ? `${coding.procedureShort} is covered only under conditions in ${insurer.plan}.`
          : `${coding.procedureShort} is not a covered benefit under ${insurer.plan}: ${blocker.rule}.`,
    blocker: blocker ? { rule: blocker.rule, detail: blocker.detail, quote: blocker.quote } : null,
    override: mri.override || null,
    findings,
    sources: insurer.sources,
    checkedAt: new Date().toISOString(),
  };
}
