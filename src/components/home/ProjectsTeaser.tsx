"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Project } from "@/types/project";

interface Props {
  projects: Project[];
}

export function ProjectsTeaser({ projects }: Props) {
  const t = useTranslations("home.projectsTeaser");
  const featured = projects.slice(0, 3);

  return (
    <section className="bg-white py-16 md:py-24">
      <div className="max-w-[1320px] mx-auto px-4 md:px-10 lg:px-14">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-10">
          <div>
            <span className="eyebrow"><span className="dot" />{t("eyebrow")}</span>
            <h2 className="display-heading text-ink-900 text-4xl md:text-5xl mt-4 max-w-2xl">
              {t("titleLine1")}{" "}
              <span className="text-green-600">{t("titleAccent1")}</span>{" "}
              {t("titleLine2")} <span className="text-green-600">{t("titleAccent2")}</span>
            </h2>
          </div>
          <Link href="/projects" className="btn btn-ghost">
            {t("viewAll")}
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {featured.map((p) => {
            const img = p.images?.[0];
            return (
              <article key={p.id} className="card overflow-hidden card-hover group">
                <div className="aspect-[4/3] relative bg-paper-100">
                  {img ? (
                    <Image
                      src={img}
                      alt={p.title}
                      fill
                      sizes="(max-width:768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center text-ink-300 font-display text-2xl">
                      ВМ
                    </div>
                  )}
                  {p.tags?.[0] && (
                    <span className="absolute top-3 left-3 text-[10px] font-bold tracking-[0.08em] uppercase px-2.5 py-1.5 rounded-full bg-white/95 text-ink-700">
                      {p.tags[0]}
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <div className="text-[11px] tracking-[0.08em] uppercase font-semibold text-ink-500">
                    {p.client} · {p.year}
                  </div>
                  <div className="text-[17px] font-bold text-ink-900 leading-snug mt-2 font-display">
                    {p.title}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
