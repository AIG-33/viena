// Scrapes the tabbed informational reagent page and the science-reagents manufacturers page.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, '..', 'data', 'scraped');
fs.mkdirSync(OUT_DIR, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36',
    viewport: { width: 1366, height: 2200 },
  });
  const page = await context.newPage();

  // 1. Reagents page with tabs
  console.log('=== reagents (tabbed) ===');
  await page.goto('https://viena.by/catalog_reagents', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(2000);
  // Expand all tabs (click each to render its content)
  const tabCount = await page.evaluate(() => document.querySelectorAll('.t431__tabscontent').length);
  console.log('tab count:', tabCount);
  // Expand them all via JS: show every panel
  await page.evaluate(() => {
    document.querySelectorAll('.t431__tabscontent').forEach(el => {
      el.style.display = 'block';
      el.style.visibility = 'visible';
      el.style.height = 'auto';
      el.style.opacity = '1';
    });
  });
  await page.waitForTimeout(500);

  const reagentTabs = await page.evaluate(() => {
    const panels = Array.from(document.querySelectorAll('.t431__tabscontent'));
    return panels.map((panel, idx) => {
      // Title may be in related tab button, but also the panel has header
      const title = panel.querySelector('.t431__title, .t-name, h2, h3')?.textContent?.trim() || '';
      const descrEl = panel.querySelector('.t-descr, .t-text, .t431__text');
      const description = descrEl?.textContent?.trim() || panel.textContent.slice(0, 500).trim();
      const img = panel.querySelector('img')?.getAttribute('data-original') ||
                  panel.querySelector('img')?.src ||
                  (panel.querySelector('[style*="background-image"]')?.style.backgroundImage.match(/url\(['"]?([^'")]+)['"]?\)/) || [])[1] || '';
      return { idx, title, description, img };
    });
  });

  // Also collect tab names from the tab nav
  const tabNames = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.t431__tab, .t431__tabtitle, .t431 a[href*="#!/tab/"]'))
      .map(el => el.textContent.trim())
      .filter(Boolean);
  });
  console.log('tab names:', tabNames);

  // 2. Scientific-reagents manufacturers
  console.log('\n=== scientific-reagents (manufacturers) ===');
  await page.goto('https://viena.by/reagents_science', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(2000);

  const manufacturers = await page.evaluate(() => {
    // Look for card-like blocks with image + title + text
    const containers = document.querySelectorAll('.t-col, .t107__item, .t492__item, .t542__item, .t776__item, .t778__item, [class*="__item"]');
    const seen = new Set();
    const out = [];
    containers.forEach(c => {
      const img = c.querySelector('img');
      const imgSrc = img?.getAttribute('data-original') || img?.src || '';
      if (!imgSrc || imgSrc.includes('viena.png') || seen.has(imgSrc)) return;
      const title = (c.querySelector('.t-name, .t-title, h2, h3, h4, .t-heading')?.textContent || '').trim();
      const descr = (c.querySelector('.t-descr, .t-text, p')?.textContent || '').trim();
      if (!title || title.length > 60) return;
      seen.add(imgSrc);
      out.push({ title, description: descr, img: imgSrc });
    });
    return out;
  });

  fs.writeFileSync(path.join(OUT_DIR, 'reagents-extra.json'), JSON.stringify({ reagentTabs, tabNames, manufacturers }, null, 2));
  console.log(`\nWrote reagents-extra.json — ${reagentTabs.length} tabs, ${manufacturers.length} manufacturers`);

  await browser.close();
})();
