import { StatCard } from "./StatCard";

// Wir erstellen 4 kleine, saubere SVG-Komponenten, die exakt wie die Lucide-Icons aussehen
const FlameIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
  </svg>
);

const TargetIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <circle cx="12" cy="12" r="6"></circle>
    <circle cx="12" cy="12" r="2"></circle>
  </svg>
);

const TrendingUpIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
    <polyline points="16 7 22 7 22 13"></polyline>
  </svg>
);

const TimerIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="10" y1="2" x2="14" y2="2"></line>
    <line x1="12" y1="14" x2="15" y2="11"></line>
    <circle cx="12" cy="14" r="8"></circle>
  </svg>
);

export function StatsGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Aktive Deals"
        value="24"
        delta="+3 diese Woche"
        icon={FlameIcon}
      />
      <StatCard
        label="Ø Lead Score"
        value="71"
        delta="+5 pts"
        icon={TargetIcon}
      />
      <StatCard
        label="Konversionsrate"
        value="38%"
        delta="+4,2%"
        icon={TrendingUpIcon}
      />
      <StatCard
        label="Zeit gespart"
        value="14,5 Std"
        delta="diese Woche"
        deltaPositive
        icon={TimerIcon}
      />
    </div>
  );
}