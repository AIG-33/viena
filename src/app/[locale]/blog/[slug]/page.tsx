import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  getAllBlogPosts,
  getBlogPostBySlug,
  getCategoryById,
  getRelatedBlogPosts,
} from "@/lib/data";
import { JsonLd } from "@/components/seo/JsonLd";
import { BlogBody } from "@/components/blog/BlogBody";
import {
  buildAlternates,
  buildBlogPostingJsonLd,
  buildBreadcrumbJsonLd,
  localePath,
} from "@/lib/seo";
import { routing } from "@/i18n/routing";
import type { Locale } from "@/i18n/routing";

interface BlogPostPageProps {
  params: Promise<{ locale: Locale; slug: string }>;
}

export function generateStaticParams() {
  const posts = getAllBlogPosts();
  const params: { locale: Locale; slug: string }[] = [];
  for (const locale of routing.locales) {
    for (const post of posts) {
      params.push({ locale: locale as Locale, slug: post.slug });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.excerpt,
    keywords: post.keywords?.length ? post.keywords : post.tags,
    alternates: buildAlternates(locale, `/blog/${post.slug}`),
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author],
      tags: post.tags,
      images: post.image ? [{ url: post.image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const post = getBlogPostBySlug(slug);
  if (!post) notFound();

  const tNav = await getTranslations("nav");
  const category = post.categoryId
    ? getCategoryById(post.categoryId, locale)
    : undefined;
  const related = getRelatedBlogPosts(post, 3);

  const articleJsonLd = buildBlogPostingJsonLd({ post, locale });
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: tNav("home"), url: localePath(locale, "/") },
    {
      name: locale === "ru" ? "Блог" : "Blog",
      url: localePath(locale, "/blog"),
    },
    { name: post.title, url: localePath(locale, `/blog/${post.slug}`) },
  ]);

  return (
    <>
      <JsonLd data={[articleJsonLd, breadcrumbJsonLd]} />

      <article>
        <header className="bg-paper-100 pt-10 md:pt-16 pb-10 md:pb-14 border-b border-paper-200">
          <div className="max-w-[820px] mx-auto px-4 md:px-10 lg:px-14">
            <nav className="flex items-center gap-2 text-[12px] text-ink-500 mb-6 flex-wrap">
              <Link href="/" className="hover:text-green-700 transition-colors">
                {tNav("home")}
              </Link>
              <span>/</span>
              <Link
                href="/blog"
                className="hover:text-green-700 transition-colors"
              >
                {locale === "ru" ? "Блог" : "Blog"}
              </Link>
              <span>/</span>
              <span className="text-ink-900 font-medium truncate">
                {post.title}
              </span>
            </nav>

            <div className="flex flex-wrap gap-2 mb-5">
              {post.tags.map((tag) => (
                <span key={tag} className="pill">
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="display-heading text-ink-900 text-3xl md:text-4xl lg:text-[44px] leading-tight">
              {post.title}
            </h1>

            <p className="text-[16px] md:text-[17px] leading-relaxed text-ink-600 mt-5">
              {post.excerpt}
            </p>

            <div className="flex items-center flex-wrap gap-3 mt-6 text-[13px] text-ink-500">
              <span className="font-medium text-ink-700">{post.author}</span>
              <span>·</span>
              <time dateTime={post.publishedAt}>
                {new Date(post.publishedAt).toLocaleDateString(
                  locale === "ru" ? "ru-RU" : locale === "en" ? "en-US" : "zh-CN",
                  { year: "numeric", month: "long", day: "numeric" }
                )}
              </time>
              {post.updatedAt && post.updatedAt !== post.publishedAt && (
                <>
                  <span>·</span>
                  <span>
                    {locale === "ru" ? "обновлено" : "updated"}{" "}
                    {new Date(post.updatedAt).toLocaleDateString(
                      locale === "ru" ? "ru-RU" : "en-US",
                      { year: "numeric", month: "short", day: "numeric" }
                    )}
                  </span>
                </>
              )}
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
        </header>

        {post.image && (
          <div className="bg-white">
            <div className="max-w-[1100px] mx-auto px-4 md:px-10 lg:px-14 -mt-6 md:-mt-10">
              <div className="relative aspect-[21/9] rounded-2xl overflow-hidden bg-paper-100 shadow-lg ring-1 ring-paper-200">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  priority
                  sizes="(min-width: 1024px) 1100px, 100vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        )}

        <section className="bg-white py-12 md:py-16">
          <div className="max-w-[820px] mx-auto px-4 md:px-10 lg:px-14">
            <BlogBody blocks={post.body} />

            {category && (
              <div className="mt-14 p-6 md:p-8 bg-paper-50 border border-paper-200 rounded-xl">
                <p className="text-[13px] text-ink-500 mb-2">
                  {locale === "ru"
                    ? "По теме статьи в каталоге"
                    : "Related catalog section"}
                </p>
                <Link
                  href={`/catalog/${category.id}`}
                  className="font-display text-ink-900 text-xl hover:text-green-700 transition-colors"
                >
                  {category.name} →
                </Link>
                <p className="text-[14px] text-ink-600 mt-1">
                  {category.description}
                </p>
              </div>
            )}

            {post.references && post.references.length > 0 && (
              <div className="mt-14">
                <h2 className="display-heading text-ink-900 text-xl md:text-2xl mb-4 border-b border-paper-200 pb-3">
                  {locale === "ru" ? "Источники" : "References"}
                </h2>
                <ol className="list-decimal pl-5 space-y-2 text-[14px] text-ink-700 marker:text-ink-400">
                  {post.references.map((ref, idx) => (
                    <li key={idx}>
                      <a
                        href={ref.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-700 underline decoration-green-300 underline-offset-2 hover:decoration-green-700 transition-colors"
                      >
                        {ref.title}
                      </a>
                      {ref.publisher && (
                        <span className="text-ink-500"> — {ref.publisher}</span>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </section>

        {related.length > 0 && (
          <section className="bg-paper-50 border-t border-paper-200 py-14 md:py-20">
            <div className="max-w-[1320px] mx-auto px-4 md:px-10 lg:px-14">
              <h2 className="display-heading text-ink-900 text-2xl md:text-3xl mb-8">
                {locale === "ru" ? "Читать дальше" : "Read next"}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {related.map((p) => (
                  <Link
                    key={p.id}
                    href={`/blog/${p.slug}`}
                    className="group bg-white border border-paper-200 rounded-xl p-5 md:p-6 hover:border-green-400 hover:shadow-md transition-all"
                  >
                    <div className="flex flex-wrap gap-2 mb-3">
                      {p.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="pill text-[11px]">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h3 className="font-display text-ink-900 text-base md:text-lg leading-snug group-hover:text-green-700 transition-colors">
                      {p.title}
                    </h3>
                    <p className="text-[13px] text-ink-500 mt-2 line-clamp-2">
                      {p.excerpt}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </article>
    </>
  );
}
