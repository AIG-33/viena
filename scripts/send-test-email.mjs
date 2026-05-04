import { Resend } from "resend";
import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, "..", ".env.local") });

const resend = new Resend(process.env.RESEND_API_KEY);
const to = process.env.CONTACT_TO_EMAIL;
const from = process.env.CONTACT_FROM_EMAIL;

const submittedAt = new Date().toLocaleString("ru-RU", { timeZone: "Europe/Minsk" });

const html = `
  <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:640px;margin:0 auto;padding:24px;background:#fff;color:#0b0a0a;">
    <div style="border-top:3px solid #0b0a0a;padding-top:16px;margin-bottom:24px;">
      <div style="font-family:ui-monospace,monospace;font-size:11px;letter-spacing:0.14em;color:#be2b5e;text-transform:uppercase;font-weight:600;">VIENA · NEW LEAD · TEST</div>
      <h1 style="font-size:24px;margin:8px 0 4px;font-weight:600;">Новая заявка с сайта</h1>
      <div style="font-family:ui-monospace,monospace;font-size:12px;color:#666;">${submittedAt} · Europe/Minsk</div>
    </div>
    <table style="width:100%;border-collapse:collapse;">
      <tr><td style="padding:6px 0;color:#666;font-family:ui-monospace,monospace;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;width:120px;">Имя</td><td style="padding:6px 0;font-weight:600;">Анна Ковалевич</td></tr>
      <tr><td style="padding:6px 0;color:#666;font-family:ui-monospace,monospace;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;">Компания</td><td style="padding:6px 0;">ЧУП «Лабтест Минск»</td></tr>
      <tr><td style="padding:6px 0;color:#666;font-family:ui-monospace,monospace;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;">Телефон</td><td style="padding:6px 0;"><a href="tel:+375291234567" style="color:#0b0a0a;">+375 29 123-45-67</a></td></tr>
      <tr><td style="padding:6px 0;color:#666;font-family:ui-monospace,monospace;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;">Email</td><td style="padding:6px 0;"><a href="mailto:a.kovalevich@labtest.by" style="color:#0b0a0a;">a.kovalevich@labtest.by</a></td></tr>
      <tr><td style="padding:6px 0;color:#666;font-family:ui-monospace,monospace;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;">Тема</td><td style="padding:6px 0;">Запрос на поставку товаров</td></tr>
    </table>
    <h3 style="font-size:14px;text-transform:uppercase;letter-spacing:0.1em;margin:24px 0 8px;color:#0b0a0a;">Сообщение</h3>
    <div style="padding:16px;background:#f4f1ef;border-left:3px solid #be2b5e;white-space:pre-wrap;line-height:1.6;">Здравствуйте, расширяем лабораторный парк, интересует коммерческое предложение по перечню позиций в корзине + стоимость пусконаладки. Нужен счёт до конца месяца. Возможен ли выезд инженера на осмотр помещения?</div>
    <h3 style="font-size:14px;text-transform:uppercase;letter-spacing:0.1em;margin:24px 0 8px;color:#0b0a0a;">Корзина · 3 поз.</h3>
    <table style="width:100%;border-collapse:collapse;border:1px solid #0b0a0a;">
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e5e5;font-family:ui-monospace,monospace;color:#666;">01</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e5e5;">
          <div style="font-weight:600;">Наконечники с фильтром 1000 мкл в штативе</div>
          <div style="font-family:ui-monospace,monospace;font-size:12px;color:#666;">SKU · VM-NKF-1000</div>
        </td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e5e5;text-align:right;font-family:ui-monospace,monospace;">×10</td>
      </tr>
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e5e5;font-family:ui-monospace,monospace;color:#666;">02</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e5e5;">
          <div style="font-weight:600;">Пробирки Эппендорф 1.5 мл</div>
          <div style="font-family:ui-monospace,monospace;font-size:12px;color:#666;">SKU · VM-EPP-15</div>
        </td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e5e5;text-align:right;font-family:ui-monospace,monospace;">×5</td>
      </tr>
      <tr>
        <td style="padding:8px 12px;font-family:ui-monospace,monospace;color:#666;">03</td>
        <td style="padding:8px 12px;">
          <div style="font-weight:600;">Автоматический биохимический анализатор SMT-120VP</div>
          <div style="font-family:ui-monospace,monospace;font-size:12px;color:#666;">SKU · VM-SMT-120</div>
        </td>
        <td style="padding:8px 12px;text-align:right;font-family:ui-monospace,monospace;">×1</td>
      </tr>
    </table>
    <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e5e5e5;font-family:ui-monospace,monospace;font-size:10px;color:#999;letter-spacing:0.1em;">
      VIENA.BY · CONTACT FORM · TEST SEND · AUTO-GENERATED
    </div>
  </div>`;

const text = `Новая заявка с сайта viena.by (ТЕСТ)

Дата:      ${submittedAt}
Имя:       Анна Ковалевич
Компания:  ЧУП «Лабтест Минск»
Телефон:   +375 29 123-45-67
Email:     a.kovalevich@labtest.by
Тема:      Запрос на поставку товаров

Сообщение:
Здравствуйте, расширяем лабораторный парк, интересует коммерческое предложение по перечню позиций в корзине + стоимость пусконаладки.

КОРЗИНА (3 поз.):
01. Наконечники с фильтром 1000 мкл · SKU VM-NKF-1000 · ×10
02. Пробирки Эппендорф 1.5 мл · SKU VM-EPP-15 · ×5
03. Автоматический биохимический анализатор SMT-120VP · SKU VM-SMT-120 · ×1`;

const { data, error } = await resend.emails.send({
  from,
  to: [to],
  replyTo: "a.kovalevich@labtest.by",
  subject: "[viena.by] Запрос на поставку товаров — Анна Ковалевич",
  text,
  html,
});

if (error) {
  console.error("❌ Resend error:", JSON.stringify(error, null, 2));
  process.exit(1);
}

console.log("✅ Email sent. ID:", data?.id);
console.log("   From:", from);
console.log("   To:", to);
