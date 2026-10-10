import { MongoClient } from "mongodb";
const c = await MongoClient.connect("mongodb://127.0.0.1:27999");
const d = c.db("prior_auth_copilot");
for (const n of (await d.listCollections().toArray()).map((x) => x.name).sort()) console.log(n.padEnd(16), await d.collection(n).countDocuments());
const cs = await d.collection("cases").find({}, { projection: { status: 1, patientName: 1, "readiness.score": 1 } }).toArray();
console.log(cs.map((x) => `${x._id} ${x.patientName} ${x.status} r=${x.readiness?.score}`).join(" | "));
await c.close();
