// 4. Criteria Matcher — for each payer criterion decide MET / MISSING / UNCLEAR
// with verbatim evidence quotes. Claude mode is validated against the chart in code;
// a MET verdict without a verifiable quote is downgraded to UNCLEAR.
import { sentencePool, isNegated, extractWeeks, FAILURE_LANGUAGE, resolveQuote } from "../utils/text.js";
import { callJSON, withFallback, docsForPrompt } from "../llm.js";

function evidenceFrom(s) {
  return { quote: s.text, docId: s.docId, docTitle: s.docTitle, start: s.start, end: s.end };
}

/** Evaluate one rule spec against the sentence pool. */
function evaluateSpec(spec, pool) {
  if (spec.anyOf) {
    const results = spec.anyOf.map((sub) => ({ ...evaluateSpec(sub, pool), label: sub.label }));
    const met = results.find((r) => r.status === "MET");
    if (met) return { ...met, reasoning: `Met via ${met.label}: ${met.reasoning}` };
    const unclear = results.find((r) => r.status === "UNCLEAR");
    if (unclear) return { ...unclear, reasoning: `${unclear.label}: ${unclear.reasoning} ${results.filter((r) => r !== unclear).map((r) => `${r.label}: ${r.reasoning}`).join(" ")}` };
    return { status: "MISSING", evidence: [], confidence: 0.85, reasoning: results.map((r) => `${r.label}: ${r.reasoning}`).join(" ") };
  }

  const res = spec.patterns.map((p) => new RegExp(p, "i"));
  const positive = [];
  const negated = [];
  for (const s of pool) {
    for (const re of res) {
      const m = s.text.match(re);
      if (!m) continue;
      (isNegated(s.text, m.index) ? negated : positive).push(s);
      break;
    }
  }

  if (positive.length === 0) {
    if (negated.length) {
      return { status: "MISSING", evidence: [evidenceFrom(negated[0])], confidence: 0.9, reasoning: `The chart explicitly states this was not done: "${negated[0].text}"` };
    }
    return { status: "MISSING", evidence: [], confidence: 0.85, reasoning: "No supporting documentation found in the chart." };
  }

  // rank: duration/failure-bearing sentences first, "negative/equivocal" findings last
  const score = (s) => (extractWeeks(s.text) ? 2 : 0) + (FAILURE_LANGUAGE.test(s.text) ? 1 : 0) - (/\b(negative|equivocal|normal)\b/i.test(s.text) ? 3 : 0);
  positive.sort((a, b) => score(b) - score(a));

  if (spec.minWeeks) {
    const best = Math.max(...positive.map((s) => extractWeeks(s.text)));
    const withDuration = positive.filter((s) => extractWeeks(s.text) === best);
    if (best === 0) {
      return { status: "UNCLEAR", evidence: positive.slice(0, 2).map(evidenceFrom), confidence: 0.55, reasoning: `Treatment is mentioned but no duration is documented (policy requires ${spec.minWeeks} weeks).` };
    }
    if (best < spec.minWeeks) {
      return { status: "MISSING", evidence: withDuration.slice(0, 2).map(evidenceFrom), confidence: 0.88, reasoning: `Only ${best} weeks documented; policy requires at least ${spec.minWeeks} weeks.` };
    }
    if (spec.requireFailure) {
      const failed = withDuration.find((s) => FAILURE_LANGUAGE.test(s.text) || FAILURE_LANGUAGE.test(s.next));
      if (!failed) {
        return { status: "UNCLEAR", evidence: withDuration.slice(0, 2).map(evidenceFrom), confidence: 0.6, reasoning: `${best} weeks documented, but the outcome (failure / inadequate response) is not stated.` };
      }
      // only cite sentences that satisfy the duration, never an older shorter course
      const qualifying = positive.filter((s) => s !== failed && extractWeeks(s.text) >= spec.minWeeks);
      return { status: "MET", evidence: [failed, ...qualifying].slice(0, 2).map(evidenceFrom), confidence: 0.93, reasoning: `${best} weeks documented (≥ ${spec.minWeeks} required) with inadequate response.` };
    }
    return { status: "MET", evidence: withDuration.slice(0, 2).map(evidenceFrom), confidence: 0.9, reasoning: `${best} weeks documented (≥ ${spec.minWeeks} required).` };
  }

  const confidence = score(positive[0]) < 0 ? 0.65 : positive.length > 1 ? 0.92 : 0.84;
  return { status: "MET", evidence: positive.slice(0, 2).map(evidenceFrom), confidence, reasoning: `Documented in ${new Set(positive.map((s) => s.docTitle)).size} document(s).` };
}

function ruleMatch(policy, documents) {
  const pool = sentencePool(documents);
  return policy.criteria.map((c) => ({ criterionId: c.id, text: c.text, required: c.required, ref: c.ref, ...evaluateSpec(c.spec, pool) }));
}

const SCHEMA = {
  type: "object",
  properties: {
    results: {
      type: "array",
      items: {
        type: "object",
        properties: {
          criterion_id: { type: "string" },
          status: { type: "string", enum: ["MET", "MISSING", "UNCLEAR"] },
          confidence: { type: "number" },
          reasoning: { type: "string" },
          evidence: {
            type: "array",
            items: {
              type: "object",
              properties: { quote: { type: "string" }, doc_id: { type: "string" } },
              required: ["quote", "doc_id"],
              additionalProperties: false,
            },
          },
        },
        required: ["criterion_id", "status", "confidence", "reasoning", "evidence"],
        additionalProperties: false,
      },
    },
  },
  required: ["results"],
  additionalProperties: false,
};

async function llmMatch(policy, documents) {
  const criteriaText = policy.criteria.map((c) => `- ${c.id} (${c.required ? "required" : "supporting"}): ${c.text}`).join("\n");
  const out = await callJSON({
    system:
      "You are a meticulous prior authorization reviewer. For each payer criterion decide MET, MISSING or UNCLEAR strictly from the chart. " +
      "MET requires affirmative documentation; durations must meet the stated minimum; negated findings ('has not', 'denies') are not evidence. " +
      "Use UNCLEAR when something is mentioned but key details (duration, outcome) are missing. " +
      "Evidence quotes must be copied exactly, character-for-character, from the named document. Keep reasoning to one sentence.",
    prompt: `Payer policy ${policy.id} criteria:\n${criteriaText}\n\nPatient chart:\n${docsForPrompt(documents)}`,
    schema: SCHEMA,
    effort: "medium",
  });

  // Evidence grounding: how many model quotes were found verbatim, repaired to a real sentence, or rejected.
  const grounding = { returned: 0, exact: 0, repaired: 0, rejected: 0 };
  const mapped = policy.criteria.map((c) => {
    const r = out.results.find((x) => x.criterion_id === c.id);
    if (!r) return { criterionId: c.id, text: c.text, required: c.required, ref: c.ref, status: "UNCLEAR", evidence: [], confidence: 0.3, reasoning: "Model did not return a verdict for this criterion." };
    const evidence = [];
    for (const e of r.evidence) {
      grounding.returned++;
      const hit = resolveQuote(documents, e.doc_id, e.quote);
      if (!hit) grounding.rejected++;
      else if (hit.fuzzy) grounding.repaired++;
      else grounding.exact++;
      if (hit) evidence.push({ quote: hit.quote, docId: hit.docId, docTitle: hit.docTitle, start: hit.start, end: hit.end });
    }
    let status = r.status;
    let reasoning = r.reasoning;
    if (status === "MET" && evidence.length === 0) {
      status = "UNCLEAR";
      reasoning = `Downgraded: no verifiable quote supports this verdict. (${reasoning})`;
    }
    return { criterionId: c.id, text: c.text, required: c.required, ref: c.ref, status, evidence: evidence.slice(0, 3), confidence: Math.max(0, Math.min(1, r.confidence)), reasoning };
  });
  mapped.grounding = grounding;
  return mapped;
}

// MATCHER_AUTHORITY=rules (default): rule checks decide MET/MISSING/UNCLEAR and the LLM acts as an
// independent second opinion, with disagreements shown in the reasoning. Small models are unreliable at
// duration arithmetic and negation, so they should not decide who gets flagged for denial.
// MATCHER_AUTHORITY=llm: the LLM's verdicts are used directly (recommended for large models).
async function advisoryMatch(policy, documents) {
  const rules = ruleMatch(policy, documents);
  const second = await llmMatch(policy, documents);
  let disagreements = 0;
  const merged = rules.map((r) => {
    const s = second.find((x) => x.criterionId === r.criterionId);
    if (!s || s.status === r.status) return r;
    disagreements++;
    return { ...r, secondOpinion: { status: s.status, reasoning: s.reasoning }, reasoning: `${r.reasoning} (Second opinion: ${s.status}. ${s.reasoning})` };
  });
  merged.disagreements = disagreements;
  merged.grounding = second.grounding;
  merged.secondOpinion = second.map((s) => ({ criterionId: s.criterionId, status: s.status }));
  return merged;
}

export async function runMatcher(policy, documents, decisions = {}) {
  const authority = (process.env.MATCHER_AUTHORITY || "rules").toLowerCase();
  const llmFn = authority === "llm" ? () => llmMatch(policy, documents) : () => advisoryMatch(policy, documents);
  const { result, mode, error } = await withFallback(llmFn, () => ruleMatch(policy, documents));
  // Human decisions from the gap panel override the machine verdict.
  const results = result.map((r) => (decisions[r.criterionId] === "na" ? { ...r, status: "NOT_APPLICABLE", reasoning: "Marked not applicable by a human reviewer." } : r));
  return { results, mode, error, grounding: result.grounding || null, secondOpinion: result.secondOpinion || null, authority };
}

/** Rule-based check used by the Appeal Agent to search the *current* chart. */
export function matchCriterionRules(criterion, documents) {
  return evaluateSpec(criterion.spec, sentencePool(documents));
}
