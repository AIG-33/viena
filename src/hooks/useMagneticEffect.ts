"use client";

import { useRef, useCallback } from "react";

export function useMagneticEffect(strength = 0.4) {
  const ref = useRef<HTMLElement>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) * strength;
      const dy = (e.clientY - cy) * strength;
      el.style.transform = `translate(${dx}px, ${dy}px)`;
    },
    [strength]
  );

  const handleMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "translate(0, 0)";
    el.style.transition = "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
    setTimeout(() => {
      if (el) el.style.transition = "";
    }, 400);
  }, []);

  return { ref, handleMouseMove, handleMouseLeave };
}
