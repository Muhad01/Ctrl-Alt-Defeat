"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, BookOpen } from "lucide-react";
import { api } from "@/lib/api";
import { PageHeader, Loading, ErrorBox } from "@/components/ui";

export default function Policies() {
  const [data, setData] = useState(null);
  const [selected, setSelected] = useState(null);
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [method, setMethod] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/policies")
      .then((d) => {
        setData(d);
        setSelected(d.policies[0]?.id);
      })
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (!q.trim()) return setResults([]);
    const t = setTimeout(() => api.get(`/policies?q=${encodeURIComponent(q)}`).then((d) => {
          setResults(d.results);
          setMethod(d.method);
        }), 250);
    return () => clearTimeout(t);
  }, [q]);

  if (error) return <ErrorBox error={error} />;
  if (!data) return <Loading />;
  const policy = data.policies.find((p) => p.id === selected);

  return (
    <div>
      <PageHeader title="Policy library" subtitle={`Mock payer coverage policies, chunked by section for retrieval. Search: ${data.embeddings?.status === "ready" ? "semantic (local bge-small-en-v1.5 embeddings)" : "TF-IDF (embedding model " + (data.embeddings?.status || "off") + ")"} with payer/CPT filters.`} />
      <div className="card mb-5 p-3">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
          <input className="input pl-9" placeholder="Search policy text, e.g. “physical therapy weeks” or “radiographs”" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        {results.length > 0 && <p className="mt-2 text-[11px] text-slate-400">Ranked by {method === "embeddings" ? "embedding cosine similarity" : "TF-IDF cosine similarity"}</p>}
        {results.length > 0 && (
          <ul className="mt-3 divide-y divide-slate-100">
            {results.map((r, i) => (
              <li key={i}>
                <button onClick={() => setSelected(r.policyId)} className="flex w-full items-start justify-between gap-3 px-1 py-2 text-left hover:bg-slate-50">
                  <div>
                    <div className="text-sm font-medium text-slate-800">
                      {r.policyId} §{r.ref} · {r.title}
                    </div>
                    <div className="line-clamp-1 text-xs text-slate-500">{r.text}</div>
                  </div>
                  <span className="shrink-0 font-mono text-xs text-slate-400">{r.score.toFixed(3)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
        <div className="card p-2">
          {data.policies.map((p) => (
            <button key={p.id} onClick={() => setSelected(p.id)} className={`block w-full rounded-lg px-3 py-2.5 text-left ${selected === p.id ? "bg-brand-50" : "hover:bg-slate-50"}`}>
              <div className="text-sm font-medium text-slate-800">{p.name}</div>
              <div className="text-xs text-slate-500">
                <span className="font-mono">{p.id}</span> · CPT {p.cpts.join(", ")} · used by {p.usedBy.length} case(s)
              </div>
            </button>
          ))}
        </div>

        {policy && (
          <div className="card card-pad">
            <div className="flex items-start gap-3">
              <BookOpen className="mt-1 text-brand-600" size={20} />
              <div>
                <h2 className="text-lg">{policy.name}</h2>
                <p className="text-xs text-slate-500">
                  {policy.payer} · {policy.id} {policy.version} · effective {policy.effective} · {policy.source}
                </p>
              </div>
            </div>

            <h3 className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wide text-slate-500">Criteria</h3>
            <div className="overflow-x-auto">
              <table className="table-base min-w-[520px]">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Criterion</th>
                    <th>Type</th>
                    <th>Denial reason if unmet</th>
                  </tr>
                </thead>
                <tbody>
                  {policy.criteria.map((c) => (
                    <tr key={c.id}>
                      <td className="font-mono text-xs">
                        {c.id} §{c.ref}
                      </td>
                      <td>{c.text}</td>
                      <td>
                        <span className={`chip ${c.required ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600"}`}>{c.required ? "required" : "supporting"}</span>
                      </td>
                      <td className="text-xs text-slate-500">{c.denialClass.replaceAll("_", " ").toLowerCase()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className="mb-2 mt-6 text-xs font-semibold uppercase tracking-wide text-slate-500">Full text</h3>
            <div className="space-y-3">
              {policy.sections.map((s) => (
                <div key={s.ref}>
                  <div className="text-sm font-semibold text-slate-800">
                    §{s.ref} {s.title}
                  </div>
                  <p className="text-sm text-slate-600">{s.text}</p>
                </div>
              ))}
            </div>

            {policy.usedBy.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2 text-xs">
                <span className="text-slate-500">Cases using this policy:</span>
                {policy.usedBy.map((id) => (
                  <Link key={id} href={`/cases/${id}`} className="font-mono text-brand-700 hover:underline">
                    {id}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
