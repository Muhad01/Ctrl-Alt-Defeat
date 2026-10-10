// Text helpers shared by agents: sentence splitting with character offsets,
// verbatim quote validation, negation and duration detection.

export function splitSentences(text) {
  const out = [];
  // A period between digits ("BMI 38.5", "13.8 g/dL") is a decimal point, not a sentence end.
  const re = /(?:[^.!?\n]|\.(?=\d))+(?:[.!?]+|\n|$)/g;
  let m;
  while ((m = re.exec(text))) {
    if (m[0].length === 0) {
      re.lastIndex++;
      continue;
    }
    const raw = m[0];
    const lead = raw.length - raw.trimStart().length;
    const t = raw.trim();
    if (t.length < 4) continue;
    const start = m.index + lead;
    out.push({ text: t, start, end: start + t.length });
  }
  return out;
}

/** All sentences across documents, tagged with their doc id. */
export function sentencePool(documents) {
  const pool = [];
  for (const doc of documents) {
    const sentences = splitSentences(doc.text);
    sentences.forEach((s, i) => pool.push({ ...s, docId: doc.id, docTitle: doc.title, index: i, next: sentences.slice(i + 1, i + 3).map((x) => x.text).join(" ") }));
  }
  return pool;
}

/**
 * Locate a quote inside a document. Exact match first, then a whitespace-insensitive
 * match. Returns { start, end, quote } using the document's own text, or null.
 * This is the "evidence or it did not happen" guardrail.
 */
export function findQuote(docText, quote) {
  if (!quote || !docText) return null;
  const q = quote.trim().replace(/^["“]|["”]$/g, "");
  if (q.length < 8) return null;
  const exact = docText.indexOf(q);
  if (exact !== -1) return { start: exact, end: exact + q.length, quote: q };

  // whitespace-normalised search with an index map back to the original text
  let norm = "";
  const map = [];
  let prevSpace = false;
  for (let i = 0; i < docText.length; i++) {
    const ch = docText[i];
    if (/\s/.test(ch)) {
      if (prevSpace) continue;
      norm += " ";
      map.push(i);
      prevSpace = true;
    } else {
      norm += ch.toLowerCase();
      map.push(i);
      prevSpace = false;
    }
  }
  const nq = q.replace(/\s+/g, " ").toLowerCase();
  const idx = norm.indexOf(nq);
  if (idx === -1) return null;
  const start = map[idx];
  const end = map[idx + nq.length - 1] + 1;
  return { start, end, quote: docText.slice(start, end) };
}

export function validateQuote(documents, docId, quote) {
  const candidates = docId ? documents.filter((d) => d.id === docId) : [];
  for (const doc of [...candidates, ...documents.filter((d) => d.id !== docId)]) {
    const hit = findQuote(doc.text, quote);
    if (hit) return { ...hit, docId: doc.id, docTitle: doc.title };
  }
  return null;
}

const tokens = (s) => new Set(s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((t) => t.length > 2));

/**
 * Like validateQuote, but if the model paraphrased, resolve to the real chart sentence
 * with the highest word overlap (≥ 60% of the quote's words). The returned quote is
 * always verbatim chart text; `fuzzy` marks that it was resolved this way.
 */
export function resolveQuote(documents, docId, quote) {
  const exact = validateQuote(documents, docId, quote);
  if (exact) return exact;
  const q = tokens(quote || "");
  if (q.size < 3) return null;
  let best = null;
  for (const s of sentencePool(documents)) {
    const st = tokens(s.text);
    let hit = 0;
    for (const t of q) if (st.has(t)) hit++;
    const score = hit / q.size + (s.docId === docId ? 0.05 : 0);
    if (!best || score > best.score) best = { score, s };
  }
  if (!best || best.score < 0.6) return null;
  return { quote: best.s.text, start: best.s.start, end: best.s.end, docId: best.s.docId, docTitle: best.s.docTitle, fuzzy: true };
}

// Negation within three words directly before the keyword, e.g. "has not attended PT",
// "denies bowel or bladder", "no prior x-ray". "No improvement after 6 weeks of PT" is NOT negated.
const NEGATION_BEFORE = /\b(no|not|denies|denied|never|without|hasn't|has not|did not|didn't|negative for)\b(\s+[\w',/-]+){0,4}\s*$/i;

export function isNegated(sentence, matchIndex) {
  const window = sentence.slice(Math.max(0, matchIndex - 50), matchIndex);
  return NEGATION_BEFORE.test(window);
}

const NUMBER_WORDS = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12 };

/** Largest duration in weeks mentioned in a sentence ("8 weeks", "three months"). */
export function extractWeeks(sentence) {
  const re = /\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)[\s-]*(weeks?|wks?|months?)\b/gi;
  let max = 0;
  let m;
  while ((m = re.exec(sentence))) {
    const n = NUMBER_WORDS[m[1].toLowerCase()] ?? parseInt(m[1], 10);
    const weeks = m[2].toLowerCase().startsWith("m") ? n * 4 : n;
    if (weeks > max) max = weeks;
  }
  return max;
}

export const FAILURE_LANGUAGE = /(minimal (relief|improvement)|no (meaningful |significant )?(improvement|relief)|without (adequate |significant )?(relief|improvement)|persistent|failed|did not (improve|help)|continued (pain|episodes)|little relief|inadequate|not helpful|plateau|only slightly|no change|despite|refractory|uncontrolled|worsening|recurrent (episodes|attacks|symptoms))/i;

export function maskName(name = "") {
  return name
    .split(" ")
    .map((p) => (p ? p[0] + "*".repeat(Math.max(2, p.length - 1)) : p))
    .join(" ");
}

export function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/** Small deterministic PRNG so synthetic data is reproducible. */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashString(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
