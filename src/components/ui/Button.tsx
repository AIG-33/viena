"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "dark" | "sage";
  size?: "sm" | "md" | "lg";
  as?: "button" | "a";
  href?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, className, variant = "primary", size = "md", ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center gap-2 font-semibold cursor-pointer select-none focus-visible:outline-none transition-[transform,box-shadow,background,border] duration-150 uppercase tracking-[0.04em]";

    const sizes = {
      sm: "px-4 py-2 text-[11px]",
      md: "px-5 py-2.5 text-xs",
      lg: "px-7 py-3.5 text-sm",
    };

    // All variants share: 1.5px ink border, square corners, 4px offset hard-shadow on hover
    const variants = {
      primary:
        "bg-ink-950 text-paper-0 border-[1.5px] border-ink-950 hover:bg-forest-600 hover:border-forest-600 active:translate-x-[1px] active:translate-y-[1px]",
      sage:
        "bg-sage-200 text-ink-950 border-[1.5px] border-ink-950 hover:bg-sage-300 active:translate-x-[1px] active:translate-y-[1px]",
      secondary:
        "bg-paper-0 text-ink-950 border-[1.5px] border-ink-950 hover:bg-paper-100 active:translate-x-[1px] active:translate-y-[1px]",
      ghost:
        "text-ink-700 hover:text-ink-950 hover:bg-paper-100 border-[1.5px] border-transparent",
      outline:
        "bg-transparent text-ink-950 border-[1.5px] border-ink-950 hover:bg-ink-950 hover:text-paper-0 active:translate-x-[1px] active:translate-y-[1px]",
      dark:
        "bg-ink-950 text-paper-0 border-[1.5px] border-ink-950 hover:bg-ink-800 active:translate-x-[1px] active:translate-y-[1px]",
    };

    return (
      <button
        ref={ref}
        className={cn(base, sizes[size], variants[variant], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
