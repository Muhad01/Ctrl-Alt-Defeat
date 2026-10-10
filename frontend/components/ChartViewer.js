"use client";
import { useEffect, useMemo, useRef } from "react";
import { FileText, ExternalLink, ScanText, Clock, AlertTriangle, Sparkles } from "lucide-react";
import { documentFileUrl } from "@/lib/api";

/** Patient chart with evidence quotes highlighted; the active quote is scrolled into view. */
export default function ChartViewer({ documents = [], highlights = [], active, uploads = [], onInclude }) {
  const activeRef = useRef(null);
  const waiting = uploads.filter((u) => u.upload.status !== "read");

  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [active]);

  const rendered = useMemo(
    () =>
      documents.map((doc) => {
        const spans = highlights
          .filter((h) => h.docId === doc.id && h.start != null)
          .sort((a, b) => a.start - b.start)
          .filter((h, i, arr) => i === 0 || h.start >= arr[i - 1].end);
        const parts = [];
        let pos = 0;
        spans.forEach((h, i) => {
          if (h.start > pos) parts.push({ text: doc.text.slice(pos, h.start) });
          parts.push({ text: doc.text.slice(h.start, h.end), mark: true, key: `${doc.id}-${i}`, isActive: active && active.docId === doc.id && active.start === h.start });
          pos = h.end;
        });
        parts.push({ text: doc.text.slice(pos) });
        return { doc, parts };
      }),
    [documents, highlights, active]
  );

  return (
    <div className="space-y-4">
      {waiting.map((u) => {
        const bad = u.upload.status === "failed" || u.upload.status === "excluded";
        return (
          <div key={u.id} className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-xs ${bad ? "border-red-200 bg-red-50 text-red-700" : "border-sky-200 bg-sky-50 text-sky-800"}`}>
            {bad ? <AlertTriangle size={14} className="mt-0.5 shrink-0" /> : <Clock size={14} className="mt-0.5 shrink-0" />}
            <div className="min-w-0 flex-1">
              <span className="font-medium">{u.upload.name}</span>:{" "}
              {u.upload.status === "failed" && `could not be read (${u.upload.error}). Paste its text with "Add note" instead.`}
              {u.upload.status === "excluded" && `not added to the chart. ${u.upload.excludedReason}`}
              {u.upload.status === "pending" && "waiting for the Report Reader (it runs at the start of the next copilot run)."}
              {u.upload.status === "excluded" && (
                <div className="mt-1.5 flex items-center gap-3">
                  <a href={documentFileUrl(u.id)} target="_blank" rel="noreferrer" className="flex items-center gap-0.5 underline">
                    open file <ExternalLink size={11} />
                  </a>
                  {onInclude && (
                    <button type="button" className="underline" onClick={() => onInclude(u.id)}>
                      Add to chart anyway
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
      {rendered.map(({ doc, parts }) => (
        <div key={doc.id} className="rounded-lg border border-slate-200 bg-white">
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-3 py-2">
            <div className="flex min-w-0 items-center gap-2 text-sm font-medium text-slate-800">
              <FileText size={14} className="shrink-0 text-slate-400" /> <span className="truncate">{doc.title}</span>
            </div>
            <span className="flex shrink-0 items-center gap-2 text-xs text-slate-400">
              {doc.date}
              {doc.upload && (
                <a href={documentFileUrl(doc.id)} target="_blank" rel="noreferrer" className="flex items-center gap-0.5 text-brand-600 hover:underline" title="Open the original file">
                  original <ExternalLink size={11} />
                </a>
              )}
            </span>
          </div>
          {doc.upload && <UploadInfo doc={doc} />}
          <pre className="whitespace-pre-wrap break-words px-3 py-3 font-sans text-[13px] leading-relaxed text-slate-700">
            {parts.map((p, i) =>
              p.mark ? (
                <mark key={p.key} ref={p.isActive ? activeRef : undefined} className={`mark-evidence ${p.isActive ? "mark-active" : ""}`}>
                  {p.text}
                </mark>
              ) : (
                <span key={i}>{p.text}</span>
              )
            )}
          </pre>
          {doc.receivedAfterSubmission && <div className="border-t border-slate-100 px-3 py-1.5 text-xs text-orange-600">Received after the original submission</div>}
          {doc.attachedBy && <div className="border-t border-slate-100 px-3 py-1.5 text-xs text-slate-500">Added by {doc.attachedBy}</div>}
        </div>
      ))}
      {!documents.length && !waiting.length && <p className="text-sm text-slate-400">No documents in chart.</p>}
    </div>
  );
}

/** How an uploaded file was read, plus the Report Reader's analysis (each key finding quotes the text below). */
function UploadInfo({ doc }) {
  const { upload, analysis } = doc;
  const lowQuality = (upload.confidence != null && upload.confidence < 60) || upload.legibility === "low";
  return (
    <div className="border-b border-slate-100 bg-slate-50/70 px-3 py-2 text-xs">
      <div className={`flex items-center gap-1.5 ${lowQuality ? "text-orange-700" : "text-slate-500"}`}>
        <ScanText size={13} className="shrink-0" /> {upload.method}
        {lowQuality && <span className="font-medium">· low read quality, check against the original</span>}
      </div>
      {analysis && (
        <div className="mt-1.5">
          <div className="flex items-center gap-1.5 font-medium text-slate-700">
            <Sparkles size={13} className="text-violet-500" /> {analysis.documentType}
            <span className="font-normal text-slate-400">({analysis.method === "rules" ? "keyword rules" : "AI analysis"})</span>
          </div>
          {analysis.summary && <p className="mt-0.5 text-slate-600">{analysis.summary}</p>}
          {analysis.keyFindings?.length > 0 && (
            <ul className="mt-1 space-y-0.5">
              {analysis.keyFindings.map((f, i) => (
                <li key={i} className="flex gap-1.5 text-slate-700" title={`Quoted from the report: ${f.quote}`}>
                  <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${f.abnormal ? "bg-red-500" : "bg-slate-400"}`} />
                  {f.finding}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
