// Checks the MongoDB connection in backend/.env without starting the app or changing any data.
//   npm --prefix backend run db:check
import "dotenv/config";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.log("MONGODB_URI is empty: the app uses the local JSON store (backend/data/db.json).");
  process.exit(0);
}
const host = uri.replace(/^mongodb(\+srv)?:\/\//, "").split("@").pop().split(/[/?]/)[0]; // never print credentials
const dbName = process.env.MONGODB_DB || "prior_auth_copilot";
console.log(`Connecting to ${host} (database "${dbName}")…`);
const client = new MongoClient(uri, { serverSelectionTimeoutMS: 15000, appName: "prior-auth-copilot-check" });
try {
  await client.connect();
  const db = client.db(dbName);
  await db.command({ ping: 1 });
  console.log("Connected.");
  const names = (await db.listCollections().toArray()).map((c) => c.name).sort();
  if (!names.length) console.log('Database is empty. The API seeds the demo data on its first start (or run "npm run seed").');
  for (const n of names) console.log(`  ${n.padEnd(20)} ${await db.collection(n).estimatedDocumentCount()} documents`);
} catch (err) {
  console.error(`Connection failed: ${err.message}`);
  if (/auth/i.test(err.message)) console.error("Check the database user and password (Atlas → Database Access). Special characters in the password must be URL-encoded.");
  else if (uri.startsWith("mongodb+srv://") && /querySrv|ENOTFOUND|ETIMEOUT|ECONNREFUSED/.test(err.message))
    console.error("The DNS SRV/TXT lookup for mongodb+srv:// failed. Use the standard mongodb://host1,host2,host3/?tls=true&authSource=admin&replicaSet=... address (see .env.example).");
  else console.error("Check that your current IP address is allowed in Atlas → Network Access.");
  process.exitCode = 1;
} finally {
  await client.close();
}
