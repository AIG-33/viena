"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export function ProcessTimeline() {
  const t = useTranslations("services.process");
  const steps = t.raw("steps") as { n: string; title: string; desc: string }[];

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4 mb-8">
        <h2 className="display-heading text-ink-900 text-3xl md:text-4xl">
          {t("title")}
        </h2>
        <span className="text-[12px] uppercase tracking-[0.14em] font-bold text-ink-500 hidden sm:inline">
          {t("eyebrow")} · 06
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {steps.map((step, i) => (
          <motion.div
            key={step.n}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.45, delay: i * 0.05 }}
            className="card p-6 flex flex-col gap-3 h-full"
          >
            <div className="flex items-baseline justify-between">
              <span className="font-display font-extrabold text-[42px] leading-none tabular-nums text-ink-900">
                {step.n}
              </span>
              <span className="text-[10px] uppercase tracking-[0.12em] font-bold text-green-700">
                {i === steps.length - 1 ? "✓" : "↓"}
              </span>
            </div>
            <h3 className="font-display font-bold text-[18px] text-ink-900 mt-1">{step.title}</h3>
            <p className="text-[13px] text-ink-600 leading-relaxed">{step.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
