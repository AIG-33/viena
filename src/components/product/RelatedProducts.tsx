"use client";

import { useTranslations } from "next-intl";
import type { Product } from "@/types/product";
import { ProductCard } from "@/components/catalog/ProductCard";

interface RelatedProductsProps {
  products: Product[];
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  const t = useTranslations("productPage");
  const tCard = useTranslations("productCard");
  if (products.length === 0) return null;

  return (
    <div className="mt-16 pt-10 border-t border-paper-200">
      <div className="flex flex-wrap items-baseline justify-between gap-4 mb-8">
        <h2 className="display-heading text-ink-900 text-3xl">{t("related")}</h2>
        <span className="text-[12px] text-ink-500">
          {products.length} {tCard("inStock")}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {products.map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} />
        ))}
      </div>
    </div>
  );
}
