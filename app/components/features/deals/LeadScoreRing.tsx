import { cn } from "../../../../lib/utils/cn";

interface LeadScoreRingProps {
  score: number;
  size?: number;
}

function getTier(score: number) {
  if (score >= 80) return { color: "#4F46E5", label: "Hoch" };
  if (score >= 50) return { color: "#A3A3A3", label: "Mittel" };
  return { color: "#D4D4D4", label: "Niedrig" };
}

export function LeadScoreRing({ score, size = 44 }: LeadScoreRingProps) {
  const tier = getTier(score);
  const stroke = 3.5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
      title={`Lead Score: ${score} (${tier.label})`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#EEEEEE"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={tier.color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-500 ease-out"
        />
      </svg>
      <span
        className={cn(
          "absolute text-xs font-semibold tabular-nums",
          score >= 80 ? "text-[#4F46E5]" : "text-neutral-700"
        )}
      >
        {score}
      </span>
    </div>
  );
}