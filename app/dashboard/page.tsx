import { DashboardHeader } from "../components/features/deals/DashboardHeader";
import { StatsGrid } from "../components/features/deals/StatsGrid";
import { DealsTable } from "../components/features/deals/DealsTable";
import { mockDeals } from "../../lib/mock/deals";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-6xl space-y-8 px-6 py-10 lg:px-8">
        <DashboardHeader />
        <StatsGrid />
        <DealsTable deals={mockDeals} />
      </div>
    </main>
  );
}