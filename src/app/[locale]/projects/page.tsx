import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getAllProjects } from "@/lib/data";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { PageHero } from "@/components/layout/PageHero";
import type { Metadata } from "next";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "projects.hero" });
  return { title: t("titleLine1Accent"), description: t("description") };
}

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("projects");
  const projects = getAllProjects(locale);

  return (
    <>
      <PageHero
        eyebrow={t("hero.eyebrow")}
        title={
          <>
            {t("hero.titleLine1")} <span className="text-grad-green">{t("hero.titleLine1Accent")}</span>
            <br />
            {t("hero.titleLine2Pre")} <span className="text-grad-green">{t("hero.titleLine2Accent")}</span>
          </>
        }
        description={t("hero.description")}
      />

      <section className="bg-white py-12 md:py-16">
        <div className="max-w-[1320px] mx-auto px-4 md:px-10 lg:px-14">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-7">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-paper-50 py-12 md:py-16">
        <div className="max-w-[1320px] mx-auto px-4 md:px-10 lg:px-14">
          <div
            className="rounded-3xl p-7 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
            style={{
              background:
                "linear-gradient(120deg, var(--color-green-100) 0%, var(--color-paper-100) 60%)",
            }}
          >
            <div>
              <span className="eyebrow">
                <span className="pill">{t("closed.eyebrow")}</span>
                {t("closed.eyebrowSub")}
              </span>
              <p className="text-ink-900 text-[15px] md:text-base max-w-xl mt-3">
                {t("closed.text")}
              </p>
            </div>
            <Link href="/contacts" className="btn btn-green shrink-0">
              {t("closed.button")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
