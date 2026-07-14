import { Deal } from "../../../../lib/types/deal";
import { LeadScoreRing } from "./LeadScoreRing";
import { StatusPill } from "../ui/StatusPill";

function formatRelativeTime(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 1) return "gerade eben";
  if (hours < 24) return `vor ${hours} Std`;
  const days = Math.floor(hours / 24);
  return `vor ${days} Tag${days > 1 ? "en" : ""}`;
}

export function DealRow({ deal }: { deal: Deal }) {
  return (
    <div className="flex items-center gap-4 border-t border-neutral-200/60 px-6 py-4 transition-colors hover:bg-neutral-50/80">
      <LeadScoreRing score={deal.leadScore} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-neutral-900">
          {deal.contactName}
          {deal.contactCompany && (
            <span className="ml-1.5 font-normal text-neutral-400">
              · {deal.contactCompany}
            </span>
          )}
        </p>
        <p className="truncate text-sm text-neutral-500">
          {deal.propertyAddress}
        </p>
      </div>
      <div className="hidden shrink-0 sm:block">
        <StatusPill status={deal.status} />
      </div>
      <span className="shrink-0 text-xs tabular-nums text-neutral-400">
        {formatRelativeTime(deal.updatedAt)}
      </span>
    </div>
  );
}