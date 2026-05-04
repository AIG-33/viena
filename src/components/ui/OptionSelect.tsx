"use client";

import { useEffect, useRef, useState } from "react";

interface OptionSelectProps {
  value: string;
  options: string[];
  onChange: (value: string) => void;
  className?: string;
}

export function OptionSelect({ value, options, onChange, className = "" }: OptionSelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  const pick = (v: string) => {
    onChange(v);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className="w-full flex items-center justify-between gap-2 bg-white text-ink-900 text-[12px] font-medium border border-paper-200 rounded-lg px-3 py-2 hover:border-ink-700 transition-colors"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="truncate">{value}</span>
        <svg
          className={`w-3.5 h-3.5 text-ink-500 transition-transform shrink-0 ${open ? "rotate-180" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-paper-200 rounded-xl max-h-56 overflow-y-auto shadow-[var(--shadow-2)] py-1"
        >
          {options.map((opt) => {
            const isActive = opt === value;
            return (
              <li key={opt}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    pick(opt);
                  }}
                  className={`w-full text-left px-3 py-2 text-[12px] transition-colors hover:bg-green-50 hover:text-green-700 focus:bg-green-50 focus:text-green-700 focus:outline-none ${
                    isActive ? "text-green-700 font-semibold bg-green-50" : "text-ink-800"
                  }`}
                >
                  {opt}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
