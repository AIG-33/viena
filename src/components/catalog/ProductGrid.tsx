"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import type { Product } from "@/types/product";
import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
  const t = useTranslations("catalog.empty");

  if (products.length === 0) {
    return (
      <div className="card py-16 text-center">
        <p className="text-[11px] uppercase tracking-[0.16em] font-bold text-ink-500 mb-3">
          0 results
        </p>
        <p className="display-heading text-ink-900 text-2xl mb-2">{t("title")}</p>
        <p className="text-ink-600 text-sm">{t("subtitle")}</p>
      </div>
    );
  }

  return (
    <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      <AnimatePresence mode="popLayout">
        {products.map((product, i) => (
          <motion.div
            key={product.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <ProductCard product={product} index={i} />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
