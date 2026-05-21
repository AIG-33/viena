"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { getCategoryLink } from "@/lib/utils";
import type { Category } from "@/types/category";

interface CategoryTileProps {
  category: Category;
  productsLabel: string;
  shopLabel?: string;
}

export function CategoryTile({
  category,
  productsLabel,
  shopLabel,
}: CategoryTileProps) {
  const link = getCategoryLink(category);
  const count = category.productCount ?? 0;
  // Categories that route off the catalog (partner solutions, shop
  // redirects) don't carry a SKU count — show the badge text instead.
  const showCount = !category.link && !(link.isExternal && !shopLabel);
  const countText =
    category.productCountLabel ??
    (showCount ? `${count} ${productsLabel}` : null);
  const badgeLabel =
    category.badge ?? (link.isExternal && shopLabel ? shopLabel : null);

  const Inner = (
    <motion.article
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 320, damping: 24 }}
      className="group relative h-full rounded-2xl overflow-hidden bg-paper-50 border border-paper-200 hover:border-ink-900 transition-colors"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {category.image ? (
          <Image
            src={category.image}
            alt={category.name}
            fill
            sizes="(max-width:768px) 50vw, (max-width:1280px) 33vw, 25vw"
            className="object-cover object-top group-hover:scale-[1.04] transition-transform duration-700"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-ink-300">
            <svg
              className="w-12 h-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

        {badgeLabel && (
          <span className="absolute top-2.5 right-2.5 text-[9px] uppercase tracking-[0.1em] font-bold text-white bg-green-600 px-1.5 py-0.5 rounded-full">
            {badgeLabel}
          </span>
        )}

        <div className="absolute left-3 right-3 bottom-3 flex items-end justify-between gap-2 text-white">
          <h3 className="font-display text-[16px] md:text-[17px] leading-[1.15] tracking-[-0.005em] drop-shadow line-clamp-2">
            {category.name}
          </h3>
          {countText && (
            <span className="font-mono text-[11px] tabular-nums text-white/85 shrink-0">
              {countText}
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );

  return link.isExternal ? (
    <a
      href={link.href}
      target="_blank"
      rel="noreferrer noopener"
      className="block h-full"
    >
      {Inner}
    </a>
  ) : (
    <Link href={link.href} className="block h-full">
      {Inner}
    </Link>
  );
}
