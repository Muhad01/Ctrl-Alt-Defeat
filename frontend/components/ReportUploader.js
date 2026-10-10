"use client";
import { useRef, useState } from "react";
import { UploadCloud, FileText, Image as ImageIcon, X } from "lucide-react";

export const ACCEPT = ".pdf,.png,.jpg,.jpeg,.webp,.docx,.txt,.md,application/pdf,image/*,text/plain";
const MAX_BYTES = 15 * 1024 * 1024;

const size = (n) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

/** Drag-and-drop picker for reports, scans, photos and test results. Controlled: `files` + `onChange`. */
export default function ReportUploader({ files, onChange, compact = false }) {
  const input = useRef(null);
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState("");

  function add(list) {
    const next = [...files];
    const problems = [];
    for (const f of list) {
      if (f.size > MAX_BYTES) problems.push(`${f.name} is larger than 15 MB`);
      else if (!next.some((x) => x.name === f.name && x.size === f.size)) next.push(f);
    }
    if (next.length > 10) problems.push("At most 10 files at a time");
    setError(problems.join(". "));
    onChange(next.slice(0, 10));
  }

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => input.current?.click()}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && input.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          add(e.dataTransfer.files);
        }}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed text-center transition ${compact ? "px-3 py-3" : "px-4 py-6"} ${drag ? "border-brand-500 bg-brand-50" : "border-slate-300 hover:border-brand-500 hover:bg-slate-50"}`}
      >
        <UploadCloud size={compact ? 18 : 24} className="text-slate-400" />
        <p className="mt-1 text-sm font-medium text-slate-700">Drop reports here or click to browse</p>
        {!compact && <p className="mt-0.5 text-xs text-slate-500">Lab results, ECG, echo, angiography, X-ray/CT/MRI reports, pathology, discharge summaries, prescriptions. PDF, JPG, PNG, DOCX or TXT, up to 15 MB each. Scans and phone photos are read by the AI.</p>}
        <input
          ref={input}
          type="file"
          multiple
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => {
            add(e.target.files);
            e.target.value = "";
          }}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      {files.length > 0 && (
        <ul className="mt-2 space-y-1">
          {files.map((f, i) => (
            <li key={`${f.name}-${i}`} className="flex items-center justify-between gap-2 rounded-md bg-slate-50 px-2.5 py-1.5 text-xs">
              <span className="flex min-w-0 items-center gap-1.5 text-slate-700">
                {f.type.startsWith("image/") ? <ImageIcon size={13} className="shrink-0 text-slate-400" /> : <FileText size={13} className="shrink-0 text-slate-400" />}
                <span className="truncate">{f.name}</span>
                <span className="shrink-0 text-slate-400">{size(f.size)}</span>
              </span>
              <button type="button" aria-label={`Remove ${f.name}`} className="text-slate-400 hover:text-red-600" onClick={() => onChange(files.filter((_, j) => j !== i))}>
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
