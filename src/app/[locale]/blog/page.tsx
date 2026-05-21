import type { Metadata } from "next";
import Image from "next/image";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getAllBlogPosts } from "@/lib/data";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  buildAlternates,
  buildBlogJsonLd,
  buildBreadcrumbJsonLd,
  localePath,
} from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

const POSTS_LOCALE_BANNER: Record<Locale, string | null> = {
  ru: null,
  en: "Blog articles are currently published in Russian only — English versions are in progress.",
  zh: "博客文章目前仅以俄文发布,英文版正在筹备中。",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isRu = locale === "ru";
  return {
    title: isRu
      ? "Блог — преаналитика, ISO 6710, гистология, ПЦР"
      : "Blog — preanalytics, ISO 6710, histology, PCR",
    description: isRu
      ? "Экспертные материалы ВИЕНА МЕДИКАЛ: международные стандарты лабораторной диагностики (ISO 6710, ISO 11137, CLSI, WHO), реальные кейсы из практики белорусских КДЛ."
      : "Expert articles by VIENA MEDICAL: international laboratory standards (ISO 6710, ISO 11137, CLSI, WHO) and real-world cases from Belarusian clinical labs.",
    keywords: isRu
      ? [
          "блог о преаналитике",
          "ISO 6710",
          "CLSI GP41",
          "WHO phlebotomy",
          "статьи о вакуумных пробирках",
          "гистология статьи",
          "real-time PCR обзор",
        ]
      : undefined,
    alternates: buildAlternates(locale, "/blog"),
  };
}

export default async function BlogIndexPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tNav = await getTranslations("nav");

  const posts = getAllBlogPosts();
  const blogJsonLd = buildBlogJsonLd({ posts, locale });
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: tNav("home"), url: localePath(locale, "/") },
    { name: locale === "ru" ? "Блог" : "Blog", url: localePath(locale, "/blog") },
  ]);

  const banner = POSTS_LOCALE_BANNER[locale];

  return (
    <>
      <JsonLd data={[blogJsonLd, breadcrumbJsonLd]} />

      <section className="bg-paper-100 pt-10 md:pt-16 pb-10 md:pb-14 border-b border-paper-200">
        <div className="max-w-[1320px] mx-auto px-4 md:px-10 lg:px-14">
          <nav className="flex items-center gap-2 text-[12px] text-ink-500 mb-6">
            <Link href="/" className="hover:text-green-700 transition-colors">
              {tNav("home")}
            </Link>
            <span>/</span>
            <span className="text-ink-900 font-medium">
              {locale === "ru" ? "Блог" : "Blog"}
            </span>
          </nav>

          <span className="eyebrow">
            <span className="dot" />
            {locale === "ru"
              ? `${posts.length} статьи · экспертный контент`
              : `${posts.length} articles · expert content`}
          </span>
          <h1 className="display-heading text-ink-900 text-4xl md:text-5xl lg:text-6xl mt-4">
            {locale === "ru"
              ? "Блог о лабораторной диагностике"
              : locale === "en"
                ? "Laboratory diagnostics blog"
                : "实验室诊断博客"}
          </h1>
          <p className="text-[15px] md:text-[16px] text-ink-600 max-w-2xl mt-3 leading-relaxed">
            {locale === "ru"
              ? "Разборы стандартов ISO, CLSI и WHO, чек-листы для лабораторий, преаналитика, патоморфология, ПЦР. Каждая статья — со ссылками на первоисточники: международные документы, рецензируемые публикации, гайдлайны регуляторов."
              : "International standards (ISO, CLSI, WHO) breakdowns, lab checklists, preanalytics, pathology, PCR. Every article cites primary sources: international documents, peer-reviewed publications, regulator guidelines."}
          </p>
          {banner && (
            <p className="text-[13px] text-ink-500 mt-3 italic">{banner}</p>
          )}
        </div>
      </section>

      <section className="bg-white py-14 md:py-20">
        <div className="max-w-[1320px] mx-auto px-4 md:px-10 lg:px-14">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group flex flex-col bg-white border border-paper-200 rounded-xl overflow-hidden hover:border-green-400 hover:shadow-lg transition-all duration-200"
              >
                {post.image && (
                  <div className="relative aspect-[16/10] bg-paper-100 overflow-hidden">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                <div className="p-5 md:p-6 flex flex-col flex-1">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {post.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="pill text-[11px]">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h2 className="font-display text-ink-900 text-lg md:text-xl leading-snug mb-2 group-hover:text-green-700 transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-[14px] leading-relaxed text-ink-600 line-clamp-3 flex-1">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-3 mt-4 pt-4 border-t border-paper-200 text-[12px] text-ink-500">
                    <time dateTime={post.publishedAt}>
                      {new Date(post.publishedAt).toLocaleDateString(
                        locale === "ru" ? "ru-RU" : locale === "en" ? "en-US" : "zh-CN",
                        { year: "numeric", month: "long", day: "numeric" }
                      )}
                    </time>
                    <span>·</span>
                    <span>
                      {post.readingMinutes}{" "}
                      {locale === "ru"
                        ? "мин чтения"
                        : locale === "en"
                          ? "min read"
                          : "分钟"}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
