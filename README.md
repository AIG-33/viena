# VIENA MEDICAL — сайт

Корпоративный сайт ВИЕНА МЕДИКАЛ (viena.by) на Next.js 16 + React 19 + Tailwind v4.

---

## Разработка

```bash
npm install
cp .env.example .env.local   # Windows: copy .env.example .env.local
# заполнить .env.local (см. ниже)
npm run dev
```

Открыть http://localhost:3000.

---

## Email-отправка формы (Resend) — настройка один раз

Форма обратной связи шлёт заявки через [Resend](https://resend.com) — бесплатный план 3000 писем/мес, 100/день. Этого хватит с запасом.

### Шаг 1. Зарегистрироваться

1. Зайти на https://resend.com, нажать **Sign up**.
2. Подтвердить email.

### Шаг 2. Получить API-ключ

1. В дашборде Resend → **API Keys** → **Create API Key**.
2. Имя: `viena-production`. Permission: **Sending access**.
3. Скопировать ключ (начинается с `re_...`) — он показывается только один раз.

### Шаг 3. Положить ключ в `.env.local`

```env
RESEND_API_KEY=re_вставьте_ваш_ключ
CONTACT_TO_EMAIL=med@viena.by
CONTACT_FROM_EMAIL=onboarding@resend.dev
```

На этом этапе форма уже работает: письма уходят с адреса `onboarding@resend.dev` на `med@viena.by`. Ограничение — отправлять можно только на email, которым вы зарегистрировались в Resend (sandbox-режим).

### Шаг 4. Подтвердить домен viena.by (чтобы письма шли с `noreply@viena.by` на любой адрес)

1. В Resend → **Domains** → **Add Domain** → ввести `viena.by`.
2. Resend покажет 3 DNS-записи (SPF, DKIM, и обычно MX/TXT для возвратов).
3. Зайти к регистратору домена `viena.by` (где покупался домен), открыть DNS-настройки, добавить все три записи **как есть** (имя, тип, значение).
4. Нажать **Verify** в Resend. Обычно подтверждается за 5–60 минут.
5. После верификации сменить в `.env.local`:
   ```env
   CONTACT_FROM_EMAIL=noreply@viena.by
   ```

После этого форма работает для **любого** клиента, письма приходят стабильно, в «Входящие» (не в спам), без ограничений по получателям. Бесплатно и долгосрочно.

### На продакшене

Те же переменные нужно положить в Environment Variables хостинга (Vercel / VPS).

---

## Скрипты

```bash
npm run dev     # локальная разработка
npm run build   # production-сборка
npm run start   # запустить production-сборку
```

Требуется Node.js ≥ 20.

---

## Структура данных

- `/data/categories.json` — категории каталога
- `/data/products/*.json` — товары по категориям
- `/data/services.json`, `/data/projects.json` — услуги и проекты
- `/public/images/products/*.webp` — фото товаров (800×800, white bg)

Для добавления нового фото: положить исходник в `/products_img/`, запустить `node scripts/process-product-images.js`.

---

## Деплой

Подробный чек-лист — в `plans/` (после финальной проверки перед переносом).
