import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import type { LegalDocument } from "@/content/legal/types";
import type { Locale } from "@/i18n/routing";
import { localePath } from "@/lib/seo";

export function LegalDocPage({
  locale,
  doc,
  breadcrumbLabel,
  navHome,
  contactsLabel,
  appendix,
}: {
  locale: Locale;
  doc: LegalDocument;
  breadcrumbLabel: string;
  navHome: string;
  contactsLabel: string;
  appendix?: ReactNode;
}) {
  return (
    <>
      <section className="bg-paper-100 pt-10 md:pt-16 pb-10 md:pb-14 border-b border-paper-200">
        <div className="max-w-[900px] mx-auto px-4 md:px-10 lg:px-14">
          <nav className="flex items-center gap-2 text-[12px] text-ink-500 mb-6">
            <Link href="/" className="hover:text-green-700 transition-colors">
              {navHome}
            </Link>
            <span aria-hidden>/</span>
            <span className="text-ink-700">{breadcrumbLabel}</span>
          </nav>
          <p className="text-[11px] tracking-[0.16em] uppercase font-bold text-ink-500 mb-3">
            {doc.heroEyebrow}
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-ink-950 mb-4">
            {doc.heroTitle}
          </h1>
          <p className="text-[13px] text-ink-600 leading-relaxed max-w-2xl mb-2">
            {doc.updatedNote}
          </p>
          {doc.jurisdictionNote ? (
            <p className="text-[13px] text-ink-600 leading-relaxed max-w-2xl border-l-2 border-green-600/40 pl-4 mt-4">
              {doc.jurisdictionNote}
            </p>
          ) : null}
        </div>
      </section>

      <article className="bg-white py-12 md:py-16">
        <div className="max-w-[900px] mx-auto px-4 md:px-10 lg:px-14 space-y-10">
          {doc.sections.map((section) => (
            <section key={section.title}>
              <h2 className="font-display text-xl md:text-2xl font-bold text-ink-950 mb-4">
                {section.title}
              </h2>
              <div className="space-y-3 text-[14px] md:text-[15px] leading-relaxed text-ink-800">
                {section.paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </article>

      {appendix ? (
        <div className="max-w-[900px] mx-auto px-4 md:px-10 lg:px-14 pb-12 -mt-4">
          {appendix}
        </div>
      ) : null}

      <section className="bg-paper-100 border-t border-paper-200 py-10">
        <div className="max-w-[900px] mx-auto px-4 md:px-10 lg:px-14">
          <p className="text-[12px] text-ink-500">
            <Link href="/" className="text-green-700 font-semibold hover:text-green-600">
              ← {navHome}
            </Link>
            <span className="mx-2">·</span>
            <Link
              href={localePath(locale, "/contacts")}
              className="text-green-700 font-semibold hover:text-green-600"
            >
              {contactsLabel}
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
