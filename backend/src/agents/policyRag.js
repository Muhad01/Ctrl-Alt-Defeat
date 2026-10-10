// 3. Policy Agent (RAG) — retrieves payer coverage criteria.
// Pipeline: chunk policies by section → metadata filter (payer + CPT) → rank sections by cosine
// similarity: bge-small embeddings when loaded, TF-IDF vectors as the fallback.
import { db, loadVectors, saveVectors } from "../db.js";
import { findPolicy } from "../data/policies.js";

const STOP = new Set("a an and are as at be by for from has have in is it its of on or that the this to was were will with without must may not".split(" "));

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOP.has(t));
}

let index = null;

export function buildIndex() {
  const chunks = [];
  for (const p of db().policies) {
    for (const s of p.sections) {
      chunks.push({ policyId: p.id, payer: p.payer, cpts: p.cpts, ref: s.ref, title: s.title, text: s.text, tokens: tokenize(`${s.title} ${s.text}`) });
    }
  }
  const df = new Map();
  for (const c of chunks) for (const t of new Set(c.tokens)) df.set(t, (df.get(t) || 0) + 1);
  const idf = new Map([...df].map(([t, n]) => [t, Math.log((chunks.length + 1) / (n + 1)) + 1]));
  for (const c of chunks) c.vec = vectorize(c.tokens, idf);
  index = { chunks, idf };
  return index;
}

function vectorize(tokens, idf) {
  const tf = new Map();
  for (const t of tokens) tf.set(t, (tf.get(t) || 0) + 1);
  const vec = new Map();
  let norm = 0;
  for (const [t, n] of tf) {
    const w = (n / tokens.length) * (idf.get(t) || 1);
    vec.set(t, w);
    norm += w * w;
  }
  norm = Math.sqrt(norm) || 1;
  for (const [t, w] of vec) vec.set(t, w / norm);
  return vec;
}

function cosine(a, b) {
  let s = 0;
  for (const [t, w] of a) if (b.has(t)) s += w * b.get(t);
  return s;
}

const matches = ({ payer, cpt, policyId }) => (c) => (!policyId || c.policyId === policyId) && (!payer || c.payer === payer) && (!cpt || c.cpts.includes(cpt) || c.cpts.includes("*"));

export function search(query, { payer, cpt, policyId, limit = 8 } = {}) {
  if (!index) buildIndex();
  const qv = vectorize(tokenize(query), index.idf);
  return index.chunks
    .filter(matches({ payer, cpt, policyId }))
    .map((c) => ({ policyId: c.policyId, payer: c.payer, ref: c.ref, title: c.title, text: c.text, score: Number(cosine(qv, c.vec).toFixed(4)) }))
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// ── Semantic search with a local open embedding model (BAAI/bge-small-en-v1.5 via transformers.js).
// Chunk vectors are computed once and cached to disk; at query time only the short query is embedded.
// Until the model is ready (or if EMBEDDINGS=off / loading fails) search falls back to TF-IDF.
const EMBED_MODEL = "Xenova/bge-small-en-v1.5";
const embed = { status: process.env.EMBEDDINGS === "off" ? "disabled" : "idle", extractor: null, vectors: new Map(), error: null };

export function embeddingStatus() {
  return { status: embed.status, model: EMBED_MODEL, chunks: embed.vectors.size, error: embed.error };
}

async function embedTexts(texts) {
  const out = await embed.extractor(texts, { pooling: "cls", normalize: true });
  return out.tolist();
}

export async function warmEmbeddings() {
  if (embed.status === "disabled" || embed.status === "loading") return;
  embed.status = "loading";
  try {
    const { pipeline } = await import("@huggingface/transformers");
    embed.extractor = await pipeline("feature-extraction", EMBED_MODEL, { dtype: "q8" });
    if (!index) buildIndex();
    // vectors live in the policy_chunks collection (MongoDB) or a local cache file
    const cache = await loadVectors();
    const missing = index.chunks.filter((c) => !cache[chunkKey(c)]);
    const fresh = [];
    for (let i = 0; i < missing.length; i += 16) {
      const batch = missing.slice(i, i + 16);
      const vecs = await embedTexts(batch.map((c) => `${c.title}. ${c.text}`));
      batch.forEach((c, k) => {
        cache[chunkKey(c)] = vecs[k];
        fresh.push({ key: chunkKey(c), policyId: c.policyId, payer: c.payer, cpts: c.cpts, ref: c.ref, title: c.title, text: c.text, model: EMBED_MODEL, embedding: vecs[k] });
      });
    }
    await saveVectors(fresh);
    embed.vectors = new Map(index.chunks.map((c) => [chunkKey(c), cache[chunkKey(c)]]));
    embed.status = "ready";
    console.log(`[rag] ${EMBED_MODEL} ready: ${embed.vectors.size} policy chunks embedded (${missing.length} new)`);
  } catch (err) {
    embed.status = "failed";
    embed.error = err.message;
    console.warn("[rag] embeddings unavailable, using TF-IDF:", err.message);
  }
}

const chunkKey = (c) => `${c.policyId}§${c.ref}:${c.text.length}`;
const dot = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0);

/** Semantic search when embeddings are ready, otherwise TF-IDF. */
export async function semanticSearch(query, { payer, cpt, policyId, limit = 8 } = {}) {
  if (embed.status !== "ready") return { method: "tfidf", results: search(query, { payer, cpt, policyId, limit }) };
  if (!index) buildIndex();
  // bge models recommend this instruction prefix for retrieval queries
  const [qv] = await embedTexts([`Represent this sentence for searching relevant passages: ${query}`]);
  const results = index.chunks
    .filter(matches({ payer, cpt, policyId }))
    .map((c) => ({ policyId: c.policyId, payer: c.payer, ref: c.ref, title: c.title, text: c.text, score: Number(dot(qv, embed.vectors.get(chunkKey(c)) || qv.map(() => 0)).toFixed(4)) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  return { method: "embeddings", results };
}

export async function runPolicyRetrieval({ payer, cpt, procedure, diagnoses }) {
  // Procedure-specific policy first; anything else falls back to the payer's general medical-necessity policy.
  const policy = findPolicy(db().policies, payer, cpt);
  if (!policy) return { policy: null, criteria: [], retrieved: [], method: null };
  const query = `${procedure} ${diagnoses.map((d) => d.desc).join(" ")} prior treatment diagnostic testing criteria medically necessary`;
  const { method, results } = await semanticSearch(query, { policyId: policy.id, limit: 5 });
  return {
    policy: { id: policy.id, name: policy.name, payer: policy.payer, version: policy.version, real: Boolean(policy.real), general: policy.cpts.includes("*") },
    criteria: policy.criteria.map(({ id, ref, text, required }) => ({ id, ref, text, required, policy_citation: `${policy.id} §${ref}` })),
    retrieved: results,
    method,
  };
}
