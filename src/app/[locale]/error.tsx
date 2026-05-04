"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errors.general");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6 bg-paper-100">
      <div className="card max-w-md w-full p-10 text-center">
        <div className="font-display font-extrabold text-7xl text-ink-900 leading-none">500</div>
        <h1 className="display-heading text-ink-900 text-2xl mt-4">{t("title")}</h1>
        <p className="text-ink-600 text-[14px] mt-3">{t("description")}</p>
        <button onClick={reset} className="btn btn-green mt-6">
          ↻ {t("retry")}
        </button>
      </div>
    </div>
  );
}
