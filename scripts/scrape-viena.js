// Scrapes all product cards from each category of viena.by
// Runs a headless Chromium, waits for Tilda store to render, then extracts data.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const CATEGORIES = [
  { id: 'consumables',        url: 'https://viena.by/catalog_consumables' },
  { id: 'vacuum-systems',     url: 'https://viena.by/vacuum_systems' },
  { id: 'equipment',          url: 'https://viena.by/catalog_equipment' },
  { id: 'reagents',           url: 'https://viena.by/catalog_reagents' },
  { id: 'pathomorphology',    url: 'https://viena.by/pathomorphology' },
  { id: 'veterinary',         url: 'https://viena.by/catalog_vet' },
  { id: 'scientific-reagents',url: 'https://viena.by/reagents_science' },
  { id: 'lancets',            url: 'https://viena.by/catalog_lancets' },
];

const OUT_DIR = path.join(__dirname, '..', 'data', 'scraped');
fs.mkdirSync(OUT_DIR, { recursive: true });

async function scrapeCategory(page, cat) {
  console.log(`\n=== ${cat.id} → ${cat.url} ===`);
  await page.goto(cat.url, { waitUntil: 'networkidle', timeout: 60000 });
  // Wait for Tilda store cards to render
  try {
    await page.waitForSelector('.t-store__card:not(.t-store__card-preloader)', { timeout: 30000 });
  } catch {
    console.log('  no rendered cards — trying alternative wait');
    await page.waitForTimeout(3000);
  }
  // Scroll to force lazy-load
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y);
      await new Promise(r => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(2000);

  // Extract card data
  const products = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.t-store__card'))
      .filter(el => !el.classList.contains('t-store__card-preloader'));
    return cards.map(card => {
      const name = card.querySelector('.t-store__card__title, .js-store-prod-name, .t-name')?.textContent?.trim() || '';
      const descr = card.querySelector('.t-store__card__descr, .js-store-prod-descr, .t-descr')?.textContent?.trim() || '';
      const price = card.querySelector('.t-store__card__price-value, .js-store-prod-price-val')?.textContent?.trim() || '';
      const priceOld = card.querySelector('.t-store__card__price_old, .js-product-price-old')?.textContent?.trim() || '';
      const img = card.querySelector('img')?.getAttribute('data-original') ||
                  card.querySelector('img')?.getAttribute('src') ||
                  card.querySelector('.t-store__card__bgimg')?.getAttribute('data-original') || '';
      const bgStyle = card.querySelector('.t-store__card__bgimg')?.getAttribute('style') || '';
      const bgMatch = bgStyle.match(/url\((['"]?)([^'")]+)\1\)/);
      const bgUrl = bgMatch ? bgMatch[2] : '';
      const productUid = card.getAttribute('data-product-uid') || card.getAttribute('data-product-id') || '';
      const productLid = card.getAttribute('data-product-lid') || '';
      const href = card.querySelector('a')?.href || '';
      // Characteristics
      const charText = card.querySelector('.t-store__card__characteristics-value, .js-product-chars')?.textContent?.trim() || '';
      return {
        name,
        description: descr,
        price,
        priceOld,
        image: img || bgUrl,
        productUid,
        productLid,
        href,
        chars: charText,
      };
    });
  });
  console.log(`  got ${products.length} cards`);
  return products;
}

async function scrapeProductDetail(page, href) {
  // Open product popup or page and extract full details
  await page.goto(href, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1500);
  return await page.evaluate(() => {
    const pickText = (sel) => Array.from(document.querySelectorAll(sel)).map(e => e.textContent.trim()).filter(Boolean);
    const imgs = Array.from(document.querySelectorAll('.t-slds__img, .t-store__prod-popup__slider-img, .t-store__prod-popup__bgimg, img.t-img'))
      .map(el => el.getAttribute('data-original') || el.src || (el.style.backgroundImage.match(/url\(['"]?([^'")]+)['"]?\)/) || [])[1])
      .filter(Boolean);
    const name = document.querySelector('.t-store__prod-popup__name, h1.js-store-prod-name, .t-title')?.textContent?.trim() || '';
    const description = document.querySelector('.t-store__prod-popup__text, .js-store-prod-text, .t-descr')?.textContent?.trim() || '';
    const priceValue = document.querySelector('.js-product-price, .t-store__prod-popup__price-value')?.textContent?.trim() || '';
    // Variants / options
    const editions = Array.from(document.querySelectorAll('.js-product-edition-option, .t-product__option-select, .t-product__option-variants'))
      .map(el => ({
        label: el.getAttribute('data-product-option-name') || el.previousElementSibling?.textContent?.trim() || '',
        html: el.outerHTML.slice(0, 500),
      }));
    const charsTable = Array.from(document.querySelectorAll('.t-store__prod-popup__chars tr, .t-product__charsrow, .js-product-chars-item'))
      .map(tr => {
        const k = tr.querySelector('.t-store__prod-popup__chars-item-title, .t-product__chars-key')?.textContent?.trim() || '';
        const v = tr.querySelector('.t-store__prod-popup__chars-item-value, .t-product__chars-value')?.textContent?.trim() || '';
        return { key: k, value: v };
      }).filter(r => r.key || r.value);
    return { name, description, priceValue, imgs: [...new Set(imgs)], charsTable, editions };
  });
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36',
    viewport: { width: 1366, height: 900 },
  });
  const page = await context.newPage();
  const result = {};
  for (const cat of CATEGORIES) {
    try {
      const cards = await scrapeCategory(page, cat);
      result[cat.id] = cards;
    } catch (e) {
      console.log(`  ERROR ${cat.id}: ${e.message}`);
      result[cat.id] = [];
    }
  }
  fs.writeFileSync(path.join(OUT_DIR, 'cards.json'), JSON.stringify(result, null, 2));
  console.log(`\nWrote cards → ${path.join(OUT_DIR, 'cards.json')}`);
  await browser.close();
})();
