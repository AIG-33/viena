import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

const PILLAR_ICONS: Record<string, string> = {
  vacuum: "M12 3l6 10a6 6 0 1 1-12 0l6-10z",
  sterile:
    "M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4",
  cap: "M5 7h14v3a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V7zM7 13v8h10v-8M5 7l1-3h12l1 3",
  components:
    "M9 7l-4 4 4 4M15 7l4 4-4 4M14 5l-4 14",
};

type PillarKey = "vacuum" | "sterile" | "cap" | "components";
const PILLAR_KEYS: PillarKey[] = ["vacuum", "sterile", "cap", "components"];

export async function PreanalyticsSection() {
  const t = await getTranslations("home.preanalytics");

  const stats = [
    {
      value: t("stat1Value"),
      label: t("stat1Label"),
      note: t("stat1Note"),
    },
    {
      value: t("stat2Value"),
      label: t("stat2Label"),
      note: t("stat2Note"),
    },
    {
      value: t("stat3Value"),
      label: t("stat3Label"),
      note: t("stat3Note"),
    },
    {
      value: t("stat4Value"),
      label: t("stat4Label"),
      note: t("stat4Note"),
    },
  ];

  return (
    <section className="relative bg-paper-50 py-16 md:py-24 overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-32 h-[420px] w-[420px] rounded-full blur-[100px]"
        style={{
          background:
            "radial-gradient(circle, rgba(34,197,142,0.18) 0%, rgba(255,255,255,0) 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -left-32 h-[420px] w-[420px] rounded-full blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, rgba(34,197,142,0.10) 0%, rgba(255,255,255,0) 70%)",
        }}
      />

      <div className="relative max-w-[1320px] mx-auto px-4 md:px-10 lg:px-14">
        <div className="grid lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-16 items-end">
          <div>
            <span className="eyebrow">
              <span className="pill pill-green">{t("eyebrowPill")}</span>
              {t("eyebrowText")}
            </span>
            <h2 className="display-heading text-[30px] md:text-[46px] text-ink-900 mt-4 leading-[1.04] tracking-tight">
              {t("title")}{" "}
              <span className="serif-accent text-green-700">
                {t("titleAccent")}
              </span>
            </h2>
            <p className="mt-5 text-[15px] md:text-[16px] leading-relaxed text-ink-700 max-w-2xl">
              {t("description")}
            </p>
          </div>

          <ul className="grid grid-cols-2 gap-3">
            {stats.map((s, i) => (
              <li
                key={i}
                className="rounded-2xl bg-white border border-paper-200 px-4 py-4 shadow-[0_8px_24px_-18px_rgba(15,17,19,0.18)]"
              >
                <div className="font-display text-[26px] md:text-[30px] font-extrabold leading-none tracking-tight text-ink-900">
                  {s.value}
                </div>
                <div className="text-[11px] uppercase tracking-[0.12em] font-bold text-green-700 mt-2">
                  {s.label}
                </div>
                <div className="font-mono text-[10px] tracking-[0.06em] text-ink-500 mt-1">
                  {s.note}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-12 md:mt-16">
          <div className="flex items-end justify-between gap-4 mb-6">
            <h3 className="font-display text-[20px] md:text-[24px] font-bold text-ink-900 tracking-tight">
              {t("pillarsTitle")}
            </h3>
            <span className="font-mono text-[11px] tracking-[0.16em] uppercase text-ink-500 hidden md:inline">
              {t("pillarsHint")}
            </span>
          </div>

          <ul className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {PILLAR_KEYS.map((key) => (
              <li
                key={key}
                className="card p-5 hover:border-green-300 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-green-50 text-green-700 grid place-items-center">
                  <svg viewBox="0 0 24 24" className="icon w-5 h-5">
                    <path d={PILLAR_ICONS[key]} />
                  </svg>
                </div>
                <div className="font-display font-bold text-[15px] md:text-[16px] text-ink-900 mt-4 leading-snug">
                  {t(`pillar_${key}_title`)}
                </div>
                <p className="text-[13px] text-ink-700 leading-relaxed mt-2">
                  {t(`pillar_${key}_text`)}
                </p>
                <div className="mt-3 inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-paper-100 text-[10px] font-mono tracking-wide uppercase text-ink-700">
                  {t(`pillar_${key}_ref`)}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link href="/projects/moh" className="btn btn-green">
            {t("ctaPrimary")}
          </Link>
          <Link
            href="/catalog/vacuum-systems"
            className="btn btn-ghost"
          >
            {t("ctaSecondary")}
          </Link>
          <span className="font-mono text-[11px] tracking-[0.14em] uppercase text-ink-500">
            {t("ctaHint")}
          </span>
        </div>
      </div>
    </section>
  );
}
