import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations("errors.notFound");
  const tNav = await getTranslations("nav");
  const tErr = await getTranslations("errors.general");

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6 bg-paper-100">
      <div className="card max-w-md w-full p-10 text-center">
        <div className="font-display font-extrabold text-7xl text-ink-900 leading-none">404</div>
        <h1 className="display-heading text-ink-900 text-2xl mt-4">{t("title")}</h1>
        <p className="text-ink-600 text-[14px] mt-3">{t("description")}</p>
        <div className="flex gap-3 justify-center flex-wrap mt-6">
          <Link href="/" className="btn btn-dark">{tErr("home")}</Link>
          <Link href="/catalog" className="btn btn-green">{tNav("catalog")} →</Link>
        </div>
      </div>
    </div>
  );
}
