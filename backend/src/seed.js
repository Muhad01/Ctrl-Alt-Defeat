// Builds a fresh demo database: users, synthetic patients/documents, policies,
// synthetic outcome history, a trained denial predictor, and a few seeded cases.
import "dotenv/config";
import { pathToFileURL } from "node:url";
import { db, setDb, flush } from "./db.js";
import { hashPassword } from "./auth.js";
import { PATIENTS, DOCUMENTS } from "./data/patients.js";
import { POLICIES } from "./data/policies.js";
import { generateHistory, trainModel } from "./agents/denialPredictor.js";
import { setForceHeuristic } from "./llm.js";
import { buildIndex } from "./agents/policyRag.js";
import { createCase, runFrom, setFastMode, submit, draftAppeal, reject } from "./agents/workflow.js";

const clone = (x) => JSON.parse(JSON.stringify(x));

export async function seed({ quiet = false } = {}) {
  const log = (...a) => !quiet && console.log(...a);
  const history = generateHistory(600, 42);
  const model = trainModel(history);
  await setDb({
    users: [
      { id: "U1", name: "Priya Sharma", email: "priya@demo.health", role: "coordinator", title: "PA Coordinator", passwordHash: hashPassword("demo123") },
      { id: "U2", name: "Dr. Imran Khan", email: "khan@demo.health", role: "physician", title: "Ordering Physician", passwordHash: hashPassword("demo123") },
      { id: "U3", name: "Sara Ahmed", email: "sara@demo.health", role: "manager", title: "Revenue Cycle Manager", passwordHash: hashPassword("demo123") },
    ],
    sessions: {},
    patients: clone(PATIENTS),
    documents: clone(DOCUMENTS),
    policies: clone(POLICIES),
    cases: [],
    audit: [],
    history,
    model,
    counters: { case: 1000 },
    seededAt: new Date().toISOString(),
  });
  buildIndex();
  log(`Predictor trained on ${model.trainedOn} synthetic cases: AUC ${model.auc}, accuracy ${model.accuracy}`);

  // Seeded cases are built with the rule engine so seeding never spends API tokens.
  setForceHeuristic(true);
  setFastMode(true);
  const system = { name: "Demo seed", email: "seed@demo.health" };
  const order = (pid) => {
    const p = PATIENTS.find((x) => x.id === pid);
    return { cpt: p.defaultOrder.cpt, reason: p.defaultOrder.reason };
  };

  // P008: approved
  const c8 = createCase({ patientId: "P008", order: order("P008"), user: system });
  await runFrom(c8);
  c8.approval = { by: "Priya Sharma", at: new Date().toISOString() };
  submit(c8, { immediate: true });

  // P007: submitted without PT records → denied; records arrive afterwards → appeal drafted
  const c7 = createCase({ patientId: "P007", order: order("P007"), user: system });
  await runFrom(c7);
  for (const g of c7.gaps) {
    c7.decisions[g.criterionId] = "not_done";
    g.status = "RESOLVED";
    g.resolution = { action: "confirm_not_done", summary: "Submitted without outside PT records", by: "Priya Sharma", at: new Date().toISOString() };
  }
  await runFrom(c7, "writer");
  c7.approval = { by: "Priya Sharma", at: new Date().toISOString(), acknowledgedWarnings: true };
  submit(c7, { immediate: true });
  const ptDoc = db().documents.find((d) => d.id === "D007-2");
  ptDoc.available = true;
  ptDoc.receivedAfterSubmission = true;
  await draftAppeal(c7);

  // P005: waiting on clinician (gaps open)
  const c5 = createCase({ patientId: "P005", order: order("P005"), user: system });
  await runFrom(c5);

  // P001: ready for coordinator review
  const c1 = createCase({ patientId: "P001", order: order("P001"), user: system });
  await runFrom(c1);

  // ── Edge-case cases (IDs matter: C-1008 is one the mock Northstar payer arbitrarily denies) ──
  const proceedWithoutGaps = async (c, summary) => {
    for (const g of c.gaps.filter((x) => x.status === "OPEN")) {
      if (g.criterionId) c.decisions[g.criterionId] = "not_done";
      g.status = "RESOLVED";
      g.resolution = { action: "confirm_not_done", summary, by: "Priya Sharma", at: new Date().toISOString() };
    }
    await runFrom(c, "writer");
  };
  const approveAndSubmit = (c) => {
    c.approval = { by: "Priya Sharma", at: new Date().toISOString(), acknowledgedWarnings: true };
    submit(c, { immediate: true });
  };

  // C-1005 P006: submitted despite missing X-ray and PT weeks → denied → weak appeal (will be UPHELD)
  const c6 = createCase({ patientId: "P006", order: order("P006"), user: system });
  await runFrom(c6);
  await proceedWithoutGaps(c6, "Submitted without X-ray or full PT course");
  approveAndSubmit(c6);
  await draftAppeal(c6);

  // C-1006 P012: real plan (Adamjee) excludes outpatient MRI and patient is over the age limit → coverage gap
  await runFrom(createCase({ patientId: "P012", order: order("P012"), user: system }));

  // C-1007 P013: EFU, red flags met, but pre-existing cancer is inadmissible → CONDITIONAL coverage, ready for review
  await runFrom(createCase({ patientId: "P013", order: order("P013"), user: system }));

  // C-1008 P003: fully documented, but the mock Northstar payer denies "not medically necessary" → strong appeal (OVERTURNED)
  const c3 = createCase({ patientId: "P003", order: order("P003"), user: system });
  await runFrom(c3);
  approveAndSubmit(c3);
  if (c3.denial) await draftAppeal(c3);

  // C-1009 P014: misfiled record for a different patient → verifier FAIL (identity mismatch), ready for review
  await runFrom(createCase({ patientId: "P014", order: order("P014"), user: system }));

  // C-1010 P016: everything documented but no codable diagnosis → verifier FAIL (coding) → rejected by coordinator
  const c16 = createCase({ patientId: "P016", order: order("P016"), user: system });
  await runFrom(c16);
  reject(c16, { name: "Priya Sharma", email: "priya@demo.health" }, "Diagnosis wording does not map to an ICD-10 code; returned to physician for coding.");

  setFastMode(false);
  setForceHeuristic(false);
  await flush();
  log(`Seeded ${db().cases.length} cases: ${db().cases.map((c) => `${c.id} ${c.patientName} [${c.status}]`).join(", ")}`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { initDb, closeDb, storageInfo } = await import("./db.js");
  await initDb();
  await seed();
  await closeDb();
  console.log(`Stored in ${JSON.stringify(storageInfo())}`);
  process.exit(0);
}
