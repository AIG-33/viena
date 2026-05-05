import { getTranslations } from "next-intl/server";
import { SHOP_URL } from "@/lib/utils";

export async function ShopHighlight() {
  const t = await getTranslations("home.shopHighlight");
  const features = [t("feature1"), t("feature2"), t("feature3")];

  return (
    <section className="relative bg-white py-12 md:py-16">
      <div className="max-w-[1320px] mx-auto px-4 md:px-10 lg:px-14">
        <a
          href={SHOP_URL}
          target="_blank"
          rel="noreferrer noopener"
          aria-label={`${t("title")} ${t("titleAccent")} — shop.viena.by`}
          className="group relative block overflow-hidden rounded-[28px] bg-ink-950 text-white shadow-[0_30px_70px_-30px_rgba(15,17,19,0.55)] ring-1 ring-ink-900/30"
        >
          {/* Decorative gradient backdrop */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-90"
            style={{
              background:
                "radial-gradient(60% 80% at 85% 0%, rgba(34,197,142,0.45) 0%, rgba(15,17,19,0) 60%), radial-gradient(40% 60% at 0% 100%, rgba(34,197,142,0.22) 0%, rgba(15,17,19,0) 70%), linear-gradient(135deg, #0f1113 0%, #1b1e21 60%, #0a6b4d 100%)",
            }}
          />

          {/* Subtle dot grid */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.18] mix-blend-screen"
            style={{
              backgroundImage:
                "radial-gradient(rgba(255,255,255,0.5) 1px, transparent 1px)",
              backgroundSize: "22px 22px",
            }}
          />

          <div className="relative grid lg:grid-cols-[1.4fr_1fr] gap-8 lg:gap-12 px-6 md:px-10 lg:px-14 py-10 md:py-14">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500 text-ink-900 text-[11px] font-display font-bold tracking-wide uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-ink-900" />
                  {t("badge")}
                </span>
                <span className="font-mono text-[11px] tracking-[0.18em] uppercase text-white/70">
                  {t("eyebrow")}
                </span>
              </div>

              <h2 className="font-display font-bold tracking-tight leading-[1.02] mt-5 text-[34px] md:text-[44px] lg:text-[52px]">
                {t("title")}{" "}
                <span className="bg-gradient-to-r from-green-300 via-green-400 to-green-200 bg-clip-text text-transparent">
                  {t("titleAccent")}
                </span>
              </h2>

              <p className="mt-5 max-w-2xl text-[14.5px] md:text-[15.5px] leading-relaxed text-white/75">
                {t("description")}
              </p>

              <ul className="mt-6 grid sm:grid-cols-2 gap-y-2.5 gap-x-6 max-w-2xl">
                {features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2.5 text-[13.5px] text-white/85"
                  >
                    <span className="mt-[3px] inline-flex w-4 h-4 shrink-0 rounded-full bg-green-500/15 text-green-300 items-center justify-center">
                      <svg
                        viewBox="0 0 24 24"
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.6}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden
                      >
                        <path d="M5 12l5 5 9-11" />
                      </svg>
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-7 flex flex-wrap items-center gap-4">
                <span className="inline-flex items-center gap-2.5 pl-2 pr-5 py-2 rounded-full bg-green-500 text-ink-900 font-display font-bold tracking-tight text-[14.5px] group-hover:bg-green-400 transition-colors">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-ink-900 text-green-400">
                    <svg
                      viewBox="0 0 24 24"
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <path d="M3 7h18l-2 11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L3 7z" />
                      <path d="M8 7V5a4 4 0 1 1 8 0v2" />
                    </svg>
                  </span>
                  {t("cta")}
                  <svg
                    viewBox="0 0 24 24"
                    className="w-4 h-4 -mr-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="M7 17 17 7M9 7h8v8" />
                  </svg>
                </span>
                <span className="text-[12.5px] text-white/55">{t("ctaHint")}</span>
              </div>
            </div>

            {/* Right side decorative card */}
            <div className="relative hidden lg:flex items-center justify-end">
              <div
                aria-hidden
                className="absolute -right-6 -top-6 w-72 h-72 rounded-full blur-3xl"
                style={{
                  background:
                    "radial-gradient(circle, rgba(34,197,142,0.55) 0%, rgba(15,17,19,0) 70%)",
                }}
              />
              <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.6)]">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-400/80" />
                    <span className="w-2 h-2 rounded-full bg-yellow-300/70" />
                    <span className="w-2 h-2 rounded-full bg-green-400/80" />
                  </div>
                  <div className="font-mono text-[10px] tracking-[0.16em] uppercase text-white/55">
                    https://shop.viena.by
                  </div>
                </div>

                <div className="mt-5 space-y-2.5">
                  {[
                    "PCR Master Mix · 2x · 1 ml",
                    "Taq DNA Polymerase · 500 U",
                    "DNA Ladder 100 bp · 50 lanes",
                    "Agarose · molecular grade · 250 g",
                  ].map((line) => (
                    <div
                      key={line}
                      className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg bg-white/5 border border-white/10"
                    >
                      <span className="text-[12.5px] text-white/85 truncate">
                        {line}
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-wide text-green-300">
                        in stock
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex items-center justify-between text-[11px] text-white/55 font-mono uppercase tracking-[0.14em]">
                  <span>shop.viena.by</span>
                  <span>↗ open</span>
                </div>
              </div>
            </div>
          </div>
        </a>
      </div>
    </section>
  );
}
