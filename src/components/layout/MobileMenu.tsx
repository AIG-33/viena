"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useParams } from "next/navigation";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { useCart } from "@/context/CartContext";

const NAV_LINKS = [
  { href: "/about", key: "about" },
  { href: "/catalog", key: "catalog" },
  { href: "/manufacturers", key: "manufacturers" },
  { href: "/services", key: "services" },
  { href: "/projects", key: "projects" },
  { href: "/projects/moh", key: "mohLong" },
  { href: "/contacts", key: "contacts" },
] as const;

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const LOCALE_NATIVE: Record<Locale, string> = {
  ru: "Русский",
  en: "English",
  zh: "中文",
};

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const t = useTranslations("nav");
  const tHeader = useTranslations("header");
  const tCommon = useTranslations("common");
  const tFooter = useTranslations("footer");
  const tLang = useTranslations("languageSwitcher");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const { count, isHydrated } = useCart();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  function selectLocale(next: Locale) {
    if (next === locale) return;
    router.replace(
      // @ts-expect-error -- runtime accepts string path
      { pathname, params },
      { locale: next }
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-ink-900/30 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.nav
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className="fixed right-0 top-0 h-full w-[88vw] max-w-sm bg-white z-50 flex flex-col pt-8 px-6 shadow-[var(--shadow-3)]"
          >
            <div className="flex justify-between items-center mb-8">
              <span className="eyebrow"><span className="dot" />{t("menu")}</span>
              <button
                onClick={onClose}
                aria-label={t("closeMenu")}
                className="w-9 h-9 rounded-full border border-paper-200 grid place-items-center hover:border-ink-900"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            <div className="flex flex-col">
              {NAV_LINKS.map((link, i) => {
                const matches =
                  pathname === link.href ||
                  pathname.startsWith(link.href + "/");
                const longerMatch = NAV_LINKS.some(
                  (l) =>
                    l.href !== link.href &&
                    l.href.length > link.href.length &&
                    (pathname === l.href || pathname.startsWith(l.href + "/"))
                );
                const active = matches && !longerMatch;
                return (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 + 0.08 }}
                    className="border-b border-paper-200"
                  >
                    <Link
                      href={link.href}
                      className={`flex items-center gap-3 py-4 text-xl font-display font-bold transition-colors ${
                        active ? "text-ink-900" : "text-ink-700 hover:text-ink-900"
                      }`}
                    >
                      {active && <span className="w-1.5 h-1.5 rounded-full bg-green-500" />}
                      <span>{t(link.key)}</span>
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {/* Language switcher */}
            <div className="mt-6">
              <div className="text-[11px] tracking-[0.16em] uppercase font-bold text-ink-500 mb-3">
                {tLang("label")}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {routing.locales.map((l) => {
                  const isActive = l === locale;
                  return (
                    <button
                      key={l}
                      onClick={() => selectLocale(l as Locale)}
                      className={`px-3 py-2.5 rounded-xl text-[12px] font-display font-bold transition-colors ${
                        isActive
                          ? "bg-green-100 text-green-700 ring-1 ring-green-200"
                          : "bg-paper-50 text-ink-700 hover:bg-paper-100 border border-paper-200"
                      }`}
                    >
                      {LOCALE_NATIVE[l as Locale]}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-auto pb-8">
              <Link
                href="/contacts#cart"
                className="btn btn-green w-full"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M3 4h2l2 12h12l2-9H6" />
                  <circle cx="9" cy="20" r="1" />
                  <circle cx="18" cy="20" r="1" />
                </svg>
                <span>{tHeader("cart")}</span>
                {isHydrated && count > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 rounded-full bg-white text-green-700 text-[11px] font-mono font-semibold">
                    {count}
                  </span>
                )}
              </Link>
              <Link
                href="/contacts"
                className="btn btn-ghost w-full mt-2"
              >
                {tHeader("getQuote")}
              </Link>
              <div className="mt-6 text-[13px] text-ink-600 space-y-1">
                <p className="font-medium text-ink-900">{tCommon("phone")}</p>
                <p>{tCommon("schedule")}</p>
                <p>{tCommon("addressShort")}</p>
              </div>
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
}
