import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "sage" | "ink" | "alert" | "paper";
}

export function Badge({ children, className, variant = "default" }: BadgeProps) {
  const variants = {
    default: "bg-paper-0 text-ink-950 border-ink-950",
    sage: "bg-sage-200 text-ink-950 border-ink-950",
    ink: "bg-ink-950 text-paper-50 border-ink-950",
    alert: "bg-alert-500 text-paper-0 border-ink-950",
    paper: "bg-paper-100 text-ink-700 border-ink-950",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-[3px] text-[10px] font-semibold uppercase tracking-[0.1em] border-[1.5px] font-mono",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
