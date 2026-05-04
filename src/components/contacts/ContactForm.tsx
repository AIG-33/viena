"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  buildContactSchema,
  SUBJECT_OPTIONS,
  type ContactFormData,
  type SubjectKey,
} from "@/lib/validations";
import { useCart } from "@/context/CartContext";

const labelClass =
  "block text-[11px] uppercase tracking-[0.14em] font-bold text-ink-500 mb-1.5";

const inputClass =
  "w-full bg-white border border-paper-200 rounded-xl px-4 py-3.5 text-ink-900 text-[14px] placeholder:text-ink-400 focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition";

export function ContactForm() {
  const t = useTranslations("contacts.form");
  const tSubject = useTranslations("contacts.subjects");
  const tValidation = useTranslations("contacts.validation");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const { items, clear } = useCart();

  const Req = () => (
    <span aria-label={t("requiredHint")} className="text-green-600 font-bold ml-0.5">
      *
    </span>
  );

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
      const honeypot =
        (document.getElementById("viena-contact-website") as HTMLInputElement | null)?.value || "";
      const payload = {
        ...data,
        // For the manager email we send a human-readable subject — translate the key.
        subject: tSubject(data.subject as SubjectKey),
        website: honeypot,
        items: items.map((i) => ({
          productId: i.productId,
          slug: i.slug,
          categoryId: i.categoryId,
          name: i.name,
          catalogNumber: i.catalogNumber,
          quantity: i.quantity,
          selectedOptions: i.selectedOptions,
        })),
      };
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setStatus(res.ok ? "success" : "error");
      if (res.ok) {
        reset();
        clear();
      }
    } catch {
      setStatus("error");
    }
  };

  const guarantees = t.raw("guarantees") as string[];

  return (
    <div className="card p-6 md:p-8">
      <span className="eyebrow">
        <span className="pill">{t("eyebrowPill")}</span>
        {t("eyebrowText")}
      </span>
      <h2 className="display-heading text-ink-900 text-2xl md:text-3xl mt-3">
        {t("title1")}
        <br />
        {t("title2")}
      </h2>

      <AnimatePresence mode="wait">
        {status === "success" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-10"
          >
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-100 text-green-700 mb-5">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="display-heading text-ink-900 text-xl mb-2">{t("successTitle")}</h3>
            <p className="text-ink-600 text-[14px] mb-5">{t("successText")}</p>
            <button
              onClick={() => setStatus("idle")}
              className="text-green-700 font-semibold text-sm hover:text-green-600"
            >
              {t("successAgain")}
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={handleSubmit(onSubmit)}
            className="mt-6 space-y-4"
          >
            <div aria-hidden style={{ position: "absolute", left: "-10000px", width: "1px", height: "1px", overflow: "hidden" }}>
              <label htmlFor="viena-contact-website">Website</label>
              <input id="viena-contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>{t("name")} <Req /></label>
                <input {...register("name")} placeholder={t("namePlaceholder")} className={inputClass} />
                {errors.name && (
                  <p className="text-[color:var(--color-danger)] text-xs mt-1">{errors.name.message}</p>
                )}
              </div>
              <div>
                <label className={labelClass}>{t("company")}</label>
                <input {...register("company")} placeholder={t("companyPlaceholder")} className={inputClass} />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>{t("phone")} <Req /></label>
                <input {...register("phone")} type="tel" placeholder={t("phonePlaceholder")} className={inputClass} />
                {errors.phone && (
                  <p className="text-[color:var(--color-danger)] text-xs mt-1">{errors.phone.message}</p>
                )}
              </div>
              <div>
                <label className={labelClass}>{t("email")} <Req /></label>
                <input {...register("email")} type="email" placeholder={t("emailPlaceholder")} className={inputClass} />
                {errors.email && (
                  <p className="text-[color:var(--color-danger)] text-xs mt-1">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className={labelClass}>{t("subject")}</label>
              <select {...register("subject")} className={`${inputClass} cursor-pointer`}>
                {SUBJECT_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {tSubject(opt)}
                  </option>
                ))}
              </select>
              {errors.subject && (
                <p className="text-[color:var(--color-danger)] text-xs mt-1">{errors.subject.message}</p>
              )}
            </div>

            <div>
              <label className={labelClass}>{t("message")} <Req /></label>
              <textarea
                {...register("message")}
                placeholder={t("messagePlaceholder")}
                rows={5}
                className={`${inputClass} resize-none`}
              />
              {errors.message && (
                <p className="text-[color:var(--color-danger)] text-xs mt-1">{errors.message.message}</p>
              )}
            </div>

            {status === "error" && (
              <p className="text-[color:var(--color-danger)] text-sm rounded-lg border border-[color:var(--color-danger)]/30 bg-[color:var(--color-danger)]/5 px-3 py-2">
                {t("errorBanner")}
              </p>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="btn btn-green w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === "loading" ? t("submitting") : t("submit")}
            </button>

            <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2 text-[11px] text-ink-500">
              {guarantees.map((g, i) => (
                <span key={i}>{g}</span>
              ))}
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
