import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getAllCategories, getAllProjects } from "@/lib/data";
import { HeroSection } from "@/components/home/HeroSection";
import { ShopHighlight } from "@/components/home/ShopHighlight";
import { PreanalyticsSection } from "@/components/home/PreanalyticsSection";
import { TrustBand } from "@/components/home/TrustBand";
import { AboutSection } from "@/components/home/AboutSection";
import { ContactFormSection } from "@/components/home/ContactFormSection";
import { ProjectsTeaser } from "@/components/home/ProjectsTeaser";
import { buildAlternates } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  // The locale layout intentionally no longer sets `alternates`, so the
  // homepage has to declare its own canonical + hreflang map (otherwise
  // every locale variant of `/` would render with no canonical at all).
  return { alternates: buildAlternates(locale, "/") };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const categories = getAllCategories(locale);
  const projects = getAllProjects(locale);

  return (
    <>
      <HeroSection categories={categories} />
      <PreanalyticsSection />
      <ShopHighlight />
      <TrustBand />
      <AboutSection />
      <ProjectsTeaser projects={projects} />
      <ContactFormSection />
    </>
  );
}
