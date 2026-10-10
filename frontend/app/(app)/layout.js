"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, FolderKanban, FilePlus2, BookOpen, Landmark, ChartColumn, ScrollText, Settings, LogOut, Bot, Menu, X, Loader2, Sparkles, Cpu } from "lucide-react";
import { AuthProvider, useAuth } from "@/lib/auth";
import { ROLE_LABEL } from "@/lib/format";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/cases", label: "Cases", icon: FolderKanban },
  { href: "/cases/new", label: "New Case", icon: FilePlus2, roles: ["coordinator", "physician"] },
  { href: "/policies", label: "Policies", icon: BookOpen },
  { href: "/insurers", label: "Insurers", icon: Landmark },
  { href: "/analytics", label: "Analytics", icon: ChartColumn },
  { href: "/audit", label: "Audit Log", icon: ScrollText, roles: ["coordinator", "manager"] },
  { href: "/settings", label: "Settings", icon: Settings },
];

function Shell({ children }) {
  const { user, meta, loading, logout } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (loading)
    return (
      <div className="grid min-h-screen place-items-center text-slate-500">
        <Loader2 className="animate-spin" />
      </div>
    );

  const isActive = (href) => (href === "/cases" ? pathname === "/cases" || (pathname.startsWith("/cases/") && !pathname.startsWith("/cases/new")) : pathname.startsWith(href));
  const nav = NAV.filter((n) => !n.roles || n.roles.includes(user.role));

  const sidebar = (
    <nav className="flex h-full flex-col gap-1 p-3">
      <div className="mb-4 flex items-center gap-2 px-2 pt-1 font-semibold text-slate-900">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white">
          <Bot size={18} />
        </span>
        Prior Auth Copilot
      </div>
      {nav.map(({ href, label, icon: Icon }) => (
        <Link key={href} href={href} onClick={() => setOpen(false)} className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${isActive(href) ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-100"}`}>
          <Icon size={18} /> {label}
        </Link>
      ))}
      <div className="mt-auto rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
        <div className="flex items-center gap-1.5 font-medium text-slate-800">
          {meta?.ai?.mode === "llm" ? <Sparkles size={14} className="text-violet-600" /> : <Cpu size={14} />}
          {meta?.ai?.mode === "llm" ? `${meta.ai.providerLabel} agents` : "Rule-based agents"}
        </div>
        <div className="mt-0.5">{meta?.ai?.mode === "llm" ? meta.ai.model : "Set MISTRAL_API_KEY to enable the LLM"}</div>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 hidden w-60 border-r border-slate-200 bg-white lg:block">{sidebar}</aside>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/30" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-white shadow-xl">{sidebar}</aside>
        </div>
      )}
      <div className="lg:pl-60">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6">
          <button className="btn-secondary btn-sm lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
            {open ? <X size={16} /> : <Menu size={16} />}
          </button>
          <div className="hidden text-sm text-slate-500 lg:block">Synthetic data only · decision support for administrative staff</div>
          <div className="flex items-center gap-3">
            <div className="text-right leading-tight">
              <div className="text-sm font-medium text-slate-900">{user.name}</div>
              <div className="text-xs text-slate-500">{ROLE_LABEL[user.role]}</div>
            </div>
            <button onClick={logout} className="btn-secondary btn-sm" title="Sign out">
              <LogOut size={14} />
              <span className="hidden sm:inline">Switch user</span>
            </button>
          </div>
        </header>
        <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6">{children}</main>
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
