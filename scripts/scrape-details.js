// Scrape detail pages (specs, images, variants) for every product.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const IN = path.join(__dirname, '..', 'data', 'scraped', 'cards.json');
const OUT = path.join(__dirname, '..', 'data', 'scraped', 'details.json');
const cards = JSON.parse(fs.readFileSync(IN, 'utf8'));

async function extractDetail(page, href) {
  await page.goto(href, { waitUntil: 'domcontentloaded', timeout: 45000 });
  // Wait for tilda product rendering
  try {
    await page.waitForSelector('.js-store-prod-all-text, .t-store__prod-popup__name, .js-product', { timeout: 15000 });
  } catch {}
  await page.waitForTimeout(1200);

  return await page.evaluate(() => {
    const t = (el) => (el?.textContent || '').trim();

    // Name
    const name = t(document.querySelector('.js-store-prod-name, .t-store__prod-popup__name, h1.t-title'));

    // Full text/description
    const descrEl = document.querySelector('.js-store-prod-all-text, .t-store__prod-popup__text');
    const descriptionHtml = descrEl ? descrEl.innerHTML : '';
    const descriptionText = t(descrEl);

    // SKU / article
    const sku = t(document.querySelector('.js-store-prod-sku, .t-store__prod-popup__sku'));

    // Price (often empty for B2B)
    const price = t(document.querySelector('.js-product-price, .t-store__prod-popup__price-value'));

    // Characteristics/specs table (t-store__prod-popup__chars)
    const charsRows = Array.from(document.querySelectorAll('.t-store__prod-popup__charactristics-item, .t-store__prod-popup__chars-item, tr'))
      .map(row => {
        const kEl = row.querySelector('.t-store__prod-popup__charactristics-title, .t-store__prod-popup__chars-item-title, th, td:nth-child(1)');
        const vEl = row.querySelector('.t-store__prod-popup__charactristics-value, .t-store__prod-popup__chars-item-value, td:nth-child(2)');
        const k = (kEl?.textContent || '').trim();
        const v = (vEl?.textContent || '').trim();
        if (!k || !v || k === v) return null;
        if (k.length > 80 || v.length > 400) return null;
        return { key: k, value: v };
      })
      .filter(Boolean);

    // Images — look at the product's image slider
    const imgNodes = Array.from(document.querySelectorAll('.t-slds__img, .t-store__prod-popup__slider-img, img[data-slide-img], img.t-img, .t-slds__thumbs_img, .js-product-img'));
    const imgs = imgNodes.map(el => {
      if (el.tagName === 'IMG') return el.getAttribute('data-original') || el.src;
      const bg = el.style?.backgroundImage || '';
      const m = bg.match(/url\(['"]?([^'")]+)['"]?\)/);
      return m ? m[1] : null;
    }).filter(Boolean).filter(u => !u.includes('/thumb/') && !u.startsWith('data:'));

    // Variants / editions — Tilda stores options/variants in .t-product__option-select, .t-product__option-variants
    const options = Array.from(document.querySelectorAll('.t-product__option'))
      .map(opt => {
        const title = t(opt.querySelector('.t-product__option-title'));
        const variants = Array.from(opt.querySelectorAll('.t-product__option-variants_item, option'))
          .map(v => t(v))
          .filter(v => v && v.toLowerCase() !== 'выберите вариант');
        return { title, variants };
      })
      .filter(o => o.title || o.variants.length);

    return { name, sku, price, descriptionHtml, descriptionText, specs: charsRows, images: [...new Set(imgs)], options };
  });
}

(async () => {
  const all = [];
  for (const cat of Object.keys(cards)) {
    for (const c of cards[cat]) {
      all.push({ cat, card: c });
    }
  }
  console.log(`Total products to scrape: ${all.length}`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36',
    viewport: { width: 1366, height: 900 },
  });

  // Parallelize with 4 pages
  const CONCURRENCY = 4;
  const results = {};
  for (const cat of Object.keys(cards)) results[cat] = [];

  let idx = 0;
  const pages = await Promise.all(Array.from({ length: CONCURRENCY }, () => context.newPage()));

  await Promise.all(pages.map(async (page) => {
    while (true) {
      const my = idx++;
      if (my >= all.length) break;
      const { cat, card } = all[my];
      try {
        const d = await extractDetail(page, card.href);
        results[cat].push({ ...card, detail: d });
        if (my % 10 === 0) console.log(`[${my}/${all.length}] ${cat} · ${card.name.slice(0, 50)}`);
      } catch (e) {
        console.log(`  FAIL [${my}] ${card.href}: ${e.message}`);
        results[cat].push({ ...card, detail: null });
      }
    }
  }));

  fs.writeFileSync(OUT, JSON.stringify(results, null, 2));
  console.log(`\nWrote → ${OUT}`);
  await browser.close();
})();
