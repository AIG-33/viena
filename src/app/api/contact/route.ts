import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { contactSchema } from "@/lib/validations";

const resendApiKey = process.env.RESEND_API_KEY;
const toEmail = process.env.CONTACT_TO_EMAIL || "med@viena.by";
const fromEmail = process.env.CONTACT_FROM_EMAIL || "onboarding@resend.dev";
const replyToFallback = process.env.CONTACT_REPLY_TO;

const resend = resendApiKey ? new Resend(resendApiKey) : null;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

type Item = {
  name: string;
  catalogNumber?: string;
  quantity: number;
  selectedOptions?: Record<string, string>;
};

function renderItemsHtml(items?: Item[]): string {
  if (!items || items.length === 0) return "";
  const rows = items
    .map((item, idx) => {
      const options = item.selectedOptions
        ? Object.entries(item.selectedOptions)
            .map(([k, v]) => `${escapeHtml(k)}: ${escapeHtml(v)}`)
            .join(" · ")
        : "";
      return `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e5e5;font-family:ui-monospace,monospace;color:#666;">${String(idx + 1).padStart(2, "0")}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e5e5;">
            <div style="font-weight:600;">${escapeHtml(item.name)}</div>
            ${item.catalogNumber ? `<div style="font-family:ui-monospace,monospace;font-size:12px;color:#666;">SKU · ${escapeHtml(item.catalogNumber)}</div>` : ""}
            ${options ? `<div style="font-size:12px;color:#666;">${options}</div>` : ""}
          </td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e5e5;text-align:right;font-family:ui-monospace,monospace;">×${item.quantity}</td>
        </tr>`;
    })
    .join("");
  return `
    <h3 style="font-size:14px;text-transform:uppercase;letter-spacing:0.1em;margin:24px 0 8px;color:#0b0a0a;">Корзина · ${items.length} поз.</h3>
    <table style="width:100%;border-collapse:collapse;border:1px solid #0b0a0a;">${rows}</table>`;
}

function renderItemsText(items?: Item[]): string {
  if (!items || items.length === 0) return "";
  const lines = items.map((item, idx) => {
    const parts = [item.name];
    if (item.catalogNumber) parts.push(`SKU ${item.catalogNumber}`);
    parts.push(`×${item.quantity}`);
    return `${String(idx + 1).padStart(2, "0")}. ${parts.join(" · ")}`;
  });
  return `\n\nКОРЗИНА (${items.length} поз.):\n${lines.join("\n")}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (typeof body?.website === "string" && body.website.trim() !== "") {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    const result = contactSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Некорректные данные формы", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { name, company, phone, email, subject, message, items } = result.data;

    const submittedAt = new Date().toLocaleString("ru-RU", { timeZone: "Europe/Minsk" });

    const textBody =
      `Новая заявка с сайта viena.by\n\n` +
      `Дата:      ${submittedAt}\n` +
      `Имя:       ${name}\n` +
      `Компания:  ${company || "—"}\n` +
      `Телефон:   ${phone}\n` +
      `Email:     ${email}\n` +
      `Тема:      ${subject}\n\n` +
      `Сообщение:\n${message}` +
      renderItemsText(items);

    const htmlBody = `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:640px;margin:0 auto;padding:24px;background:#fff;color:#0b0a0a;">
        <div style="border-top:3px solid #0b0a0a;padding-top:16px;margin-bottom:24px;">
          <div style="font-family:ui-monospace,monospace;font-size:11px;letter-spacing:0.14em;color:#be2b5e;text-transform:uppercase;font-weight:600;">VIENA · NEW LEAD</div>
          <h1 style="font-size:24px;margin:8px 0 4px;font-weight:600;">Новая заявка с сайта</h1>
          <div style="font-family:ui-monospace,monospace;font-size:12px;color:#666;">${escapeHtml(submittedAt)} · Europe/Minsk</div>
        </div>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:6px 0;color:#666;font-family:ui-monospace,monospace;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;width:120px;">Имя</td><td style="padding:6px 0;font-weight:600;">${escapeHtml(name)}</td></tr>
          <tr><td style="padding:6px 0;color:#666;font-family:ui-monospace,monospace;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;">Компания</td><td style="padding:6px 0;">${escapeHtml(company || "—")}</td></tr>
          <tr><td style="padding:6px 0;color:#666;font-family:ui-monospace,monospace;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;">Телефон</td><td style="padding:6px 0;"><a href="tel:${escapeHtml(phone)}" style="color:#0b0a0a;">${escapeHtml(phone)}</a></td></tr>
          <tr><td style="padding:6px 0;color:#666;font-family:ui-monospace,monospace;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;">Email</td><td style="padding:6px 0;"><a href="mailto:${escapeHtml(email)}" style="color:#0b0a0a;">${escapeHtml(email)}</a></td></tr>
          <tr><td style="padding:6px 0;color:#666;font-family:ui-monospace,monospace;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;">Тема</td><td style="padding:6px 0;">${escapeHtml(subject)}</td></tr>
        </table>
        <h3 style="font-size:14px;text-transform:uppercase;letter-spacing:0.1em;margin:24px 0 8px;color:#0b0a0a;">Сообщение</h3>
        <div style="padding:16px;background:#f4f1ef;border-left:3px solid #be2b5e;white-space:pre-wrap;line-height:1.6;">${escapeHtml(message)}</div>
        ${renderItemsHtml(items)}
        <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e5e5e5;font-family:ui-monospace,monospace;font-size:10px;color:#999;letter-spacing:0.1em;">
          VIENA.BY · CONTACT FORM · AUTO-GENERATED
        </div>
      </div>`;

    if (!resend) {
      console.warn("RESEND_API_KEY not set — logging submission only");
      console.log("📬 Contact form submission:", {
        name, company, phone, email, subject, message, items, submittedAt,
      });
      return NextResponse.json({ success: true, dev: true }, { status: 200 });
    }

    const { error } = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      replyTo: email || replyToFallback,
      subject: `[viena.by] ${subject} — ${name}`,
      text: textBody,
      html: htmlBody,
      headers: { "X-Entity-Ref-ID": `viena-${Date.now()}` },
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Не удалось отправить письмо. Попробуйте позже или напишите напрямую на med@viena.by" },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("Contact form error:", err);
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
  }
}
