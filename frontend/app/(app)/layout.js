"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, FolderKanban, FilePlus2, BookOpen, Landmark, ChartColumn, ScrollText, Settings, LogOut, Menu, X, Sparkles, Cpu, Database } from "lucide-react";
import { AuthProvider, useAuth } from "@/lib/auth";
import { ROLE_LABEL } from "@/lib/format";
import Logo from "@/components/Logo";

const NAV = [
  {
    group: "Workspace",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/cases", label: "Cases", icon: FolderKanban },
      { href: "/cases/new", label: "New case", icon: FilePlus2, roles: ["coordinator", "physician"] },
    ],
  },
  {
    group: "Knowledge",
    items: [
      { href: "/policies", label: "Policies", icon: BookOpen },
      { href: "/insurers", label: "Insurers", icon: Landmark },
    ],
  },
  {
    group: "Oversight",
    items: [
      { href: "/analytics", label: "Analytics", icon: ChartColumn },
      { href: "/audit", label: "Audit log", icon: ScrollText, roles: ["coordinator", "manager"] },
      { href: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

const initials = (name = "") =>
  name
    .replace(/^Dr\.?\s+/i, "")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

/** Skeleton shaped like the shell, shown while the session loads. */
function ShellSkeleton() {
  return (
    <div className="min-h-[100dvh] animate-pulse">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-gray-200/80 bg-white p-4 lg:block">
        <div className="h-8 w-40 rounded-lg bg-gray-100" />
        <div className="mt-8 space-y-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-9 rounded-lg bg-gray-100" />
          ))}
        </div>
      </aside>
      <div className="lg:pl-64">
        <div className="h-16 border-b border-gray-200/80 bg-white" />
        <div className="mx-auto max-w-[1400px] space-y-4 px-6 py-8">
          <div className="h-8 w-64 rounded-lg bg-gray-200/70" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 rounded-xl bg-white" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Shell({ children }) {
  const { user, meta, loading, logout } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (loading) return <ShellSkeleton />;

  const isActive = (href) => (href === "/cases" ? pathname === "/cases" || (pathname.startsWith("/cases/") && !pathname.startsWith("/cases/new")) : pathname.startsWith(href));
  const llm = meta?.ai?.mode === "llm";

  const sidebar = (
    <nav className="flex h-full flex-col p-4" aria-label="App">
      <Link href="/dashboard" className="mb-7 px-1.5 pt-1" onClick={() => setOpen(false)}>
        <Logo size="sm" />
      </Link>
      <div className="space-y-6">
        {NAV.map(({ group, items }) => {
          const visible = items.filter((n) => !n.roles || n.roles.includes(user.role));
          if (!visible.length) return null;
          return (
            <div key={group}>
              <div className="mb-1.5 px-3 text-[11px] font-medium text-gray-400">{group}</div>
              <div className="space-y-0.5">
                {visible.map(({ href, label, icon: Icon }) => {
                  const active = isActive(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${active ? "border border-gray-200/80 bg-white font-medium text-ink shadow-soft" : "border border-transparent text-gray-500 hover:bg-gray-100/80 hover:text-ink"}`}
                    >
                      <Icon size={17} className={active ? "text-brand-600" : ""} /> {label}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-auto space-y-2 rounded-xl border border-gray-200/80 bg-white p-3 text-xs shadow-soft">
        <div className="flex items-center gap-2 font-medium text-ink">
          <span className={`grid h-6 w-6 place-items-center rounded-md ${llm ? "bg-brand-50 text-brand-700" : "bg-gray-100 text-gray-600"}`}>{llm ? <Sparkles size={13} /> : <Cpu size={13} />}</span>
          {llm ? `${meta.ai.providerLabel} agents` : "Rule-based agents"}
        </div>
        <div className="truncate text-gray-500">{llm ? meta.ai.model : "Add an LLM key in backend/.env"}</div>
        {meta?.storage && (
          <div className="flex items-center gap-1.5 border-t border-gray-100 pt-2 text-gray-500">
            <Database size={12} /> {meta.storage.type === "mongodb" ? `MongoDB: ${meta.storage.database}` : "Local JSON store"}
          </div>
        )}
      </div>
    </nav>
  );

  return (
    <div className="min-h-[100dvh]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-gray-200/80 bg-gray-50/80 backdrop-blur lg:block">{sidebar}</aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-gray-50 shadow-2xl">{sidebar}</aside>
        </div>
      )}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-gray-200/80 bg-white/80 px-4 backdrop-blur-lg sm:px-6">
          <div className="flex items-center gap-3">
            <button className="btn-secondary btn-sm lg:hidden" onClick={() => setOpen(!open)} aria-label={open ? "Close menu" : "Open menu"}>
              {open ? <X size={16} /> : <Menu size={16} />}
            </button>
            <span className="hidden rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs text-gray-500 sm:inline">Synthetic data. Decision support for administrative staff.</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right leading-tight sm:block">
              <div className="text-sm font-medium text-ink">{user.name}</div>
              <div className="text-xs text-gray-500">{ROLE_LABEL[user.role]}</div>
            </div>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-ink text-xs font-medium text-white ring-4 ring-gray-100" aria-hidden="true">
              {initials(user.name)}
            </span>
            <button onClick={logout} className="btn-ghost btn-sm" title="Switch user">
              <LogOut size={15} />
              <span className="hidden md:inline">Switch user</span>
            </button>
          </div>
        </header>
        <main className="mx-auto max-w-[1400px] animate-fadein px-4 py-8 sm:px-6">{children}</main>
      </div>
    </div>
  );
}

export default function AppLayout({ children }) {
  return (
    <AuthProvider>
      <Shell>{children}</Shell>
    </AuthProvider>
  );
}
