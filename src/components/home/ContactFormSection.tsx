"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import {
  buildContactSchema,
  SUBJECT_OPTIONS,
  type ContactFormData,
  type SubjectKey,
} from "@/lib/validations";

const ICONS = {
  phone:
    "M5 4h4l2 5-3 2a11 11 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z",
  email: "M3 6h18v12H3zM3 6l9 7 9-7",
  schedule: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 3",
  address: "M12 22s7-7 7-13a7 7 0 1 0-14 0c0 6 7 13 7 13zM12 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
};

export function ContactFormSection() {
  const t = useTranslations("home.contactSection");
  const tCommon = useTranslations("common");
  const tSubject = useTranslations("contacts.subjects");
  const tValidation = useTranslations("contacts.validation");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const schema = useMemo(
    () =>
      buildContactSchema({
        nameMin: tValidation("nameMin"),
        phoneMin: tValidation("phoneMin"),
        phoneFormat: tValidation("phoneFormat"),
        emailInvalid: tValidation("emailInvalid"),
        subjectRequired: tValidation("subjectRequired"),
        messageMin: tValidation("messageMin"),
      }),
    [tValidation]
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(schema),
    defaultValues: { subject: SUBJECT_OPTIONS[0] },
  });

  const onSubmit = async (data: ContactFormData) => {
    setStatus("loading");
    try {
      const payload = {
        ...data,
        subject: tSubject(data.subject as SubjectKey),
      };
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setStatus("success");
        reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  const inputClass =
    "w-full bg-white border border-paper-200 rounded-xl px-4 py-3.5 text-ink-900 text-[14px] placeholder:text-ink-400 focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition";
  const labelClass =
    "block text-[11px] uppercase tracking-[0.14em] font-bold text-ink-500 mb-1.5";

  const infoItems: { key: keyof typeof ICONS; value: string; href?: string }[] = [
    { key: "phone", value: tCommon("phone"), href: `tel:${tCommon("phone").replace(/\s/g, "")}` },
    { key: "email", value: tCommon("email"), href: `mailto:${tCommon("email")}` },
    { key: "schedule", value: tCommon("schedule") },
    { key: "address", value: tCommon("addressShort") },
  ];

  const guarantees = t.raw("form.guarantees") as string[];

  return (
    <section className="bg-paper-50 py-16 md:py-24">
      <div className="max-w-[1320px] mx-auto px-4 md:px-10 lg:px-14 grid lg:grid-cols-2 gap-10 items-start">
        <div>
          <span className="eyebrow"><span className="dot" />{t("eyebrow")}</span>
          <h2 className="display-heading text-ink-900 text-4xl md:text-5xl mt-4">
            {t("titlePre")}{" "}
            <span className="text-green-600">{t("titleAccent")}</span>
          </h2>
          <p className="text-[15px] md:text-base leading-relaxed text-ink-700 max-w-md mt-4">
            {t("subtitle")}
          </p>

          <div className="grid sm:grid-cols-2 gap-3 mt-7">
            {infoItems.map((item) => (
              <div key={item.key} className="card p-5">
                <div className="w-9 h-9 rounded-lg bg-green-50 text-green-700 grid place-items-center">
                  <svg viewBox="0 0 24 24" className="icon w-4 h-4">
                    <path d={ICONS[item.key]} />
                  </svg>
                </div>
                <div className="text-[11px] uppercase tracking-[0.12em] font-bold text-ink-500 mt-3">
                  {t(`infoLabels.${item.key}`)}
                </div>
                {item.href ? (
                  <a href={item.href} className="block mt-1 text-[15px] font-bold text-ink-900 hover:text-green-700 transition-colors">
                    {item.value}
                  </a>
                ) : (
                  <div className="mt-1 text-[15px] font-bold text-ink-900">{item.value}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6 md:p-8">
          <span className="eyebrow"><span className="pill">{t("card.eyebrow")}</span>{t("card.eyebrowText")}</span>
          <h3 className="display-heading text-ink-900 text-2xl md:text-3xl mt-3">
            {t("card.title1")}<br />{t("card.title2")}
          </h3>

          {status === "success" ? (
            <div className="py-10 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-100 text-green-700 mb-5">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h4 className="display-heading text-ink-900 text-xl mb-2">{t("form.successTitle")}</h4>
              <p className="text-ink-600 text-[14px] mb-5">
                {t("form.successText")}
              </p>
              <button
                onClick={() => setStatus("idle")}
                className="text-green-700 font-semibold text-sm hover:text-green-600"
              >
                {t("form.successAgain")}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>{t("form.name")}</label>
                  <input {...register("name")} placeholder={t("form.namePlaceholder")} className={inputClass} />
                  {errors.name && <p className="text-[color:var(--color-danger)] text-xs mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <label className={labelClass}>{t("form.phone")}</label>
                  <input {...register("phone")} placeholder={t("form.phonePlaceholder")} type="tel" className={inputClass} />
                  {errors.phone && <p className="text-[color:var(--color-danger)] text-xs mt-1">{errors.phone.message}</p>}
                </div>
              </div>
              <div>
                <label className={labelClass}>{t("form.email")}</label>
                <input {...register("email")} placeholder={t("form.emailPlaceholder")} type="email" className={inputClass} />
                {errors.email && <p className="text-[color:var(--color-danger)] text-xs mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <label className={labelClass}>{t("form.message")}</label>
                <textarea
                  {...register("message")}
                  placeholder={t("form.messagePlaceholder")}
                  rows={4}
                  className={`${inputClass} resize-none`}
                />
                {errors.message && <p className="text-[color:var(--color-danger)] text-xs mt-1">{errors.message.message}</p>}
              </div>

              {status === "error" && (
                <p className="text-[color:var(--color-danger)] text-sm rounded-lg border border-[color:var(--color-danger)]/30 bg-[color:var(--color-danger)]/5 px-3 py-2">
                  {t("form.errorBanner")}
                </p>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                className="btn btn-green w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === "loading" ? t("form.submitting") : t("form.submit")}
              </button>

              <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2 text-[11px] text-ink-500">
                {guarantees.map((g) => (
                  <span key={g}>{g}</span>
                ))}
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
