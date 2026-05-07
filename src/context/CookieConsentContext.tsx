"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "viena-cookie-consent";
const CONSENT_VERSION = 1;

export type StoredConsent = {
  v: number;
  analytics: boolean;
  decidedAt: string;
};

type CookieConsentContextValue = {
  ready: boolean;
  showBanner: boolean;
  analyticsAllowed: boolean;
  acceptAll: () => void;
  necessaryOnly: () => void;
  revokeAnalytics: () => void;
};

const CookieConsentContext = createContext<CookieConsentContextValue | null>(
  null
);

export function CookieConsentProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [consent, setConsent] = useState<StoredConsent | null | undefined>(
    undefined
  );

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setConsent(null);
        return;
      }
      const parsed = JSON.parse(raw) as StoredConsent;
      if (parsed.v !== CONSENT_VERSION) {
        setConsent(null);
        return;
      }
      setConsent(parsed);
    } catch {
      setConsent(null);
    }
  }, []);

  const persist = useCallback((analytics: boolean) => {
    const next: StoredConsent = {
      v: CONSENT_VERSION,
      analytics,
      decidedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setConsent(next);
  }, []);

  const revokeAnalytics = useCallback(() => {
    const next: StoredConsent = {
      v: CONSENT_VERSION,
      analytics: false,
      decidedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setConsent(next);
  }, []);

  const value = useMemo(
    (): CookieConsentContextValue => ({
      ready: consent !== undefined,
      showBanner: consent === null,
      analyticsAllowed:
        consent !== null &&
        consent !== undefined &&
        consent.analytics === true,
      acceptAll: () => persist(true),
      necessaryOnly: () => persist(false),
      revokeAnalytics,
    }),
    [consent, persist, revokeAnalytics]
  );

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  const ctx = useContext(CookieConsentContext);
  if (!ctx) {
    throw new Error("useCookieConsent must be used within CookieConsentProvider");
  }
  return ctx;
}
