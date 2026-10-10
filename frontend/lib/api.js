"use client";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

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

export function eventsUrl(caseId) {
  return `${API_URL}/api/cases/${caseId}/events?token=${encodeURIComponent(getToken() || "")}`;
}
