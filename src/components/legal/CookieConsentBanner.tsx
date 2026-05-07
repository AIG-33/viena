"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCookieConsent } from "@/context/CookieConsentContext";
import { Button } from "@/components/ui/Button";

export function CookieConsentBanner() {
  const t = useTranslations("cookieConsent");
  const { ready, showBanner, acceptAll, necessaryOnly } = useCookieConsent();

  if (!ready || !showBanner) {
    return null;
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[200] p-4 md:p-5 pointer-events-none"
      role="dialog"
      aria-modal="true"
      aria-label={t("title")}
    >
      <div
        className="pointer-events-auto max-w-[1100px] mx-auto rounded-lg border border-paper-200 bg-paper-0/95 backdrop-blur-md shadow-[0_-4px_24px_rgba(0,0,0,0.08)] px-4 py-4 md:px-6 md:py-5"
      >
        <p className="text-[13px] md:text-[14px] leading-relaxed text-ink-800 mb-4">
          {t("description")}
        </p>
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 text-[12px] md:text-[13px]">
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-ink-600">
            <Link href="/privacy" className="font-semibold text-green-700 hover:text-green-600 underline-offset-2 hover:underline">
              {t("privacyLink")}
            </Link>
            <span className="text-ink-400" aria-hidden>
              ·
            </span>
            <Link href="/cookies" className="font-semibold text-green-700 hover:text-green-600 underline-offset-2 hover:underline">
              {t("cookiesLink")}
            </Link>
          </div>
          <div className="flex flex-wrap gap-2 sm:ml-auto">
            <Button type="button" variant="ghost" size="sm" onClick={necessaryOnly}>
              {t("necessaryOnly")}
            </Button>
            <Button type="button" variant="primary" size="sm" onClick={acceptAll}>
              {t("accept")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
