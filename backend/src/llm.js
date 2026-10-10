// LLM wrapper. Agents call callJSON() for schema-constrained output and fall back
// to their rule-based implementation if no LLM is configured or the call fails.
//
// Provider (AI_PROVIDER): "mistral" | "claude". Default: mistral when MISTRAL_API_KEY is set,
// otherwise claude when ANTHROPIC_API_KEY is set.
// AI_MODE=auto (default): use the provider when its key is set
// AI_MODE=heuristic     : never call an LLM
import Anthropic from "@anthropic-ai/sdk";

const PROVIDERS = {
  mistral: { label: "Mistral", defaultModel: "ministral-3b-2512", modelEnv: "MISTRAL_MODEL", keyEnv: "MISTRAL_API_KEY" },
  claude: { label: "Claude", defaultModel: "claude-opus-5-5", modelEnv: "CLAUDE_MODEL", keyEnv: "ANTHROPIC_API_KEY" },
};

let anthropic = null;
let forceHeuristic = false;

export function provider() {
  const explicit = (process.env.AI_PROVIDER || "").toLowerCase();
  if (PROVIDERS[explicit]) return explicit;
  if (process.env.MISTRAL_API_KEY) return "mistral";
  if (process.env.ANTHROPIC_API_KEY) return "claude";
  return null;
}

function model() {
  const p = PROVIDERS[provider()];
  return p ? process.env[p.modelEnv] || p.defaultModel : null;
}

export function llmEnabled() {
  if (forceHeuristic) return false;
  if ((process.env.AI_MODE || "auto").toLowerCase() === "heuristic") return false;
  const p = provider();
  return Boolean(p && process.env[PROVIDERS[p].keyEnv]);
}

/** Used by the seed script so seeding never spends tokens. */
export function setForceHeuristic(v) {
  forceHeuristic = v;
}

export function aiModeInfo() {
  if (!llmEnabled()) return { mode: "rules", provider: null, providerLabel: null, model: null };
  return { mode: "llm", provider: provider(), providerLabel: PROVIDERS[provider()].label, model: model() };
}

/**
 * Ask the configured LLM for JSON that matches `schema` (structured outputs).
 * Throws on refusal / truncation / API errors so callers can fall back.
 */
export async function callJSON(opts) {
  return provider() === "mistral" ? mistralJSON(opts) : claudeJSON(opts);
}

async function mistralJSON({ system, prompt, schema, maxTokens = 8000 }) {
  const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.MISTRAL_API_KEY}` },
    body: JSON.stringify({
      model: model(),
      temperature: 0.1,
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_schema", json_schema: { name: "result", schema, strict: true } },
    }),
    signal: AbortSignal.timeout(90_000),
  });
  if (!res.ok) throw new Error(`Mistral API ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  const choice = data.choices?.[0];
  if (choice?.finish_reason === "length") throw new Error("Mistral response was truncated");
  const content = choice?.message?.content;
  const text = Array.isArray(content) ? content.map((c) => c.text || "").join("") : content;
  return JSON.parse(text);
}

async function claudeJSON({ system, prompt, schema, effort = "medium", maxTokens = 16000 }) {
  anthropic ??= new Anthropic();
  const response = await anthropic.beta.messages.create({
    model: model(),
    max_tokens: maxTokens,
    system,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort, format: { type: "json_schema", schema } },
    messages: [{ role: "user", content: prompt }],
  });
  if (response.stop_reason === "refusal") throw new Error("Claude declined the request");
  if (response.stop_reason === "max_tokens") throw new Error("Claude response was truncated");
  const text = response.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");
  return JSON.parse(text);
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
