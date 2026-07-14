import { HTMLAttributes } from "react";
import { cn } from "../../../../lib/utils/cn";

export function Card({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-neutral-200/60 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)]",
        className
      )}
      {...props}
    />
  );
}