import { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../../../lib/utils/cn";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md";
  icon?: ReactNode;
}

// Record<string, string> sagt TypeScript, dass es sich um ein Objekt mit Text-Schlüsseln und Text-Werten handelt
const variantStyles: Record<string, string> = {
  primary:
    "bg-[#4F46E5] text-white hover:bg-[#4338CA] shadow-[0_1px_3px_rgba(79,70,229,0.35)]",
  secondary:
    "bg-white text-neutral-900 border border-neutral-200/60 hover:bg-neutral-50",
  ghost: "bg-transparent text-neutral-500 hover:bg-neutral-100",
};

const sizeStyles: Record<string, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
};

export function Button({
  variant = "primary",
  size = "md",
  icon,
  children,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5]/40 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}