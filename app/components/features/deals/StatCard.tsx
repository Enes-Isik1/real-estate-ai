import { Card } from "../ui/Card";
import { cn } from "../../../../lib/utils/cn";

interface StatCardProps {
  label: string;
  value: string;
  delta?: string;
  deltaPositive?: boolean;
  // Geändert von LucideIcon auf ein allgemeines React-Icon-Element, um Fehler zu vermeiden
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}

export function StatCard({
  label,
  value,
  delta,
  deltaPositive = true,
  icon: Icon,
}: StatCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <span className="text-sm text-neutral-500">{label}</span>
        {/* bg-[#4F46E5]/8 wurde zu bg-indigo-50 geändert, da Tailwind-Deckkraft-Kürzel manchmal Probleme machen */}
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
          <Icon className="h-4 w-4 text-[#4F46E5]" strokeWidth={2} />
        </div>
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight text-neutral-900">
          {value}
        </span>
        {delta && (
          <span
            className={cn(
              "text-xs font-medium",
              deltaPositive ? "text-emerald-600" : "text-neutral-400"
            )}
          >
            {delta}
          </span>
        )}
      </div>
    </Card>
  );
}