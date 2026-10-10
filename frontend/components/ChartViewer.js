"use client";
import { useEffect, useMemo, useRef } from "react";
import { FileText } from "lucide-react";

/** Patient chart with evidence quotes highlighted; the active quote is scrolled into view. */
export default function ChartViewer({ documents = [], highlights = [], active }) {
  const activeRef = useRef(null);

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
      {rendered.map(({ doc, parts }) => (
        <div key={doc.id} className="rounded-lg border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
              <FileText size={14} className="text-slate-400" /> {doc.title}
            </div>
            <span className="text-xs text-slate-400">{doc.date}</span>
          </div>
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
      {!documents.length && <p className="text-sm text-slate-400">No documents in chart.</p>}
    </div>
  );
}
