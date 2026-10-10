// 1. Intake Agent — turns unstructured notes into structured facts.
// Every fact carries a verbatim evidence quote that must exist in a source document.
import { sentencePool, resolveQuote, isNegated, extractWeeks } from "../utils/text.js";
import { callJSON, withFallback, docsForPrompt } from "../llm.js";

const CATEGORIES = ["diagnosis", "symptom", "prior_treatment", "imaging", "medication", "exam_finding", "red_flag"];

const RULES = [
  { category: "diagnosis", re: /^(assessment|impression)|suspected|diagnos/i },
  { category: "red_flag", re: /(foot drop|progressive (weakness|neurologic)|cauda equina|saddle anesthesia|bowel or bladder|unexplained weight loss|history of cancer)/i, checkNegation: true },
  { category: "prior_treatment", re: /(physical therapy|\bPT\b|injection|brace|home exercise)/i, exclude: /^(plan|continue|recommend|request)/i },
  { category: "medication", re: /\b\d+\s?mg\b/i },
  { category: "imaging", re: /(x-ray|radiograph|\bMRI\b|\bCT\b)/i, exclude: /^plan|request|urgent mri|mri of the/i },
  { category: "exam_finding", re: /(mcmurray|joint line|lachman|effusion|straight leg raise|reflex|strength|sensation|tenderness)/i },
  { category: "symptom", re: /(pain|locking|catching|giving way|instability|radiat|weakness|numb)/i },
];

function ruleIntake(documents) {
  const facts = [];
  for (const s of sentencePool(documents)) {
    // skip document title lines and header fields
    if (s.index === 0 || /^(patient|provider|dob|dates of care|therapist|author):/i.test(s.text) || s.text === s.text.toUpperCase()) continue;
    for (const rule of RULES) {
      const m = s.text.match(rule.re);
      if (!m) continue;
      if (rule.exclude && rule.exclude.test(s.text)) continue;
      if (rule.checkNegation && isNegated(s.text, m.index)) continue;
      facts.push({
        category: rule.category,
        summary: s.text.replace(/^[A-Za-z ]+:\s*/, ""),
        durationWeeks: extractWeeks(s.text) || null,
        evidence_quote: s.text,
        source: { doc_id: s.docId, doc_title: s.docTitle, char_start: s.start, char_end: s.end },
        verified: true,
      });
      break; // one category per sentence keeps the fact list readable
    }
  }
  return facts;
}

const SCHEMA = {
  type: "object",
  properties: {
    facts: {
      type: "array",
      items: {
        type: "object",
        properties: {
          category: { type: "string", enum: CATEGORIES },
          summary: { type: "string" },
          evidence_quote: { type: "string" },
          doc_id: { type: "string" },
        },
        required: ["category", "summary", "evidence_quote", "doc_id"],
        additionalProperties: false,
      },
    },
  },
  required: ["facts"],
  additionalProperties: false,
};

async function llmIntake(documents) {
  const out = await callJSON({
    system:
      "You are a clinical documentation abstractor for a prior authorization team. Extract structured facts from the chart. " +
      "Each evidence_quote must be copied character-for-character from a single document — never paraphrase inside the quote. " +
      "Only extract facts that are affirmatively documented; skip negated findings except to note absent red flags are NOT facts.",
    prompt: `Extract diagnoses, symptoms, prior treatments (with duration and outcome), imaging, medications, exam findings and red flags.\n\n${docsForPrompt(documents)}`,
    schema: SCHEMA,
    effort: "low",
  });
  const facts = [];
  let rejected = 0;
  for (const f of out.facts) {
    const hit = resolveQuote(documents, f.doc_id, f.evidence_quote);
    if (!hit) {
      rejected++;
      continue; // guardrail: unverifiable quotes are dropped in code
    }
    facts.push({
      category: f.category,
      summary: f.summary,
      durationWeeks: extractWeeks(hit.quote) || null,
      evidence_quote: hit.quote,
      source: { doc_id: hit.docId, doc_title: hit.docTitle, char_start: hit.start, char_end: hit.end },
      verified: true,
    });
  }
  facts.rejected = rejected;
  return facts;
}

export async function runIntake(documents) {
  const { result, mode, error } = await withFallback(() => llmIntake(documents), () => ruleIntake(documents));
  return { facts: result, rejected: result.rejected || 0, mode, error };
}
