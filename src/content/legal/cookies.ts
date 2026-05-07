import type { Locale } from "@/i18n/routing";
import type { LegalDocument } from "./types";

const cookiesRu: LegalDocument = {
  metaTitle:
    "Политика использования файлов cookie — ВИЕНА МЕДИКАЛ (официальный сайт)",
  metaDescription:
    "Какие cookie используются на сайте ВИЕНА МЕДИКАЛ, правовые основания по законодательству Республики Беларусь, порядок согласия и отключения.",
  heroEyebrow: "Правовая информация",
  heroTitle: "Политика использования файлов cookie",
  updatedNote:
    "Использование cookie применимо к информации в информационно-телекоммуникационной сети Интернет и может затрагивать сведения, относимые к персональным данным в понимании Закона Республики Беларусь № 99-З при условии их идентификационного характера.",
  sections: [
    {
      title: "1. Что такое cookie и зачем они используются",
      paragraphs: [
        "Файлы cookie — это небольшие фрагменты данных, которые сайт (или связанные скрипты) могут сохранять на устройстве пользователя и затем считывать. Cookie позволяют обеспечить функционирование сайта, запоминание пользовательских предпочтений, а также — при наличии отдельного согласия — проведение обезличенной либо обобщённой аналитики посещаемости.",
        "В соответствии с законодательством Республики Беларусь обработка сведений, позволяющих идентифицировать пользователя, может рассматриваться как обработка персональных данных и должна осуществляться с соблюдением Закона Республики Беларусь от 7 мая 2021 г. № 99-З «О защите персональных данных», если соответствующие условия выполняются.",
      ],
    },
    {
      title: "2. Какие категории cookie мы используем",
      paragraphs: [
        "Строго необходимые / функциональные cookie и аналогичные технологии, без которых работа сайта невозможна или существенно затруднена (например, поддержание сеанса, корректная загрузка страниц, запоминание предпочтений по языку интерфейса). Такие технологии используются в пределах, необходимых для предоставления пользователю доступа к сайту.",
        "Аналитические cookie и сторонние скрипты аналитики (например, счётчики веб-аналитики), которые не являются строго необходимыми для базового просмотра сайта, подключаются только после того, как пользователь выразил согласие через баннер cookie на сайте (кнопка «Принять» / эквивалентное действие), если такие инструменты включены у Оператора на данном домене.",
        "Если пользователь выбирает вариант «Только необходимые cookie», аналитические инструменты не активируются.",
      ],
    },
    {
      title: "3. Конкретные инструменты и сторонние сервисы",
      paragraphs: [
        "В зависимости от настроек информационной системы Оператора на сайте могут использоваться: Яндекс.Метрика (ООО «Яндекс», Российская Федерация); Google Tag Manager / Google Analytics (Google LLC / Alphabet Inc., США и др.) и иные инструменты, задаваемые через переменные окружения сайта. Перечень активных счётчиков определяется фактической конфигурацией сайта на момент посещения.",
        "При активации указанных инструментов возможна передача технических данных (например, IP-адрес, сведения об устройстве и событиях на странице) третьим лицам — по правилам соответствующего сервиса и на условиях, определённых документами Яндекса/Google либо иного провайдера.",
        "Оператор рекомендует ознакомиться с политиками конфиденциальности указанных сервисов при использовании расширенной аналитики после предоставления согласия.",
      ],
    },
    {
      title: "4. Срок хранения",
      paragraphs: [
        "Сроки хранения cookie определяются настройками конкретного cookie, выбранным пользователем вариантом согласия, а также настройками браузера. Пользователь может удалить ранее сохранённые cookie в настройках браузера в любой момент.",
      ],
    },
    {
      title: "5. Как отозвать согласие и изменить выбор",
      paragraphs: [
        "Согласие на использование аналитических cookie может быть отозвано: (1) путём очистки cookie и локального хранилища сайта в браузере; (2) путём обновления настроек на странице «Cookies» (если предусмотрена кнопка отзыва); (3) путём направления обращения на med@viena.by с просьбой уточнить применяемую практику в отношении аналитики на сайте.",
        "Повторный выбор баннера cookie появляется, если очищены сохранённые настройки согласия в браузере (или при смене версии механизма согласия Оператором).",
      ],
    },
    {
      title: "6. Контакты",
      paragraphs: [
        "По вопросам, связанным с обработкой персональных данных и cookie, обращайтесь: ЧУП «Виена Медикал», med@viena.by, 220070, г. Минск, ул. Радиальная, 54Б, каб. 67. Подробная политика обработки персональных данных размещена в разделе «Политика обработки персональных данных».",
      ],
    },
  ],
};

const cookiesEn: LegalDocument = {
  metaTitle: "Cookie policy — VIENA MEDICAL official website",
  metaDescription:
    "Cookie categories, consent for analytics, and Belarus Law No. 99-З compliance overview.",
  heroEyebrow: "Legal information",
  heroTitle: "Cookie policy",
  updatedNote:
    "Translation for convenience; where Belarus law applies, prefer the Russian version.",
  jurisdictionNote:
    "Analytics scripts (Yandex Metrica, Google Tag Manager / GA4 if configured) load only after you accept non-essential cookies.",
  sections: [
    {
      title: "1. What cookies are",
      paragraphs: [
        "Cookies are small data fragments stored on your device to run the site, remember preferences (e.g. language), and — only after consent — enable analytics counters.",
      ],
    },
    {
      title: "2. Categories",
      paragraphs: [
        "Strictly necessary cookies keep the site working. Analytics/marketing tools are optional and are disabled unless you accept them in the banner.",
      ],
    },
    {
      title: "3. Third-party tools",
      paragraphs: [
        "When enabled, Yandex Metrica and/or Google Tag Manager / GA4 may process technical data under their providers’ terms. The live configuration depends on environment variables set for this deployment.",
      ],
    },
    {
      title: "4. Withdraw consent",
      paragraphs: [
        "You can withdraw analytics consent by clearing site data in your browser or using the revoke control on this page when provided. Contact med@viena.by for questions.",
      ],
    },
  ],
};

const cookiesZh: LegalDocument = {
  metaTitle: "Cookie 政策 — VIENA MEDICAL 官方网站",
  metaDescription:
    "网站使用的 Cookie 类型、同意方式及与白俄罗斯法律的关系（参考说明）。",
  heroEyebrow: "法律信息",
  heroTitle: "Cookie 使用政策",
  updatedNote: "中文为参考译文；涉及白俄罗斯法律时以俄文为准。",
  jurisdictionNote:
    "分析类脚本（如已配置 Yandex、Google）仅在您同意非必要 Cookie 后加载。",
  sections: [
    {
      title: "1. 什么是 Cookie",
      paragraphs: [
        "Cookie 是网站保存在您设备上的小型数据，用于保障基本功能、记住语言等设置；在获得同意后也可用于访问统计。",
      ],
    },
    {
      title: "2. 分类",
      paragraphs: [
        "必要类 Cookie 用于网站运行；分析类工具非必需，仅在您通过横幅同意后启用。",
      ],
    },
    {
      title: "3. 第三方工具",
      paragraphs: [
        "启用后可能使用 Yandex metrica、Google Tag Manager / GA 等，具体以站点实际配置为准，处理规则亦受各服务商条款约束。",
      ],
    },
    {
      title: "4. 撤回同意",
      paragraphs: [
        "您可在浏览器中清除本站数据以撤回对分析类 Cookie 的同意，也可联系 med@viena.by。",
      ],
    },
  ],
};

export const cookiesByLocale: Record<Locale, LegalDocument> = {
  ru: cookiesRu,
  en: cookiesEn,
  zh: cookiesZh,
};

export function getCookiesPolicy(locale: Locale): LegalDocument {
  return cookiesByLocale[locale] ?? cookiesByLocale.ru;
}
