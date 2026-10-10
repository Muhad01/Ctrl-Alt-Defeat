import { ShieldCheck } from "lucide-react";

/** Product mark: icon tile + wordmark. `size` scales the tile (sm for sidebars, md for headers). */
export default function Logo({ size = "md", showName = true, className = "" }) {
  const tile = size === "sm" ? "h-7 w-7 rounded-lg" : "h-8 w-8 rounded-[10px]";
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span className={`grid place-items-center bg-ink text-white shadow-glow ${tile}`}>
        <ShieldCheck size={size === "sm" ? 15 : 17} strokeWidth={2} />
      </span>
      {showName && <span className="text-[15px] font-medium tracking-tight text-ink">AuthProof</span>}
    </span>
  );
}
