"use client";

import { useTranslations } from "next-intl";
import { useCookieConsent } from "@/context/CookieConsentContext";
import { Button } from "@/components/ui/Button";

/**
 * Shown on the cookie policy page: withdraw analytics consent and reload
 * so third-party tags are removed.
 */
export function CookieRevokePanel() {
  const t = useTranslations("cookieRevoke");
  const { ready, analyticsAllowed, revokeAnalytics } = useCookieConsent();

  if (!ready) {
    return null;
  }

  return (
    <div className="rounded-lg border border-paper-200 bg-paper-50 p-5 md:p-6">
      <h2 className="font-display text-lg font-bold text-ink-950 mb-2">
        {t("title")}
      </h2>
      <p className="text-[13px] md:text-[14px] text-ink-700 leading-relaxed mb-4">
        {t("description")}
      </p>
      {analyticsAllowed ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            revokeAnalytics();
            window.location.reload();
          }}
        >
          {t("button")}
        </Button>
      ) : (
        <p className="text-[13px] text-ink-600">{t("inactive")}</p>
      )}
    </div>
  );
}
