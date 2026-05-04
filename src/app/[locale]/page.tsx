import { setRequestLocale } from "next-intl/server";
import { getAllCategories, getAllProjects } from "@/lib/data";
import { HeroSection } from "@/components/home/HeroSection";
import { TrustBand } from "@/components/home/TrustBand";
import { AboutSection } from "@/components/home/AboutSection";
import { ContactFormSection } from "@/components/home/ContactFormSection";
import { ProjectsTeaser } from "@/components/home/ProjectsTeaser";
import type { Locale } from "@/i18n/routing";

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
      <TrustBand />
      <AboutSection />
      <ProjectsTeaser projects={projects} />
      <ContactFormSection />
    </>
  );
}
