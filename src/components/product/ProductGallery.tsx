"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";

interface ProductGalleryProps {
  images: string[];
  name: string;
}

export function ProductGallery({ images, name }: ProductGalleryProps) {
  const t = useTranslations("productPage.gallery");
  const [current, setCurrent] = useState(0);

  if (images.length === 0) {
    return (
      <div className="aspect-[4/3] rounded-2xl bg-paper-100 grid place-items-center text-ink-300">
        <div className="flex flex-col items-center gap-3">
          <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-[12px] uppercase tracking-[0.12em] font-semibold">{t("placeholder")}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-paper-100 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0"
          >
            <Image
              src={images[current]}
              alt={t("photoAlt", { name, index: current + 1 })}
              fill
              sizes="(max-width:1024px) 100vw, 50vw"
              className="object-contain p-4"
              unoptimized
              priority
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {images.length > 1 && (
        <div className="flex gap-2.5">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-[88px] h-[72px] rounded-xl overflow-hidden bg-paper-100 transition-all ${
                i === current
                  ? "ring-2 ring-green-500 ring-offset-2"
                  : "border border-paper-200 hover:border-ink-700"
              }`}
            >
              <Image src={img} alt="" width={88} height={72} className="w-full h-full object-contain p-1" unoptimized />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
