"use client";

// Tolerate common deploy mistakes: a trailing slash or a trailing "/api" on NEXT_PUBLIC_API_URL
// would otherwise produce ".../api/api/..." or "...//api/..." and every request would 404.
export const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000")
  .trim()
  .replace(/\/+$/, "")
  .replace(/\/api$/i, "");

export function getToken() {
  try {
    return localStorage.getItem("pac_token");
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem("pac_token", token);
    else localStorage.removeItem("pac_token");
  } catch {}
}

async function request(method, path, body) {
  const res = await fetch(`${API_URL}/api${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  let data = null;
  try {
    data = await res.json();
  } catch {}
  if (res.status === 401 && typeof window !== "undefined" && !path.startsWith("/auth/login")) {
    setToken(null);
    window.location.href = "/login";
  }
  if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  get: (p) => request("GET", p),
  post: (p, b = {}) => request("POST", p, b),
  put: (p, b = {}) => request("PUT", p, b),
};

/** Reads browser File objects as base64 for the JSON upload endpoint. */
function filesToPayload(files) {
  return Promise.all(
    [...files].map(
      (f) =>
        new Promise((resolve, reject) => {
          const r = new FileReader();
          r.onload = () => resolve({ name: f.name, mime: f.type, data: String(r.result).split(",")[1] || "" });
          r.onerror = () => reject(new Error(`Could not read ${f.name}`));
          r.readAsDataURL(f);
        })
    )
  );
}

/** Upload reports / scans / test results to a patient's chart. They are read at the next copilot run. */
export async function uploadFiles(patientId, files) {
  return api.post(`/patients/${patientId}/uploads`, { files: await filesToPayload(files) });
}

export function documentFileUrl(docId) {
  return `${API_URL}/api/documents/${docId}/file?token=${encodeURIComponent(getToken() || "")}`;
}

export function eventsUrl(caseId) {
  return `${API_URL}/api/cases/${caseId}/events?token=${encodeURIComponent(getToken() || "")}`;
}
