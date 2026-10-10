import "dotenv/config";
import express from "express";
import cors from "cors";
import { db, initDb, closeDb, storageInfo, getCase, getPatient, getPolicy, chartDocuments, newId, save } from "./db.js";
import { bus, audit } from "./events.js";
import { login, logout, requireAuth, requireRole } from "./auth.js";
import { aiModeInfo } from "./llm.js";
import { maskName } from "./utils/text.js";
import { PROCEDURES, resolveProcedure } from "./data/codes.js";
import { PAYERS, findPolicy, POLICIES } from "./data/policies.js";
import { PATIENTS, DOCUMENTS } from "./data/patients.js";
import { saveFile, readFile, MAX_FILE_BYTES } from "./files.js";
import { detectMime, isSupported } from "./agents/reader.js";
import { buildIndex, semanticSearch, warmEmbeddings, embeddingStatus } from "./agents/policyRag.js";
import { packetPdf } from "./pdf.js";
import { INSURERS, REAL_PAYERS } from "./data/insurers.js";
import { runCoverageCheck } from "./agents/coverage.js";
import { runEvaluation, saveReport } from "./evaluate.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { trainModel } from "./agents/denialPredictor.js";
import { summary, analytics } from "./analytics.js";
import { seed } from "./seed.js";
import * as wf from "./agents/workflow.js";

const PORT = Number(process.env.PORT || 4000);
const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(",") || true }));
app.use(express.json({ limit: "60mb" })); // uploads arrive as base64 JSON

const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const findCase = (req, res) => {
  const c = getCase(req.params.id);
  if (!c) res.status(404).json({ error: "Case not found" });
  return c;
};

/** Case list rows mask patient names (PHI minimisation). */
function caseRow(c) {
  return {
    id: c.id,
    patient: maskName(c.patientName),
    patientId: c.patientId,
    cpt: c.order.cpt,
    procedure: c.coding?.procedureShort || resolveProcedure(c.order).short,
    payer: c.order.payer || c.coding?.payer || getPatient(c.patientId)?.payer,
    status: c.status,
    readiness: c.readiness ? { score: c.readiness.score, level: c.readiness.level } : null,
    risk: c.prediction ? { probability: c.prediction.probability, level: c.prediction.riskLevel } : null,
    openGaps: c.gaps.filter((g) => g.status === "OPEN").length,
    assignedTo: c.assignedTo,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  };
}

function caseDetail(c) {
  const patient = getPatient(c.patientId);
  const all = db().documents.filter((d) => d.patientId === c.patientId);
  return {
    ...c,
    patient,
    documents: chartDocuments(c.patientId),
    pendingDocuments: all.filter((d) => !d.available && !d.upload).map(({ id, title, date }) => ({ id, title, date })),
    uploads: all.filter((d) => d.upload).map(({ id, title, date, upload, analysis }) => ({ id, title, date, upload, analysis })),
  };
}

// ───────── health / meta ─────────
app.get("/api/health", (req, res) => res.json({ ok: true, ai: aiModeInfo(), storage: storageInfo() }));
// This server is an API only; the web app is the frontend. Opening the base URL shows where things are.
app.get(["/", "/api"], (req, res) =>
  res.json({ name: "AuthProof API", ok: true, health: "/api/health", note: "This is the backend API. Open the frontend (web app) URL to use the app." })
);
app.get("/api/meta", requireAuth, (req, res) => res.json({ ai: aiModeInfo(), storage: storageInfo(), embeddings: embeddingStatus(), procedures: Object.values(PROCEDURES), payers: PAYERS, realPayers: REAL_PAYERS }));

// ───────── auth ─────────
app.post("/api/auth/login", (req, res) => {
  const result = login(req.body?.email, req.body?.password);
  if (!result) return res.status(401).json({ error: "Invalid email or password" });
  audit({ actorType: "human", actorId: result.user.email, action: "auth.login" });
  res.json(result);
});
app.post("/api/auth/logout", requireAuth, (req, res) => {
  logout(req.token);
  res.json({ ok: true });
});
app.get("/api/auth/me", requireAuth, (req, res) => res.json({ user: req.user }));

// ───────── patients ─────────
app.get("/api/patients", requireAuth, (req, res) => {
  res.json(db().patients.map((p) => ({ ...p, documentCount: chartDocuments(p.id).length })));
});
app.get("/api/patients/:id", requireAuth, (req, res) => {
  const p = getPatient(req.params.id);
  if (!p) return res.status(404).json({ error: "Patient not found" });
  res.json({ ...p, documents: chartDocuments(p.id) });
});
app.post("/api/patients", requireAuth, requireRole("coordinator", "physician"), (req, res) => {
  const { name, dob, sex, payer, memberId, noteTitle, noteText, specialty } = req.body || {};
  if (!name || !payer) return res.status(400).json({ error: "name and payer are required" });
  if (!PAYERS.includes(payer)) return res.status(400).json({ error: "Unknown payer" });
  const store = db();
  const id = newId("P");
  const birth = dob || "1970-01-01";
  const patient = {
    id, mrn: `MRN-${Math.floor(200000 + Math.random() * 99999)}`, name: name.trim(), dob: birth, sex: sex === "M" ? "M" : "F",
    age: Math.max(0, new Date().getFullYear() - Number(birth.slice(0, 4))), payer, planId: `${payer.split(" ")[0].toUpperCase()}-PLAN`, memberId: memberId || `MEM-${Math.floor(Math.random() * 1e6)}`,
    provider: { name: req.user.role === "physician" ? req.user.name : "Imran Khan, MD", specialty: specialty?.trim() || "General Medicine", npi: "1457382910" },
    defaultOrder: null, scenario: "Uploaded by user",
  };
  store.patients.push(patient);
  if (noteText?.trim()) store.documents.push({ id: newId("D"), patientId: id, type: "uploaded", title: noteTitle || "Uploaded clinical note", date: new Date().toISOString().slice(0, 10), available: true, text: String(noteText) });
  save();
  audit({ actorType: "human", actorId: req.user.email, action: "patient.created", payload: { patientId: id } });
  res.status(201).json(patient);
});

/** Upload reports, scans, photos or test results for a patient. Files are stored as-is (GridFS or disk);
 *  the Report Reader agent extracts and analyses them at the start of the next copilot run. */
app.post("/api/patients/:id/uploads", requireAuth, requireRole("coordinator", "physician"), wrap(async (req, res) => {
  const p = getPatient(req.params.id);
  if (!p) return res.status(404).json({ error: "Patient not found" });
  const files = Array.isArray(req.body?.files) ? req.body.files : [];
  if (!files.length) return res.status(400).json({ error: "No files uploaded" });
  if (files.length > 10) return res.status(400).json({ error: "Upload at most 10 files at a time" });
  const prepared = [];
  for (const f of files) {
    const name = String(f.name || "upload").slice(0, 200);
    const mime = detectMime(name, f.mime);
    if (!isSupported(mime)) return res.status(400).json({ error: `${name}: unsupported file type (use PDF, JPG, PNG, WEBP, DOCX or TXT)` });
    const buffer = Buffer.from(String(f.data || ""), "base64");
    if (!buffer.length) return res.status(400).json({ error: `${name} is empty` });
    if (buffer.length > MAX_FILE_BYTES) return res.status(400).json({ error: `${name} is larger than 15 MB` });
    prepared.push({ name, mime, buffer });
  }
  const created = [];
  for (const { name, mime, buffer } of prepared) {
    const fileId = await saveFile({ buffer, name, mime, patientId: p.id });
    const doc = {
      id: newId("D"), patientId: p.id, type: "upload", title: name, date: new Date().toISOString().slice(0, 10), available: false, text: "",
      attachedBy: req.user.name, upload: { fileId, name, mime, size: buffer.length, status: "pending", uploadedAt: new Date().toISOString() },
    };
    db().documents.push(doc);
    created.push({ id: doc.id, title: doc.title, upload: doc.upload });
  }
  save();
  audit({ actorType: "human", actorId: req.user.email, action: "documents.uploaded", payload: { patientId: p.id, files: created.map((c) => c.upload.name) } });
  res.status(201).json(created);
}));

/** Original uploaded file (opened from the chart viewer). */
app.get("/api/documents/:id/file", requireAuth, wrap(async (req, res) => {
  const doc = db().documents.find((d) => d.id === req.params.id && d.upload);
  if (!doc) return res.status(404).json({ error: "File not found" });
  const bytes = await readFile(doc.upload.fileId);
  res.setHeader("Content-Type", doc.upload.mime);
  res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(doc.upload.name)}"`);
  res.end(bytes);
}));

// ───────── cases ─────────
app.get("/api/cases", requireAuth, (req, res) => {
  const { status, payer, risk, q } = req.query;
  let rows = db().cases.map(caseRow);
  if (status) rows = rows.filter((r) => r.status === status);
  if (payer) rows = rows.filter((r) => r.payer === payer);
  if (risk) rows = rows.filter((r) => r.readiness?.level === risk);
  if (q) rows = rows.filter((r) => `${r.id} ${r.patient} ${r.procedure} ${r.payer}`.toLowerCase().includes(String(q).toLowerCase()));
  res.json(rows);
});

app.post("/api/cases", requireAuth, requireRole("coordinator", "physician"), (req, res) => {
  const { patientId, cpt, procedureName, kind, setting, reason, urgency, payer } = req.body || {};
  // Any procedure: pick one from the catalog, or type a custom one (checked against the payer's general policy).
  const custom = !PROCEDURES[cpt];
  if (!patientId) return res.status(400).json({ error: "patientId is required" });
  if (custom && !procedureName?.trim()) return res.status(400).json({ error: "Choose a procedure or type the procedure name" });
  if (payer && !PAYERS.includes(payer)) return res.status(400).json({ error: "Unknown insurer" });
  const patient = getPatient(patientId);
  const proc = resolveProcedure({ cpt, procedureName, kind, setting });
  const defaultReason = patient?.defaultOrder?.cpt === cpt ? patient.defaultOrder.reason : proc.name;
  const order = {
    cpt: custom ? (/^\d{5}$/.test(String(cpt || "")) ? cpt : "CUSTOM") : cpt,
    procedureName: custom ? procedureName.trim() : null,
    kind: custom ? proc.kind : null,
    setting: setting || (proc.benefit === "inpatient" ? "inpatient" : "outpatient"),
    reason: reason || defaultReason,
    urgency,
    payer,
  };
  const c = wf.createCase({ patientId, order, user: req.user });
  wf.runInBackground(c);
  res.status(201).json(caseRow(c));
});

app.get("/api/cases/:id", requireAuth, (req, res) => {
  const c = findCase(req, res);
  if (c) res.json(caseDetail(c));
});

app.get("/api/cases/:id/events", requireAuth, (req, res) => {
  const c = findCase(req, res);
  if (!c) return;
  res.writeHead(200, { "Content-Type": "text/event-stream", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive", "X-Accel-Buffering": "no" });
  res.write(`event: hello\ndata: ${JSON.stringify({ status: c.status, timeline: c.timeline.length })}\n\n`);
  const listener = (msg) => res.write(`event: ${msg.type}\ndata: ${JSON.stringify(msg)}\n\n`);
  bus.on(`case:${c.id}`, listener);
  const ping = setInterval(() => res.write(": ping\n\n"), 20000);
  req.on("close", () => {
    clearInterval(ping);
    bus.off(`case:${c.id}`, listener);
  });
});

app.post("/api/cases/:id/rerun", requireAuth, (req, res) => {
  const c = findCase(req, res);
  if (!c) return;
  audit({ caseId: c.id, actorType: "human", actorId: req.user.email, action: "case.rerun" });
  wf.runInBackground(c, req.body?.from || "intake");
  res.json({ ok: true });
});

app.post("/api/cases/:id/insurer", requireAuth, requireRole("coordinator", "physician"), (req, res) => {
  const c = findCase(req, res);
  if (!c) return;
  const { payer } = req.body || {};
  if (!PAYERS.includes(payer)) return res.status(400).json({ error: "Unknown insurer" });
  if (!findPolicy(db().policies, payer, c.order.cpt)) return res.status(400).json({ error: `${payer} has no policy for this procedure` });
  wf.changeInsurer(c, payer, req.user);
  res.json(caseDetail(c));
});

app.get("/api/cases/:id/packet.pdf", requireAuth, wrap(async (req, res) => {
  const c = findCase(req, res);
  if (!c) return;
  if (!c.packet) return res.status(400).json({ error: "No packet yet" });
  const bytes = await packetPdf(c, getPatient(c.patientId));
  audit({ caseId: c.id, actorType: "human", actorId: req.user.email, action: "packet.pdf_downloaded", payload: { version: c.packet.version } });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${c.id}-prior-auth-packet.pdf"`);
  res.end(Buffer.from(bytes));
}));

app.post("/api/cases/:id/gaps/:gapId/resolve", requireAuth, requireRole("physician", "coordinator"), wrap(async (req, res) => {
  const c = findCase(req, res);
  if (!c) return;
  await wf.resolveGap(c, req.params.gapId, req.body || {}, req.user);
  res.json(caseDetail(c));
}));

app.post("/api/cases/:id/documents/:docId/include", requireAuth, requireRole("coordinator", "physician"), (req, res) => {
  const c = findCase(req, res);
  if (!c) return;
  wf.includeUpload(c, req.params.docId, req.user);
  res.json(caseDetail(c));
});

app.post("/api/cases/:id/gaps/skip", requireAuth, requireRole("coordinator"), (req, res) => {
  const c = findCase(req, res);
  if (!c) return;
  wf.skipGaps(c, req.user);
  res.json({ ok: true });
});

app.get("/api/cases/:id/packet", requireAuth, (req, res) => {
  const c = findCase(req, res);
  if (!c) return;
  res.json({ packet: c.packet, verifier: c.verifier, readiness: c.readiness, prediction: c.prediction, predictionHistory: c.predictionHistory, adversarial: c.adversarial });
});

app.put("/api/cases/:id/packet", requireAuth, requireRole("coordinator", "physician"), wrap(async (req, res) => {
  const c = findCase(req, res);
  if (!c) return;
  if (typeof req.body?.letter !== "string") return res.status(400).json({ error: "letter is required" });
  await wf.savePacket(c, { letter: req.body.letter }, req.user);
  res.json(caseDetail(c));
}));

app.post("/api/cases/:id/adversarial-review", requireAuth, wrap(async (req, res) => {
  const c = findCase(req, res);
  if (!c) return;
  if (!c.packet) return res.status(400).json({ error: "No packet yet" });
  await wf.rerunAdversarial(c, req.user);
  res.json(caseDetail(c));
}));

app.post("/api/cases/:id/approve", requireAuth, requireRole("coordinator"), wrap(async (req, res) => {
  const c = findCase(req, res);
  if (!c) return;
  wf.approve(c, req.user, req.body || {});
  res.json(caseDetail(c));
}));

app.post("/api/cases/:id/reject", requireAuth, requireRole("coordinator", "manager"), (req, res) => {
  const c = findCase(req, res);
  if (!c) return;
  wf.reject(c, req.user, req.body?.reason);
  res.json(caseDetail(c));
});

app.post("/api/cases/:id/request-changes", requireAuth, requireRole("coordinator"), (req, res) => {
  const c = findCase(req, res);
  if (!c) return;
  wf.requestChanges(c, req.user, req.body?.note);
  res.json(caseDetail(c));
});

app.post("/api/cases/:id/denial", requireAuth, requireRole("coordinator"), wrap(async (req, res) => {
  const c = findCase(req, res);
  if (!c) return;
  if (!c.policy) return res.status(400).json({ error: "Case has no policy yet" });
  if (!req.body?.letterText?.trim()) return res.status(400).json({ error: "letterText is required" });
  await wf.recordDenial(c, { letterText: req.body.letterText }, req.user);
  res.json(caseDetail(c));
}));

app.post("/api/cases/:id/appeal/draft", requireAuth, requireRole("coordinator"), wrap(async (req, res) => {
  const c = findCase(req, res);
  if (!c) return;
  if (!c.denial) return res.status(400).json({ error: "Case has no denial" });
  await wf.draftAppeal(c);
  res.json(caseDetail(c));
}));

app.put("/api/cases/:id/appeal", requireAuth, requireRole("coordinator", "physician"), (req, res) => {
  const c = findCase(req, res);
  if (!c) return;
  if (!c.appeal) return res.status(400).json({ error: "No appeal drafted" });
  wf.saveAppeal(c, { letter: String(req.body?.letter || "") }, req.user);
  res.json(caseDetail(c));
});

app.post("/api/cases/:id/appeal/submit", requireAuth, requireRole("coordinator"), wrap(async (req, res) => {
  const c = findCase(req, res);
  if (!c) return;
  await wf.submitAppeal(c, req.user);
  res.json(caseDetail(c));
}));

// ───────── policies ─────────
app.get("/api/policies", requireAuth, wrap(async (req, res) => {
  const { q, payer, cpt } = req.query;
  const usage = (id) => db().cases.filter((c) => c.policy?.id === id).map((c) => c.id);
  const found = q ? await semanticSearch(String(q), { payer, cpt, limit: 10 }) : { method: null, results: [] };
  res.json({
    policies: db().policies.map((p) => ({ ...p, usedBy: usage(p.id) })),
    results: found.results,
    method: found.method,
    embeddings: embeddingStatus(),
  });
}));

// ───────── real insurers (public plan terms) ─────────
app.get("/api/insurers", requireAuth, (req, res) => {
  res.json(INSURERS.map((i) => ({ ...i, policies: db().policies.filter((p) => p.payer === i.payer).map((p) => ({ id: p.id, name: p.name })) })));
});

/** "Is this covered?" lookup: insurer + procedure (+ age), without creating a case. */
app.post("/api/insurers/coverage-check", requireAuth, (req, res) => {
  const { payer, cpt = "73721", age = 45, setting = "outpatient" } = req.body || {};
  if (!REAL_PAYERS.includes(payer)) return res.status(400).json({ error: "Unknown insurer" });
  const procedure = resolveProcedure({ cpt, procedureName: req.body?.procedureName, setting });
  res.json(runCoverageCheck({ payer, patient: { age: Number(age) }, coding: { procedureShort: procedure.short, benefit: procedure.benefit, family: procedure.family }, order: { setting }, documents: [] }));
});

// ───────── evaluation ─────────
const EVAL_FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "data", "eval-results.json");
app.get("/api/eval", requireAuth, (req, res) => {
  res.json(fs.existsSync(EVAL_FILE) ? JSON.parse(fs.readFileSync(EVAL_FILE, "utf8")) : null);
});
app.post("/api/eval/run", requireAuth, requireRole("manager", "coordinator"), wrap(async (req, res) => {
  const report = await runEvaluation({ forceRules: req.body?.engine === "rules" });
  saveReport(report);
  audit({ actorType: "human", actorId: req.user.email, action: "eval.run", payload: { engine: report.engine, accuracy: report.metrics.criteriaAccuracy } });
  res.json(report);
}));
app.get("/api/policies/:id", requireAuth, (req, res) => {
  const p = getPolicy(req.params.id);
  if (!p) return res.status(404).json({ error: "Policy not found" });
  res.json(p);
});

// ───────── analytics / audit / admin ─────────
app.get("/api/analytics/summary", requireAuth, (req, res) => res.json(summary()));
app.get("/api/analytics", requireAuth, (req, res) => res.json(analytics()));
app.post("/api/analytics/retrain", requireAuth, requireRole("manager"), (req, res) => {
  const store = db();
  store.model = trainModel(store.history);
  save();
  audit({ actorType: "human", actorId: req.user.email, action: "predictor.retrained", payload: { auc: store.model.auc, n: store.model.trainedOn } });
  res.json(store.model);
});

app.get("/api/audit", requireAuth, requireRole("manager", "coordinator"), (req, res) => {
  const { caseId, actorType } = req.query;
  let rows = [...db().audit].reverse();
  if (caseId) rows = rows.filter((r) => r.caseId === caseId);
  if (actorType) rows = rows.filter((r) => r.actorType === actorType);
  res.json(rows.slice(0, 500));
});

app.post("/api/admin/reset", requireAuth, requireRole("manager"), wrap(async (req, res) => {
  await seed({ quiet: true });
  buildIndex();
  res.json({ ok: true });
}));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(400).json({ error: err.message || "Request failed" });
});

async function main() {
  let ready;
  try {
    ready = await initDb();
  } catch (err) {
    console.error(`\nCould not connect to MongoDB: ${err.message}`);
    console.error("Check MONGODB_URI in backend/.env, the database user/password, and that your IP is allowed in Atlas → Network Access.");
    if (/querySrv|ENOTFOUND|ETIMEOUT|ECONNREFUSED/.test(err.message) && process.env.MONGODB_URI.startsWith("mongodb+srv://"))
      console.error("Your network may be blocking the DNS SRV/TXT lookup that mongodb+srv:// needs. Use the standard mongodb://host1,host2,host3/?tls=true&authSource=admin&replicaSet=... address instead (Atlas → Connect → Drivers, older driver version).");
    console.error("Or leave MONGODB_URI empty to use the local JSON store.\n");
    process.exit(1);
  }
  const store = storageInfo();
  console.log(store.type === "mongodb" ? `Storage: MongoDB (${store.host}, database "${store.database}")` : "Storage: local JSON file (set MONGODB_URI to use MongoDB)");
  if (!ready) {
    console.log("Database is empty. Seeding demo data…");
    await seed();
  }
  syncReferenceData();
  buildIndex();
  // Cases left mid-run by a restart are resumed from the start.
  for (const c of db().cases.filter((x) => ["READING_REPORTS", "INTAKE", "CRITERIA_CHECK", "PACKET_DRAFTING", "ADVERSARIAL_REVIEW"].includes(x.status))) wf.runInBackground(c);
  app.listen(PORT, () => console.log(`AuthProof API on http://localhost:${PORT} (AI: ${aiModeInfo().mode === "llm" ? `${aiModeInfo().providerLabel} ${aiModeInfo().model}` : "rules"})`));
  warmEmbeddings(); // loads bge-small in the background; search uses TF-IDF until it is ready
}

/** Policies are defined in code: refresh them in the store on every start, and add demo patients added since the
 *  last seed (existing patients, cases and uploads are left alone). */
function syncReferenceData() {
  const store = db();
  const clone = (x) => JSON.parse(JSON.stringify(x));
  const changed = JSON.stringify(store.policies) !== JSON.stringify(POLICIES);
  if (changed) store.policies = clone(POLICIES);
  const newPatients = PATIENTS.filter((p) => !store.patients.some((x) => x.id === p.id));
  store.patients.push(...clone(newPatients));
  store.documents.push(...clone(DOCUMENTS.filter((d) => newPatients.some((p) => p.id === d.patientId))));
  if (changed || newPatients.length) {
    save();
    console.log(`Reference data synced: ${store.policies.length} policies${newPatients.length ? `, ${newPatients.length} new demo patient(s)` : ""}`);
  }
}

// Flush pending writes before exiting (Ctrl+C, node --watch restarts).
for (const sig of ["SIGINT", "SIGTERM"]) {
  process.once(sig, async () => {
    await closeDb().catch(() => {});
    process.exit(0);
  });
}

main();
