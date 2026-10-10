// Demo authentication with role-based access. Passwords are scrypt-hashed;
// sessions are random bearer tokens persisted in the JSON store.
import crypto from "node:crypto";
import { db, save } from "./db.js";

export function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  return `${salt}:${crypto.scryptSync(password, salt, 32).toString("hex")}`;
}

function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(":");
  const candidate = crypto.scryptSync(password, salt, 32).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(candidate), Buffer.from(hash));
}

export function publicUser(u) {
  return { id: u.id, name: u.name, email: u.email, role: u.role, title: u.title };
}

export function login(email, password) {
  const user = db().users.find((u) => u.email.toLowerCase() === String(email).toLowerCase());
  if (!user || !verifyPassword(String(password), user.passwordHash)) return null;
  const token = crypto.randomBytes(24).toString("hex");
  db().sessions[token] = { userId: user.id, createdAt: new Date().toISOString() };
  save();
  return { token, user: publicUser(user) };
}

export function logout(token) {
  delete db().sessions[token];
  save();
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : req.query.token; // EventSource can't set headers
  const session = token && db().sessions[token];
  const user = session && db().users.find((u) => u.id === session.userId);
  if (!user) return res.status(401).json({ error: "Not authenticated" });
  req.user = publicUser(user);
  req.token = token;
  next();
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: `Requires role: ${roles.join(" or ")}` });
    next();
  };
}

// CTRL+ALT+DEFEAT