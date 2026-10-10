// Original uploaded files (reports, scans, photos). The extracted text lives in the chart document;
// the original bytes are kept so staff can open the source file next to the citation.
//   MongoDB → GridFS bucket "uploads" (uploads.files / uploads.chunks)
//   JSON    → backend/data/uploads/<fileId>
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Readable } from "node:stream";
import { GridFSBucket } from "mongodb";
import { mongoDb, newId } from "./db.js";

const DIR = process.env.UPLOAD_DIR || path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "data", "uploads");

export const MAX_FILE_BYTES = 15 * 1024 * 1024;

const bucket = () => new GridFSBucket(mongoDb(), { bucketName: "uploads" });

export async function saveFile({ buffer, name, mime, patientId }) {
  const fileId = newId("F");
  if (mongoDb()) {
    await new Promise((resolve, reject) => {
      Readable.from(buffer)
        .pipe(bucket().openUploadStreamWithId(fileId, name, { metadata: { mime, patientId } }))
        .on("finish", resolve)
        .on("error", reject);
    });
  } else {
    fs.mkdirSync(DIR, { recursive: true });
    fs.writeFileSync(path.join(DIR, fileId), buffer);
  }
  return fileId;
}

export async function readFile(fileId) {
  if (mongoDb()) {
    const chunks = [];
    for await (const chunk of bucket().openDownloadStream(fileId)) chunks.push(chunk);
    return Buffer.concat(chunks);
  }
  const p = path.join(DIR, path.basename(fileId));
  if (!fs.existsSync(p)) throw new Error("File not found");
  return fs.readFileSync(p);
}
