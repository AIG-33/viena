import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function AboutSection() {
  const t = useTranslations("home.aboutSection");
  const stats = t.raw("stats") as { n: string; l: string }[];

  return (
    <section className="bg-paper-50 py-16 md:py-24">
      <div className="max-w-[1320px] mx-auto px-4 md:px-10 lg:px-14">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <div>
            <span className="eyebrow"><span className="dot" />{t("eyebrow")}</span>
            <h2 className="display-heading text-ink-900 text-4xl md:text-5xl lg:text-[56px] mt-4">
              {t("titlePre")}{" "}
              <span className="text-green-600">{t("titleAccent")}</span>
            </h2>
            <p className="text-[15px] md:text-base leading-relaxed text-ink-700 max-w-xl mt-5">
              {t("p1")}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/services" className="btn btn-dark">{t("ctaServices")}</Link>
              <Link href="/projects" className="btn btn-ghost">{t("ctaProjects")}</Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {stats.map((s) => (
              <div key={s.l} className="card p-6 md:p-7">
                <div className="font-display font-extrabold text-4xl md:text-5xl tracking-tight text-ink-900 leading-none">
                  {s.n}
                </div>
                <div className="text-[11px] uppercase tracking-[0.14em] font-bold text-ink-500 mt-3">
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
