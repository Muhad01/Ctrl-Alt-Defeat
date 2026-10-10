// 7. Insurer Simulator (adversarial review) + Rebuttal Agent.
// The simulator plays the payer's reviewer and tries to deny the packet, citing policy sections.
// The rebuttal agent fixes each objection with verified chart evidence, rebuts it, or opens a gap.
// Guardrails: objections must cite a real policy section; fixes must use verified quotes.
import { callJSON, llmEnabled, provider } from "../llm.js";
import { newId } from "../db.js";

const MAX_ROUNDS = 3;

function letterCites(packet, criterionId) {
  const ns = packet.criteriaCitations?.[criterionId] || [];
  return ns.some((n) => packet.letter.includes(`[${n}]`));
}

function ruleObjections({ policy, results, packet }) {
  const objections = [];
  for (const c of policy.criteria) {
    const r = results.find((x) => x.criterionId === c.id);
    if (!r || r.status === "NOT_APPLICABLE") continue;
    if (c.required && r.status !== "MET") {
      objections.push({
        criterionId: c.id,
        section: c.ref,
        severity: "BLOCKING",
        denialClass: c.denialClass,
        statement: `Per ${policy.id} §${c.ref}, "${c.text}" must be supported by the record. ${r.status === "MISSING" ? "The submission contains no supporting documentation." : `The documentation is insufficient: ${r.reasoning}`} Request would be denied.`,
      });
    } else if (r.status === "MET" && !letterCites(packet, c.id)) {
      objections.push({ criterionId: c.id, section: c.ref, severity: c.required ? "BLOCKING" : "WEAK", denialClass: c.denialClass, statement: `The letter does not demonstrate ${policy.id} §${c.ref} ("${c.text}"). Reviewers will not search the attachments for it.` });
    } else if (r.status === "MET" && r.confidence < 0.8) {
      objections.push({ criterionId: c.id, section: c.ref, severity: "WEAK", denialClass: c.denialClass, statement: `Evidence for §${c.ref} is weak or equivocal ("${r.evidence[0]?.quote}"). A strict reviewer may question it.` });
    }
  }
  return objections;
}

const SCHEMA = {
  type: "object",
  properties: {
    objections: {
      type: "array",
      items: {
        type: "object",
        properties: {
          criterion_id: { type: "string" },
          policy_section: { type: "string" },
          severity: { type: "string", enum: ["BLOCKING", "WEAK"] },
          statement: { type: "string" },
        },
        required: ["criterion_id", "policy_section", "severity", "statement"],
        additionalProperties: false,
      },
    },
  },
  required: ["objections"],
  additionalProperties: false,
};

async function llmObjections({ policy, results, packet }) {
  const out = await callJSON({
    system:
      `You are a strict utilization-management medical reviewer at ${policy.payer}. Your job is to find every legitimate reason to deny this prior authorization request under the policy. ` +
      "Each objection MUST cite the exact policy section number it relies on and the criterion id. Do not invent requirements that are not in the policy. " +
      "Mark BLOCKING only if the policy requirement is genuinely unmet or undemonstrated in the letter; otherwise WEAK. Return an empty list if you cannot find a valid reason to deny.",
    prompt:
      `Policy ${policy.id}:\n${policy.sections.map((s) => `§${s.ref} ${s.title}: ${s.text}`).join("\n")}\n\nCriteria ids: ${policy.criteria.map((c) => `${c.id}=§${c.ref}`).join(", ")}\n\n` +
      `Submitted letter:\n${packet.letter}\n\nCitations:\n${packet.citations.map((c) => `[${c.n}] "${c.quote}"`).join("\n")}`,
    schema: SCHEMA,
    effort: "medium",
  });
  const valid = [];
  for (const o of out.objections) {
    const criterion = policy.criteria.find((c) => c.id === o.criterion_id);
    const sectionOk = policy.sections.some((s) => s.ref === o.policy_section.replace(/^§/, ""));
    if (!criterion || !sectionOk) continue; // guardrail: objections without a real policy citation are discarded
    valid.push({ criterionId: criterion.id, section: criterion.ref, severity: o.severity, denialClass: criterion.denialClass, statement: o.statement });
  }
  return { valid, discarded: out.objections.length - valid.length };
}

/** Rebuttal: resolve one objection against the packet. Mutates packet when evidence is added. */
function rebut(objection, { results, packet }) {
  const r = results.find((x) => x.criterionId === objection.criterionId);
  if (!r || r.status === "MISSING" || r.status === "UNCLEAR") {
    return { type: "GAP_CREATED", message: `No chart evidence available. Routed to the clinician as a documentation gap.` };
  }
  if (!letterCites(packet, r.criterionId) && r.evidence.length) {
    const ev = r.evidence[0];
    let cit = packet.citations.find((c) => c.quote === ev.quote);
    if (!cit) {
      cit = { n: packet.citations.length + 1, ...ev };
      packet.citations.push(cit);
    }
    packet.criteriaCitations[r.criterionId] = [cit.n];
    const lines = packet.letter.split("\n");
    const idx = lines.findIndex((l) => l.startsWith("## Medical Necessity"));
    lines.splice(idx > 0 ? idx - 1 : lines.length, 0, `- **${r.criterionId}, ${r.text}:** "${ev.quote}" [${cit.n}]`);
    packet.letter = lines.join("\n");
    return { type: "EVIDENCE_ADDED", message: `Added chart evidence to the letter.`, quote: ev.quote, docTitle: ev.docTitle };
  }
  if (r.evidence.length >= 2 || r.confidence >= 0.8) {
    return { type: "REBUTTED", message: `The criterion is documented in the chart and cited in the letter.`, quote: r.evidence[0]?.quote, docTitle: r.evidence[0]?.docTitle };
  }
  return { type: "UNRESOLVED", message: "Evidence exists but is limited. Flagged for the human reviewer." };
}

export async function runInsurerSimulator({ policy, results, packet }) {
  const rounds = [];
  let mode = llmEnabled() ? provider() : "rules";
  let discarded = 0;
  const resolvedKeys = new Set();
  let roundsRun = 0;

  for (let round = 1; round <= MAX_ROUNDS; round++) {
    roundsRun = round;
    let objections;
    if (mode !== "rules") {
      try {
        const out = await llmObjections({ policy, results, packet });
        objections = out.valid;
        discarded += out.discarded;
      } catch (err) {
        console.warn("[insurer] falling back to rules:", err.message);
        mode = "rules";
      }
    }
    if (mode === "rules") objections = ruleObjections({ policy, results, packet });

    // Skip objections we already answered with a rebuttal in a previous round.
    objections = objections.filter((o) => !resolvedKeys.has(`${o.criterionId}:${o.severity}`));
    if (!objections.length) break;

    const entries = objections.map((o) => {
      const resolution = rebut(o, { results, packet });
      resolvedKeys.add(`${o.criterionId}:${o.severity}`);
      return { id: newId("O"), round, ...o, policyCitation: `${policy.id} §${o.section}`, resolution };
    });
    rounds.push({ round, objections: entries });
    if (!entries.some((e) => e.resolution.type === "EVIDENCE_ADDED")) break; // nothing changed, so another round won't help
  }

  const all = rounds.flatMap((r) => r.objections);
  const blockingRemaining = all.filter((o) => o.severity === "BLOCKING" && ["GAP_CREATED", "UNRESOLVED"].includes(o.resolution.type));
  return {
    rounds,
    roundsRun,
    totalObjections: all.length,
    blockingRaised: all.filter((o) => o.severity === "BLOCKING").length,
    blockingRemaining: blockingRemaining.length,
    weakRemaining: all.filter((o) => o.severity === "WEAK" && o.resolution.type === "UNRESOLVED").length,
    discardedInvalid: discarded,
    status: blockingRemaining.length ? "WOULD_BE_DENIED" : "SURVIVED",
    gapCriteria: [...new Set(all.filter((o) => o.resolution.type === "GAP_CREATED").map((o) => o.criterionId))],
    mode,
    ranAt: new Date().toISOString(),
  };
}
