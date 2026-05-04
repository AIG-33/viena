"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Project } from "@/types/project";

export function ProjectCard({ project }: { project: Project; index?: number }) {
  const t = useTranslations("projects.card");
  const [main, ...rest] = project.images ?? [];
  const thumbnails = rest.slice(0, 3);
  const hasDetail = Boolean(project.href);

  const inner = (
    <>
      <div className="aspect-[16/9] relative bg-paper-100 overflow-hidden">
        {main ? (
          <Image
            src={main}
            alt={project.title}
            fill
            sizes="(max-width:768px) 100vw, 50vw"
            className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-ink-300 font-display text-3xl">
            ВМ
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {project.tags.slice(0, 2).map((t) => (
            <span
              key={t}
              className="inline-flex text-[10px] font-bold tracking-[0.08em] uppercase px-2.5 py-1 rounded-full bg-white/95 text-ink-700 backdrop-blur-sm"
            >
              {t}
            </span>
          ))}
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3 text-white">
          <span className="text-[11px] uppercase tracking-[0.1em] font-bold opacity-90">
            {project.client}
          </span>
          <span className="font-mono text-[12px] tabular-nums px-2 py-0.5 rounded-md bg-white/15 backdrop-blur-md border border-white/25">
            {project.year}
          </span>
        </div>
      </div>

      <div className="p-6 md:p-7 flex-1 flex flex-col">
        <h3 className="font-display text-[22px] md:text-[24px] font-bold text-ink-900 leading-snug group-hover:text-green-700 transition-colors">
          {project.title}
        </h3>
        <p className="text-[14px] text-ink-700 leading-relaxed mt-3">
          {project.description}
        </p>

        {thumbnails.length > 0 && (
          <div className="mt-5 grid grid-cols-3 gap-2">
            {thumbnails.map((src) => (
              <div
                key={src}
                className="relative aspect-[4/3] rounded-lg overflow-hidden bg-paper-100 border border-paper-200"
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="(max-width:768px) 33vw, 16vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}

        <div className="mt-auto pt-5 border-t border-paper-200 flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-[0.12em] font-bold text-ink-500">
            {project.tags.slice(2).join(" · ") || project.categories[0]}
          </span>
          <span className="text-[12px] font-semibold text-green-700 group-hover:text-green-600 transition-colors">
            {hasDetail ? t("details") : t("cooperation")}
          </span>
        </div>
      </div>
    </>
  );

  if (hasDetail) {
    return (
      <Link
        href={project.href!}
        className="card card-hover overflow-hidden h-full flex flex-col group block focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
      >
        {inner}
      </Link>
    );
  }

  return (
    <Link
      href="/contacts"
      className="card card-hover overflow-hidden h-full flex flex-col group block focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
    >
      {inner}
    </Link>
  );
}
