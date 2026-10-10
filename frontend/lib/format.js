export const STATUS_META = {
  DRAFT: { label: "Draft", cls: "bg-slate-100 text-slate-700" },
  READING_REPORTS: { label: "Reading reports", cls: "bg-sky-100 text-sky-800" },
  INTAKE: { label: "Intake", cls: "bg-sky-100 text-sky-800" },
  CRITERIA_CHECK: { label: "Checking criteria", cls: "bg-sky-100 text-sky-800" },
  NEEDS_INFO: { label: "Needs info", cls: "bg-amber-100 text-amber-800" },
  PACKET_DRAFTING: { label: "Drafting packet", cls: "bg-sky-100 text-sky-800" },
  ADVERSARIAL_REVIEW: { label: "Simulated review", cls: "bg-violet-100 text-violet-800" },
  READY_FOR_REVIEW: { label: "Ready for review", cls: "bg-indigo-100 text-indigo-800" },
  APPROVED_BY_HUMAN: { label: "Approved by human", cls: "bg-indigo-100 text-indigo-800" },
  SUBMITTED: { label: "Submitted", cls: "bg-blue-100 text-blue-800" },
  APPROVED: { label: "Approved", cls: "bg-emerald-100 text-emerald-800" },
  DENIED: { label: "Denied", cls: "bg-red-100 text-red-800" },
  APPEAL_DRAFTED: { label: "Appeal drafted", cls: "bg-orange-100 text-orange-800" },
  APPEAL_SUBMITTED: { label: "Appeal submitted", cls: "bg-blue-100 text-blue-800" },
  OVERTURNED: { label: "Overturned", cls: "bg-emerald-100 text-emerald-800" },
  UPHELD: { label: "Upheld", cls: "bg-red-100 text-red-800" },
  REJECTED: { label: "Rejected", cls: "bg-slate-200 text-slate-700" },
  ERROR: { label: "Error", cls: "bg-red-100 text-red-800" },
};

export const pct = (x, digits = 0) => (x == null || Number.isNaN(x) ? "–" : `${(x * 100).toFixed(digits)}%`);

export function timeAgo(iso) {
  if (!iso) return "";
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export const fmtTime = (iso) => (iso ? new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "");
export const fmtDateTime = (iso) => (iso ? new Date(iso).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : "");

export const ROLE_LABEL = { coordinator: "PA Coordinator", physician: "Physician", manager: "Manager" };
