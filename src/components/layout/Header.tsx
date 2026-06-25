"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { MobileMenu } from "./MobileMenu";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useCart } from "@/context/CartContext";

const NAV_LINKS = [
  { href: "/about", key: "about" },
  { href: "/catalog", key: "catalog" },
  { href: "/services", key: "services" },
  { href: "/manufacturers", key: "manufacturers" },
  { href: "/projects", key: "projects" },
  { href: "/blog", key: "blog" },
  { href: "/contacts", key: "contacts" },
] as const;

export function Header() {
  const t = useTranslations("nav");
  const tHeader = useTranslations("header");
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { count, isHydrated } = useCart();
  const { scrollY } = useScroll();

  const borderOpacity = useTransform(scrollY, [0, 60], [0, 1]);
  const shadowOpacity = useTransform(scrollY, [0, 60], [0, 1]);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  // Pick the longest matching href so /projects/moh activates "МЗ РБ", not "Проекты".
  const activeHref = NAV_LINKS.map((l) => l.href as string)
    .filter((href) => pathname === href || pathname.startsWith(href + "/"))
    .sort((a, b) => b.length - a.length)[0];

  const isActive = (href: string) => href === activeHref;
  const activeLink = NAV_LINKS.find((l) => l.href === activeHref);
  const pillHref = hoveredHref ?? activeLink?.href ?? null;

  const goToCart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      if (pathname === "/contacts") {
        const el = document.getElementById("cart");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        router.push("/contacts#cart");
      }
    },
    [pathname, router]
  );

  return (
    <>
      <motion.header className="fixed top-0 left-0 right-0 z-30 bg-white">
        <motion.div
          aria-hidden
          className="absolute inset-0 bg-white"
          style={{
            boxShadow: "0 1px 0 rgba(48,48,64,0.08), 0 4px 14px rgba(48,48,64,0.04)",
            opacity: shadowOpacity,
          }}
        />
        <motion.div
          aria-hidden
          className="absolute bottom-0 left-0 right-0 h-px bg-paper-200"
          style={{ opacity: borderOpacity }}
        />

        <div className="relative max-w-[1440px] mx-auto px-4 md:px-10 lg:px-14 h-[72px] md:h-[88px] grid grid-cols-[auto_1fr_auto] items-center gap-4 md:gap-8">
          {/* Logo */}
          <Link
            href="/"
            aria-label={tHeader("phoneTooltip")}
            className="flex items-center shrink-0 group"
          >
            <Image
              src="/images/logo-dark.png"
              alt="VIENA MEDICAL"
              width={748}
              height={285}
              priority
              className="h-10 md:h-[54px] w-auto transition-opacity group-hover:opacity-80"
            />
          </Link>

          {/* Center nav — animated magic pill */}
          <nav
            className="hidden md:flex items-center justify-center gap-0.5 lg:gap-1"
            onMouseLeave={() => setHoveredHref(null)}
          >
            {NAV_LINKS.map((link) => {
              const showPill = link.href === pillHref;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  data-active={active ? "true" : "false"}
                  onMouseEnter={() => setHoveredHref(link.href)}
                  onFocus={() => setHoveredHref(link.href)}
                  className={`relative px-3 lg:px-3.5 py-2 rounded-full font-display font-bold tracking-tight text-[13px] lg:text-[14.5px] transition-colors duration-200 ${
                    showPill
                      ? "text-green-700"
                      : active
                      ? "text-ink-900"
                      : "text-ink-600 hover:text-ink-900"
                  }`}
                >
                  {showPill && (
                    <motion.span
                      layoutId="nav-pill"
                      aria-hidden
                      className="absolute inset-0 rounded-full bg-green-100/85 ring-1 ring-inset ring-green-200/80"
                      style={{
                        boxShadow:
                          "0 6px 18px -6px rgba(34,197,142,0.4), inset 0 1px 0 rgba(255,255,255,0.6)",
                      }}
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className="relative">{t(link.key)}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-2 lg:gap-3 shrink-0 justify-self-end">
            <LanguageSwitcher />
            <a
              href="/contacts#cart"
              onClick={goToCart}
              aria-label={tHeader("cart")}
              className="relative inline-flex items-center gap-2 px-3 py-2 rounded-full border border-paper-200 text-ink-700 hover:text-ink-900 hover:border-ink-900 text-[13px] font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M3 4h2l2 12h12l2-9H6" />
                <circle cx="9" cy="20" r="1" />
                <circle cx="18" cy="20" r="1" />
              </svg>
              <span className="hidden lg:inline">{tHeader("cart")}</span>
              {isHydrated && count > 0 && (
                <span className="inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 rounded-full bg-green-500 text-white text-[10px] leading-none font-mono tabular-nums font-semibold">
                  {count}
                </span>
              )}
            </a>
            <a
              href="https://shop.viena.by/"
              target="_blank"
              rel="noreferrer noopener"
              aria-label={`${tHeader("shop")} — shop.viena.by`}
              className="group inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-ink-900 text-white text-[13px] font-display font-bold tracking-tight hover:bg-ink-800 transition-colors shadow-[0_8px_22px_-10px_rgba(15,17,19,0.5)]"
            >
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-500 text-ink-900">
                <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M3 7h18l-2 11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L3 7z" />
                  <path d="M8 7V5a4 4 0 1 1 8 0v2" />
                </svg>
              </span>
              <span className="hidden xl:inline">{tHeader("shop")}</span>
              <span className="xl:hidden">{tHeader("shopShort")}</span>
              <svg viewBox="0 0 24 24" className="w-3 h-3 -mr-0.5 opacity-70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M7 17 17 7M9 7h8v8" />
              </svg>
            </a>
          </div>

          {/* Mobile right cluster */}
          <div className="md:hidden flex items-center gap-2 justify-self-end">
            <a
              href="/contacts#cart"
              onClick={goToCart}
              aria-label={tHeader("cart")}
              className="relative inline-flex items-center justify-center w-10 h-10 rounded-full border border-paper-200 text-ink-700"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M3 4h2l2 12h12l2-9H6" />
                <circle cx="9" cy="20" r="1" />
                <circle cx="18" cy="20" r="1" />
              </svg>
              {isHydrated && count > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-green-500 text-white text-[10px] font-mono font-semibold">
                  {count}
                </span>
              )}
            </a>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex flex-col gap-1.5 w-10 h-10 items-center justify-center rounded-full border border-paper-200 hover:border-ink-900 transition-colors"
              aria-label={menuOpen ? t("closeMenu") : t("openMenu")}
            >
              <motion.span
                animate={menuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                className="block w-4 h-[1.5px] bg-ink-900 origin-center"
              />
              <motion.span
                animate={menuOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
                className="block w-4 h-[1.5px] bg-ink-900 origin-center"
              />
              <motion.span
                animate={menuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
                className="block w-4 h-[1.5px] bg-ink-900 origin-center"
              />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Spacer to compensate for fixed header */}
      <div aria-hidden className="h-[72px] md:h-[88px]" />

      <MobileMenu isOpen={menuOpen} onClose={closeMenu} />
    </>
  );
}
