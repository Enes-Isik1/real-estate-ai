import { DealStatus } from "../../../../lib/types/deal";
import { cn } from "../../../../lib/utils/cn";

const statusConfig: Record<DealStatus, { label: string; className: string }> = {
  new: { label: "Neu", className: "bg-neutral-100 text-neutral-600" },
  analyzing: {
    label: "Analysiert",
    className: "bg-indigo-50 text-[#4F46E5]",
  },
  qualified: { label: "Qualifiziert", className: "bg-emerald-50 text-emerald-700" },
  proposal: { label: "Angebot", className: "bg-amber-50 text-amber-700" },
  won: { label: "Gewonnen", className: "bg-emerald-600 text-white" },
  lost: { label: "Verloren", className: "bg-neutral-100 text-neutral-400" },
};

export function StatusPill({ status }: { status: DealStatus }) {
  const config = statusConfig[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        config.className
      )}
    >
      {config.label}
    </span>
  );
}