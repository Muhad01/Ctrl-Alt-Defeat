// LLM wrapper. Agents call callJSON() for schema-constrained output and fall back
// to their rule-based implementation if no LLM is configured or the call fails.
//
// LLM_PROVIDER (alias AI_PROVIDER): auto | mistral | claude | groq | ollama | rules
//   auto  = Claude if ANTHROPIC_API_KEY is set, else Mistral if MISTRAL_API_KEY, else Groq if GROQ_API_KEY,
//           else the offline rule engine
//   rules = deterministic offline engine (no network, no key)
// AI_MODE=heuristic is still honoured as an alias for LLM_PROVIDER=rules.
//
// Vision (reading scanned reports / photos): callJSON({ images }) sends images to the provider.
// VISION_MODEL overrides the model used for image calls (otherwise a per-provider default).
import Anthropic from "@anthropic-ai/sdk";

const PROVIDERS = {
  claude: { label: "Claude", defaultModel: "claude-opus-5-5", modelEnv: "CLAUDE_MODEL", keyEnv: "ANTHROPIC_API_KEY", vision: "same" },
  mistral: { label: "Mistral", defaultModel: "ministral-3b-2512", modelEnv: "MISTRAL_MODEL", keyEnv: "MISTRAL_API_KEY", vision: "same" },
  groq: { label: "Groq", defaultModel: "openai/gpt-oss-120b", modelEnv: "GROQ_MODEL", keyEnv: "GROQ_API_KEY", vision: "meta-llama/llama-4-scout-17b-16e-instruct" },
  ollama: { label: "Ollama", defaultModel: "qwen2.5:7b-instruct", modelEnv: "OLLAMA_MODEL", keyEnv: null, vision: process.env.OLLAMA_VISION_MODEL || "qwen2.5vl:7b" },
};

let anthropic = null;
let forceHeuristic = false;

function requested() {
  const v = (process.env.LLM_PROVIDER || process.env.AI_PROVIDER || "auto").toLowerCase();
  if ((process.env.AI_MODE || "").toLowerCase() === "heuristic") return "rules";
  return v;
}

export function provider() {
  const want = requested();
  if (want === "rules") return null;
  if (PROVIDERS[want]) return want;
  if (process.env.ANTHROPIC_API_KEY) return "claude";
  if (process.env.MISTRAL_API_KEY) return "mistral";
  if (process.env.GROQ_API_KEY) return "groq";
  return null;
}

function model(p = provider()) {
  const cfg = PROVIDERS[p];
  return cfg ? process.env[cfg.modelEnv] || cfg.defaultModel : null;
}

function visionModel(p = provider()) {
  if (process.env.VISION_MODEL) return process.env.VISION_MODEL;
  const v = PROVIDERS[p]?.vision;
  return v === "same" ? model(p) : v;
}

export function llmEnabled() {
  if (forceHeuristic) return false;
  const p = provider();
  if (!p) return false;
  return PROVIDERS[p].keyEnv ? Boolean(process.env[PROVIDERS[p].keyEnv]) : true;
}

/** Used by the seed script so seeding never spends tokens. */
export function setForceHeuristic(v) {
  forceHeuristic = v;
}

export function aiModeInfo() {
  if (!llmEnabled()) return { mode: "rules", provider: null, providerLabel: null, model: null, visionModel: null };
  return { mode: "llm", provider: provider(), providerLabel: PROVIDERS[provider()].label, model: model(), visionModel: visionModel() };
}

/**
 * Ask the configured LLM for JSON that matches `schema` (structured outputs).
 * `images`: optional [{ mime, data(base64) }] for vision calls.
 * Throws on refusal / truncation / API errors so callers can fall back.
 */
export async function callJSON(opts) {
  const p = provider();
  if (p === "claude") return claudeJSON(opts);
  if (p === "ollama") return ollamaJSON(opts);
  if (p === "groq") return openAICompatJSON({ ...opts, url: "https://api.groq.com/openai/v1/chat/completions", key: process.env.GROQ_API_KEY, label: "Groq", jsonMode: (process.env.GROQ_JSON_MODE || "schema").toLowerCase() });
  return openAICompatJSON({ ...opts, url: "https://api.mistral.ai/v1/chat/completions", key: process.env.MISTRAL_API_KEY, label: "Mistral", jsonMode: "schema" });
}

function userContent(prompt, images) {
  if (!images?.length) return prompt;
  return [{ type: "text", text: prompt }, ...images.map((im) => ({ type: "image_url", image_url: { url: `data:${im.mime};base64,${im.data}` } }))];
}

/** Mistral and Groq both speak the OpenAI chat-completions dialect. */
async function openAICompatJSON({ system, prompt, schema, images, maxTokens = 8000, url, key, label, jsonMode }) {
  const send = async (mode) => {
    const body = {
      model: images?.length ? visionModel() : model(),
      temperature: 0.1,
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: mode === "object" ? `${system}\nRespond with a single JSON object that matches this JSON schema:\n${JSON.stringify(schema)}` : system },
        { role: "user", content: userContent(prompt, images) },
      ],
      response_format: mode === "object" ? { type: "json_object" } : { type: "json_schema", json_schema: { name: "result", schema, strict: true } },
    };
    return fetch(url, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` }, body: JSON.stringify(body), signal: AbortSignal.timeout(120_000) });
  };
  let res = await send(jsonMode);
  // Not every model supports strict JSON schema; retry once in plain JSON mode.
  if (!res.ok && res.status === 400 && jsonMode === "schema") res = await send("object");
  if (!res.ok) throw new Error(`${label} API ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  const choice = data.choices?.[0];
  if (choice?.finish_reason === "length") throw new Error(`${label} response was truncated`);
  const content = choice?.message?.content;
  const text = Array.isArray(content) ? content.map((c) => c.text || "").join("") : content;
  return parseJSON(text);
}

async function ollamaJSON({ system, prompt, schema, images }) {
  const base = (process.env.OLLAMA_URL || "http://localhost:11434").replace(/\/$/, "");
  const res = await fetch(`${base}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: images?.length ? visionModel() : model(),
      stream: false,
      format: schema,
      options: { temperature: 0.1 },
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt, ...(images?.length ? { images: images.map((im) => im.data) } : {}) },
      ],
    }),
    signal: AbortSignal.timeout(300_000),
  });
  if (!res.ok) throw new Error(`Ollama ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  return parseJSON(data.message?.content);
}

async function claudeJSON({ system, prompt, schema, images, effort = "medium", maxTokens = 16000 }) {
  anthropic ??= new Anthropic();
  const content = images?.length
    ? [...images.map((im) => (im.mime === "application/pdf" ? { type: "document", source: { type: "base64", media_type: im.mime, data: im.data } } : { type: "image", source: { type: "base64", media_type: im.mime, data: im.data } })), { type: "text", text: prompt }]
    : prompt;
  const response = await anthropic.beta.messages.create({
    model: images?.length ? visionModel() : model(),
    max_tokens: maxTokens,
    system,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort, format: { type: "json_schema", schema } },
    messages: [{ role: "user", content }],
  });
  if (response.stop_reason === "refusal") throw new Error("Claude declined the request");
  if (response.stop_reason === "max_tokens") throw new Error("Claude response was truncated");
  const text = response.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");
  return parseJSON(text);
}

/** Claude can read PDFs natively; other providers get page images or extracted text instead. */
export function providerReadsPdf() {
  return provider() === "claude";
}

function parseJSON(text) {
  if (typeof text !== "string") throw new Error("Empty model response");
  try {
    return JSON.parse(text);
  } catch {
    const m = text.match(/\{[\s\S]*\}/); // tolerate code fences / prose around the object
    if (!m) throw new Error("Model did not return JSON");
    return JSON.parse(m[0]);
  }
}

/** Run an LLM implementation with a rule-based fallback. Returns { result, mode, error }. */
export async function withFallback(llmFn, ruleFn) {
  if (llmEnabled()) {
    try {
      return { result: await llmFn(), mode: provider() };
    } catch (err) {
      console.warn("[llm] falling back to rules:", err.message);
      return { result: await ruleFn(), mode: "rules", error: err.message };
    }
  }
  return { result: await ruleFn(), mode: "rules" };
}

/** Documents formatted for prompts, each wrapped with its id. */
export function docsForPrompt(documents) {
  return documents.map((d) => `<document id="${d.id}" title="${d.title}" date="${d.date}">\n${d.text}\n</document>`).join("\n\n");
}
