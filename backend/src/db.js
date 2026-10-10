// Storage layer. App code reads and mutates a plain in-memory state object (fast and synchronous);
// every mutation calls save(), which persists the changes (debounced).
//
// MongoDB (when MONGODB_URI is set, e.g. a MongoDB Atlas cluster) is the system of record:
//   users, patients, documents, policies, cases, outcome_history  → one document per item (_id = item id),
//                                                                    only changed documents are written
//   audit_log      → insert-only (no update or delete code path exists)
//   sessions       → one document per login token
//   policy_chunks  → policy sections with their bge-small embedding vectors
//   settings       → predictor model, counters, seed metadata
// Without MONGODB_URI the same state is stored in data/db.json (offline fallback).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MongoClient } from "mongodb";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");
const FILE = process.env.DB_FILE || path.join(DATA_DIR, "db.json"); // DB_FILE lets the self-test use a throwaway file
const VECTOR_FILE = path.join(DATA_DIR, "policy-embeddings.json");

// state key → MongoDB collection (array collections keyed by item.id)
const COLLECTIONS = { users: "users", patients: "patients", documents: "documents", policies: "policies", cases: "cases", history: "outcome_history" };

let state = null;
let timer = null;
let mongo = null; // { client, db, dbName, host }
let writing = Promise.resolve(); // serialises writes so they land in order
const lastSaved = new Map(); // "collection:id" → JSON last written (skip unchanged documents)
let auditPersisted = 0;
let sessionsSaved = new Set();
let metaSaved = "";

/** The MongoDB database handle, or null when running on the JSON file. */
export function mongoDb() {
  return mongo?.db || null;
}

export function storageInfo() {
  return mongo ? { type: "mongodb", database: mongo.dbName, host: mongo.host } : { type: "json", file: "backend/data/db.json" };
}

/** Connects storage and loads state. Returns false when the store is empty (caller should seed). */
export async function initDb() {
  if (process.env.MONGODB_URI) {
    if (!mongo) {
      const client = new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 15000, appName: "medvera" });
      await client.connect();
      const dbName = process.env.MONGODB_DB || "prior_auth_copilot";
      // host only, never the credentials
      const host = process.env.MONGODB_URI.replace(/^mongodb(\+srv)?:\/\//, "").split("@").pop().split(/[/?]/)[0];
      mongo = { client, db: client.db(dbName), dbName, host };
      await mongo.db.collection("audit_log").createIndex({ caseId: 1, createdAt: -1 });
      await mongo.db.collection("cases").createIndex({ status: 1 });
      await mongo.db.collection("documents").createIndex({ patientId: 1 });
      await mongo.db.collection("policy_chunks").createIndex({ payer: 1, policyId: 1 });
    }
    const meta = await mongo.db.collection("settings").findOne({ _id: "meta" });
    if (!meta) return false;
    state = await loadFromMongo(meta);
    return true;
  }
  if (!fs.existsSync(FILE)) return false;
  state = JSON.parse(fs.readFileSync(FILE, "utf8"));
  return true;
}

const strip = ({ _id, ...rest }) => rest;

async function loadFromMongo(meta) {
  const s = {};
  for (const [key, coll] of Object.entries(COLLECTIONS)) {
    const docs = (await mongo.db.collection(coll).find({}).toArray()).map(strip);
    docs.forEach((d) => lastSaved.set(`${coll}:${d.id}`, JSON.stringify(d)));
    s[key] = docs;
  }
  s.cases.sort((a, b) => b.createdAt.localeCompare(a.createdAt)); // newest first, as the UI expects
  s.audit = (await mongo.db.collection("audit_log").find({}).sort({ createdAt: 1, _id: 1 }).toArray()).map(strip);
  auditPersisted = s.audit.length;
  s.sessions = {};
  for (const doc of await mongo.db.collection("sessions").find({}).toArray()) s.sessions[doc._id] = strip(doc);
  sessionsSaved = new Set(Object.keys(s.sessions));
  s.model = meta.model;
  s.counters = meta.counters;
  s.seededAt = meta.seededAt;
  metaSaved = JSON.stringify({ model: s.model, counters: s.counters, seededAt: s.seededAt });
  return s;
}

export function db() {
  if (!state) throw new Error("Database not initialised. Call initDb() first.");
  return state;
}

/** Replace the whole state (seed / demo reset). Returns a promise that resolves once persisted. */
export function setDb(newState) {
  state = newState;
  clearTimeout(timer);
  writing = writing.then(() => (mongo ? replaceAllInMongo() : writeJson())).catch((err) => console.error("[db] reset write failed:", err.message));
  return writing;
}

export function save() {
  clearTimeout(timer);
  timer = setTimeout(() => flush(), 150);
}

/** Persist pending changes now. Resolves when the write has finished. */
export function flush() {
  clearTimeout(timer);
  if (!state) return writing;
  writing = writing.then(() => (mongo ? flushMongo() : writeJson())).catch((err) => {
    console.error("[db] write failed, will retry on next change:", err.message);
    lastSaved.clear(); // force a full rewrite next time
    metaSaved = "";
  });
  return writing;
}

function writeJson() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(state, null, 1));
}

async function replaceAllInMongo() {
  const names = [...Object.values(COLLECTIONS), "audit_log", "sessions", "settings"];
  await Promise.all(names.map((n) => mongo.db.collection(n).deleteMany({})));
  lastSaved.clear();
  auditPersisted = 0;
  sessionsSaved = new Set();
  metaSaved = "";
  await flushMongo();
}

async function flushMongo() {
  const ops = [];
  for (const [key, coll] of Object.entries(COLLECTIONS)) {
    const bulk = [];
    for (const doc of state[key]) {
      const json = JSON.stringify(doc);
      const k = `${coll}:${doc.id}`;
      if (lastSaved.get(k) === json) continue;
      bulk.push({ replaceOne: { filter: { _id: doc.id }, replacement: { _id: doc.id, ...JSON.parse(json) }, upsert: true } });
      lastSaved.set(k, json);
    }
    if (bulk.length) ops.push(mongo.db.collection(coll).bulkWrite(bulk, { ordered: false }));
  }

  // audit_log is insert-only
  const fresh = state.audit.slice(auditPersisted);
  if (fresh.length) {
    auditPersisted = state.audit.length;
    ops.push(mongo.db.collection("audit_log").insertMany(fresh.map((a) => ({ _id: a.id, ...a })), { ordered: false }));
  }

  // sessions: add new tokens, delete logged-out ones
  const current = new Set(Object.keys(state.sessions));
  const added = [...current].filter((t) => !sessionsSaved.has(t));
  const removed = [...sessionsSaved].filter((t) => !current.has(t));
  if (added.length) ops.push(mongo.db.collection("sessions").bulkWrite(added.map((t) => ({ replaceOne: { filter: { _id: t }, replacement: { _id: t, ...state.sessions[t] }, upsert: true } }))));
  if (removed.length) ops.push(mongo.db.collection("sessions").deleteMany({ _id: { $in: removed } }));
  sessionsSaved = current;

  const meta = JSON.stringify({ model: state.model, counters: state.counters, seededAt: state.seededAt });
  if (meta !== metaSaved) {
    metaSaved = meta;
    ops.push(mongo.db.collection("settings").replaceOne({ _id: "meta" }, { _id: "meta", ...JSON.parse(meta) }, { upsert: true }));
  }
  await Promise.all(ops);
}

/** Flush and close (on shutdown). */
export async function closeDb() {
  await flush();
  if (mongo) await mongo.client.close();
}

// ── policy_chunks: cached embedding vectors for the RAG index ──
export async function loadVectors() {
  if (mongo) {
    const docs = await mongo.db.collection("policy_chunks").find({}, { projection: { embedding: 1 } }).toArray();
    return Object.fromEntries(docs.filter((d) => d.embedding).map((d) => [d._id, d.embedding]));
  }
  return fs.existsSync(VECTOR_FILE) ? JSON.parse(fs.readFileSync(VECTOR_FILE, "utf8")) : {};
}

export async function saveVectors(chunks) {
  // chunks: [{ key, policyId, payer, ref, title, text, embedding }]
  if (!chunks.length) return;
  if (mongo) {
    await mongo.db.collection("policy_chunks").bulkWrite(
      chunks.map(({ key, ...c }) => ({ replaceOne: { filter: { _id: key }, replacement: { _id: key, ...c }, upsert: true } })),
      { ordered: false }
    );
    return;
  }
  const cache = await loadVectors();
  chunks.forEach((c) => (cache[c.key] = c.embedding));
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(VECTOR_FILE, JSON.stringify(cache));
}

let counter = 0;
export function newId(prefix) {
  counter = (counter + 1) % 1000;
  return `${prefix}-${Date.now().toString(36)}${counter.toString(36)}`;
}

export function getCase(id) {
  return db().cases.find((c) => c.id === id);
}

export function getPatient(id) {
  return db().patients.find((p) => p.id === id);
}

export function getPolicy(id) {
  return db().policies.find((p) => p.id === id);
}

/** Documents in the patient's chart (excludes outside records not yet received). */
export function chartDocuments(patientId) {
  return db().documents.filter((d) => d.patientId === patientId && d.available);
}
