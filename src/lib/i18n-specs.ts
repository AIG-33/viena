import type { Locale } from "@/i18n/routing";

// Translation maps for product-spec keys and values that appear in data/products/*.json.
// Russian is canonical; entries that are not found fall back to the original RU string,
// so the page never crashes if we miss a value.

const KEY_DICT: Record<string, { en: string; zh: string }> = {
  Подкатегория: { en: "Subcategory", zh: "子类别" },
  Упаковка: { en: "Packaging", zh: "包装" },
  "Цвет колпачка": { en: "Cap color", zh: "盖颜色" },
  "Вид животного": { en: "Species", zh: "动物种类" },
  "Размер ланцета": { en: "Lancet size", zh: "采血针规格" },
  "Глубина ланцета (мм)": { en: "Lancet depth (mm)", zh: "采血针深度(毫米)" },
  "Вид теста": { en: "Test type", zh: "检测类型" },
  "РУ МЗ РБ": { en: "Belarus MoH registration", zh: "白俄罗斯卫生部注册号" },
  Фасовка: { en: "Pack size", zh: "包装规格" },
  "Количество позиций": { en: "Number of positions", zh: "工位数量" },
  "Цвет кольца": { en: "Ring color", zh: "环形颜色" },
  Анализатор: { en: "Analyser", zh: "分析仪" },
  "Размер пробирки": { en: "Tube size", zh: "试管规格" },
  "Объем, мл": { en: "Volume, ml", zh: "容量,毫升" },
  Объем: { en: "Volume", zh: "容量" },
  Страна: { en: "Country", zh: "国家" },
  Состав: { en: "Composition", zh: "成分" },
  "Температура плавления": { en: "Melting point", zh: "熔点" },
  "Скорость охлаждения": { en: "Cooling rate", zh: "冷却速率" },
  "Точность измерения температуры": { en: "Temperature accuracy", zh: "温度测量精度" },
  Термоблок: { en: "Thermal block", zh: "加热模块" },
  "Сенсорный экран": { en: "Touchscreen", zh: "触摸屏" },
  "Автономная работа": { en: "Battery operation", zh: "电池续航" },
  "Пропускная способность": { en: "Throughput", zh: "通量" },
  "Время сканирования флуоресценции": { en: "Fluorescence scan time", zh: "荧光扫描时间" },
  "Флуоресцентные каналы": { en: "Fluorescence channels", zh: "荧光通道" },
  "Скорость нагрева": { en: "Heating rate", zh: "升温速率" },
  "Равномерность температуры": { en: "Temperature uniformity", zh: "温度均匀性" },
  Повторяемость: { en: "Reproducibility", zh: "重复性" },
  "Линейная корреляция": { en: "Linear correlation", zh: "线性相关性" },
  "Образец хижины": { en: "Sample type", zh: "样本类型" },
  "Источник света": { en: "Light source", zh: "光源" },
  "Основные области применения": { en: "Primary applications", zh: "主要应用" },
  "Специальный температурный протокол": { en: "Special thermal protocol", zh: "特殊温度协议" },
  "Хранение данных": { en: "Data storage", zh: "数据存储" },
  "Защита от сбоев электропитания": { en: "Power-failure protection", zh: "断电保护" },
  "Спецификация связи": { en: "Communication interface", zh: "通讯接口" },
  "Источник питания и потребление электроэн": { en: "Power supply and consumption", zh: "电源与功耗" },
  "Подходящие расходные материалы": { en: "Compatible consumables", zh: "兼容耗材" },
  "Реакционный объем": { en: "Reaction volume", zh: "反应体积" },
};

const VALUE_DICT: Record<string, { en: string; zh: string }> = {
  // Animal species
  "Cобаки и кошки": { en: "Dogs and cats", zh: "犬猫" },
  "Собаки и кошки": { en: "Dogs and cats", zh: "犬猫" },
  Собаки: { en: "Dogs", zh: "犬" },
  Кошки: { en: "Cats", zh: "猫" },
  // Subcategories
  "Вакуумные пробирки": { en: "Vacuum tubes", zh: "真空采血管" },
  "Транспортировка": { en: "Transport", zh: "运输" },
  "Наконечники для дозаторов": { en: "Pipette tips", zh: "移液器吸头" },
  "Мочеприемники": { en: "Urine collectors", zh: "尿液采集器" },
  Дозатор: { en: "Pipette", zh: "移液器" },
  Планшеты: { en: "Plates", zh: "板/盘" },
  "Свабы для транспортировки материала": { en: "Transport swabs", zh: "运输拭子" },
  "Пробирки для мочи": { en: "Urine tubes", zh: "尿液采集管" },
  Гематоксилины: { en: "Hematoxylins", zh: "苏木精" },
  "Формалин 10%": { en: "Formalin 10%", zh: "10% 福尔马林" },
  Эозин: { en: "Eosin", zh: "伊红" },
  "Индивидуальная упаковка": { en: "Individual packaging", zh: "独立包装" },
  // Common values
  "Для капиллярной крови": { en: "For capillary blood", zh: "用于毛细血管采血" },
  "50 штук на штативе, 1200 штук в коробке": {
    en: "50 pieces per rack, 1200 pieces per box",
    zh: "每架 50 支,每箱 1200 支",
  },
  "2000 штук в коробке": { en: "2000 pieces per box", zh: "每箱 2000 支" },
  "100 штук в упаковке": { en: "100 pieces per pack", zh: "每包 100 支" },
  "Остальное": { en: "Other", zh: "其他" },
  // Colors
  Желтый: { en: "Yellow", zh: "黄色" },
  Зеленый: { en: "Green", zh: "绿色" },
  Сиреневый: { en: "Lavender", zh: "薰衣草色" },
  Красный: { en: "Red", zh: "红色" },
  Серый: { en: "Gray", zh: "灰色" },
  голубой: { en: "Light blue", zh: "浅蓝色" },
  Голубой: { en: "Light blue", zh: "浅蓝色" },
  Чёрный: { en: "Black", zh: "黑色" },
  Черный: { en: "Black", zh: "黑色" },
  Белый: { en: "White", zh: "白色" },
  Прозрачный: { en: "Clear", zh: "透明" },
  Розовый: { en: "Pink", zh: "粉色" },
  // Countries
  США: { en: "USA", zh: "美国" },
  Германия: { en: "Germany", zh: "德国" },
  Австрия: { en: "Austria", zh: "奥地利" },
  Япония: { en: "Japan", zh: "日本" },
  Корея: { en: "Korea", zh: "韩国" },
  "Южная Корея": { en: "South Korea", zh: "韩国" },
  Китай: { en: "China", zh: "中国" },
  Италия: { en: "Italy", zh: "意大利" },
  Франция: { en: "France", zh: "法国" },
  Великобритания: { en: "United Kingdom", zh: "英国" },
  Нидерланды: { en: "Netherlands", zh: "荷兰" },
  Швейцария: { en: "Switzerland", zh: "瑞士" },
  Россия: { en: "Russia", zh: "俄罗斯" },
  Беларусь: { en: "Belarus", zh: "白俄罗斯" },
  // Boilerplate registration entries
  "ИМ-7.114162 бессрочно": { en: "IM-7.114162 — indefinite", zh: "IM-7.114162 — 长期有效" },
  "У МЗ РБ ИМ-7.111931 до 26.05.2027": {
    en: "Belarus MoH IM-7.111931 — until 26.05.2027",
    zh: "白俄罗斯卫生部 IM-7.111931 — 至 2027-05-26",
  },
};

export function localiseSpecKey(key: string, locale: Locale): string {
  if (locale === "ru") return key;
  const m = KEY_DICT[key];
  return m ? m[locale] : key;
}

export function localiseSpecValue(value: string, locale: Locale): string {
  if (locale === "ru") return value;
  const m = VALUE_DICT[value];
  return m ? m[locale] : value;
}
