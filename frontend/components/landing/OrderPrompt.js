"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useReducedMotion } from "motion/react";
import { Paperclip, ArrowUp } from "lucide-react";

// Real procedure + insurer combinations from the demo data.
const ORDERS = [
  "CABG for three-vessel disease, BlueRiver Health",
  "Knee MRI, suspected meniscal tear, Indus Health",
  "Total knee replacement after 8 weeks of physio, Medicare",
  "Angioplasty with stent, chest pain on exertion, Northstar",
  "Chemotherapy infusion, stage II breast cancer, EFU Life",
];

/** The template's typing prompt bar, cycling through example prior-authorization orders. */
export default function OrderPrompt() {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const [n, setN] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (reduce) return;
    const full = ORDERS[i];
    const t = setTimeout(
      () => {
        if (!deleting && n < full.length) setN(n + 1);
        else if (!deleting) setDeleting(true);
        else if (n > 0) setN(n - 1);
        else {
          setDeleting(false);
          setI((i + 1) % ORDERS.length);
        }
      },
      !deleting && n === full.length ? 1800 : deleting ? 18 : 42
    );
    return () => clearTimeout(t);
  }, [i, n, deleting, reduce]);

  const text = reduce ? ORDERS[0] : ORDERS[i].slice(0, n);

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="frost-glass flex items-center gap-2 rounded-xl p-2">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-gray-200 bg-white text-gray-500" title="Attach reports and scans">
          <Paperclip size={18} />
        </span>
        <div className="min-w-0 flex-1 truncate px-1 text-left text-sm text-gray-600 sm:text-base" aria-live="off">
          <span className="sr-only">Example order: </span>
          {text}
          <span className="ml-0.5 inline-block h-5 w-px translate-y-1 animate-caret bg-gray-500" aria-hidden="true" />
        </div>
        <Link href="/login" className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-ink text-white transition hover:bg-ink-soft active:scale-95" aria-label="Open the demo">
          <ArrowUp size={18} />
        </Link>
      </div>
    </div>
  );
}
