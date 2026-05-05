import { getTranslations } from "next-intl/server";

const LAT = 53.902419;
const LON = 27.639955;
const ZOOM = 17;

const PIN_COLOR = "pm2rdm";

const widgetUrl = (() => {
  const params = new URLSearchParams({
    ll: `${LON},${LAT}`,
    pt: `${LON},${LAT},${PIN_COLOR}`,
    z: String(ZOOM),
    l: "map",
  });
  return `https://yandex.ru/map-widget/v1/?${params.toString()}`;
})();

const externalUrl = (() => {
  const params = new URLSearchParams({
    ll: `${LON},${LAT}`,
    pt: `${LON},${LAT},${PIN_COLOR}`,
    z: String(ZOOM),
    l: "map",
    text: "Минск, улица Радиальная, 54Б",
  });
  return `https://yandex.ru/maps/?${params.toString()}`;
})();

export async function YandexMap() {
  const t = await getTranslations("contacts.map");

  return (
    <section className="bg-white pb-12 md:pb-20">
      <div className="max-w-[1320px] mx-auto px-4 md:px-10 lg:px-14">
        <div className="flex items-end justify-between gap-4 mb-5 md:mb-6">
          <div>
            <div className="text-[11px] uppercase tracking-[0.18em] font-bold text-ink-500">
              {t("eyebrow")}
            </div>
            <h2 className="font-display font-bold text-[26px] md:text-[34px] leading-[1.05] tracking-tight text-ink-900 mt-1.5">
              {t("title")} <span className="text-grad-green">{t("titleAccent")}</span>
            </h2>
          </div>
          <a
            href={externalUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="hidden sm:inline-flex items-center gap-1.5 text-[13px] font-semibold text-green-700 hover:text-green-600"
          >
            {t("openInYandex")}
            <svg viewBox="0 0 24 24" className="icon w-4 h-4">
              <path d="M7 17 17 7M9 7h8v8" />
            </svg>
          </a>
        </div>

        <div className="relative rounded-[20px] overflow-hidden ring-1 ring-paper-200 bg-paper-100 shadow-[0_24px_60px_-30px_rgba(15,17,19,0.18)]">
          <iframe
            src={widgetUrl}
            title={t("iframeTitle")}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-[360px] md:h-[480px] block border-0"
            allow="fullscreen"
          />

          <div className="pointer-events-none absolute left-4 top-4 sm:left-5 sm:top-5">
            <div className="pointer-events-auto inline-flex items-start gap-3 rounded-2xl bg-white/95 backdrop-blur-sm ring-1 ring-paper-200 shadow-[0_10px_30px_-12px_rgba(15,17,19,0.25)] px-4 py-3 max-w-[280px]">
              <div className="w-8 h-8 rounded-lg bg-green-50 text-green-700 grid place-items-center shrink-0">
                <svg viewBox="0 0 24 24" className="icon w-4 h-4">
                  <path d="M12 22s7-7 7-13a7 7 0 1 0-14 0c0 6 7 13 7 13zM12 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
                </svg>
              </div>
              <div className="min-w-0">
                <div className="text-[11px] uppercase tracking-[0.12em] font-bold text-ink-500">
                  {t("badge")}
                </div>
                <div className="text-[13.5px] font-bold text-ink-900 leading-snug mt-0.5">
                  {t("addressLine1")}
                </div>
                <div className="text-[12.5px] text-ink-600 leading-snug">
                  {t("addressLine2")}
                </div>
              </div>
            </div>
          </div>
        </div>

        <a
          href={externalUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="sm:hidden mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-green-700 hover:text-green-600"
        >
          {t("openInYandex")}
          <svg viewBox="0 0 24 24" className="icon w-4 h-4">
            <path d="M7 17 17 7M9 7h8v8" />
          </svg>
        </a>
      </div>
    </section>
  );
}
