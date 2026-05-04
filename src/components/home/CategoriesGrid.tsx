"use client";

import { motion } from "framer-motion";
import type { Category } from "@/types/category";
import { CategoryCard } from "./CategoryCard";
import { SectionHeading } from "@/components/ui/SectionHeading";

interface CategoriesGridProps {
  categories: Category[];
}

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export function CategoriesGrid({ categories }: CategoriesGridProps) {
  return (
    <section className="relative py-24 px-4 md:px-6 max-w-7xl mx-auto">
      <SectionHeading
        label="КАТАЛОГ"
        code={`/ 02 · ${String(categories.length).padStart(2, "0")} КАТЕГОРИЙ`}
        title="Для лабораторной"
        highlight="диагностики"
        description="Восемь классов товаров для клиник, больниц и научных центров — от расходных материалов до высокоточных анализаторов."
      />

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 border-[1.5px] border-ink-950"
        style={{ marginLeft: 0 }}
      >
        {categories.map((cat, i) => (
          <motion.div
            key={cat.id}
            variants={item}
            className={`${
              i < 2 ? "sm:col-span-2 lg:col-span-2" : ""
            } ${
              i !== 0 ? "border-l-0 sm:border-l-[1.5px] sm:border-ink-950" : ""
            }`}
          >
            <CategoryCard category={cat} index={i} large={i < 2} />
          </motion.div>
        ))}
      </motion.div>

      {/* Row of data tags below */}
      <div className="mt-10 flex flex-wrap items-center gap-3 pt-6 border-t border-ink-950/20">
        <span className="serial-label">DATA · VIENA MEDICAL</span>
        {[
          "SKU · 0000273",
          "REV · 4.26",
          "DIST · BY",
          "EST · 2013",
        ].map((t) => (
          <span key={t} className="serial-chip">
            {t}
          </span>
        ))}
      </div>
    </section>
  );
}
