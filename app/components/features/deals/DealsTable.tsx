import { Deal } from "../../../../lib/types/deal";
import { Card } from "../ui/Card";
import { DealRow } from "./DealRow";

export function DealsTable({ deals }: { deals: Deal[] }) {
  return (
    <Card>
      <div className="flex items-center justify-between px-6 py-5">
        <h2 className="text-base font-semibold tracking-tight text-neutral-900">
          Aktuelle Deals
        </h2>
        
        {/* Hier wurde das fehlende <a vor dem href ergänzt */}
        <a
          href="/deals"
          className="text-sm font-medium text-[#4F46E5] hover:text-[#4338CA]"
        >
          Alle ansehen
        </a>
      </div>
      <div>
        {deals.map((deal) => (
          <DealRow key={deal.id} deal={deal} />
        ))}
      </div>
    </Card>
  );
}