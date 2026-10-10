// Case event bus: every agent step is appended to the case timeline and pushed
// to any connected Server-Sent Events clients.
import { EventEmitter } from "node:events";
import { db, save, newId } from "./db.js";

export const bus = new EventEmitter();
bus.setMaxListeners(200);

export function emit(caseObj, step, status, message, extra = {}) {
  const event = { id: newId("E"), ts: new Date().toISOString(), step, status, message, ...extra };
  caseObj.timeline.push(event);
  caseObj.updatedAt = event.ts;
  save();
  bus.emit(`case:${caseObj.id}`, { type: "timeline", event });
  return event;
}

/** Signal clients that the case state changed (they refetch). */
export function touch(caseObj) {
  caseObj.updatedAt = new Date().toISOString();
  save();
  bus.emit(`case:${caseObj.id}`, { type: "case", status: caseObj.status });
}

export function audit({ caseId = null, actorType, actorId, action, payload = {} }) {
  const entry = { id: newId("A"), caseId, actorType, actorId, action, payload, createdAt: new Date().toISOString() };
  db().audit.push(entry); // append-only: nothing ever edits or deletes audit entries
  save();
  return entry;
}
