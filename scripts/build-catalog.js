// Builds final catalog JSON + downloads all images via plain Node https (no headless browser).
// 1) Parses details.json, extracts specs/description/options cleanly.
// 2) Downloads first image per product into public/images/products/ with a stable filename.
// 3) Emits 8 category JSON files matching the existing Product schema (+ optional options[]).
const fs = require('fs');
const path = require('path');
const https = require('https');
const { URL } = require('url');

const ROOT = path.resolve(__dirname, '..');
const DETAILS = require(path.join(ROOT, 'data', 'scraped', 'details.json'));
const EXTRAS = require(path.join(ROOT, 'data', 'scraped', 'reagents-extra.json'));
const REAGENT_TABLES = require(path.join(ROOT, 'data', 'scraped', 'reagent-tables.json'));
const IMG_DIR = path.join(ROOT, 'public', 'images', 'products');
fs.mkdirSync(IMG_DIR, { recursive: true });

// ── Transliteration for slugs ──
const CYR = {
  а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ё:'e',ж:'zh',з:'z',и:'i',й:'i',к:'k',л:'l',м:'m',н:'n',
  о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',х:'h',ц:'ts',ч:'ch',ш:'sh',щ:'sch',ъ:'',ы:'y',ь:'',
  э:'e',ю:'yu',я:'ya'
};
function slugify(text, fallback='item') {
  const s = (text || fallback).toLowerCase()
    .split('').map(c => CYR[c] ?? c).join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return s || fallback;
}

// ── HTML → text + spec extraction ──
function decodeHtml(s) {
  return (s || '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&laquo;/g, '«').replace(/&raquo;/g, '»')
    .replace(/&mdash;/g, '—').replace(/&ndash;/g, '–')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}
function stripTags(s) { return decodeHtml(s || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(); }

// Parse Tilda's `.js-store-prod-charcs` paragraphs out of descriptionHtml
function parseDetail(html, descrText) {
  // Find "Key: Value" from <p class="...js-store-prod-charcs">Key: Value</p>
  const specs = [];
  const pRe = /<p[^>]*class="[^"]*js-store-prod-charcs[^"]*"[^>]*>([\s\S]*?)<\/p>/g;
  let m;
  while ((m = pRe.exec(html)) !== null) {
    const line = stripTags(m[1]);
    const idx = line.indexOf(':');
    if (idx > 0) {
      const key = line.slice(0, idx).trim();
      const val = line.slice(idx + 1).trim();
      if (key && val) specs.push({ key, value: val });
    }
  }
  // Description: content of the first <div class="js-store-prod-all-text">…</div>
  const descrMatch = /<div[^>]*class="[^"]*js-store-prod-all-text[^"]*"[^>]*>([\s\S]*?)<\/div>/.exec(html);
  let description = '';
  if (descrMatch) {
    description = stripTags(descrMatch[1])
      .replace(/Узнать больше/gi, '')
      .replace(/Производитель\s*[aа]*\s*/i, 'Производитель ')
      .trim();
  }
  if (!description) {
    // Fall back to first 400 chars of descrText
    description = (descrText || '').split(/\n|(?=[А-Я][а-я]+,\s*мл|Объем|Цвет|Артикул)/)[0].trim().slice(0, 400);
  }
  return { specs, description };
}

// ── Download images ──
function httpGet(url, dest) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { timeout: 15000, headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return httpGet(res.headers.location, dest).then(resolve, reject);
      }
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error('HTTP ' + res.statusCode));
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => file.close(() => resolve(dest)));
      file.on('error', reject);
    });
    req.on('timeout', () => req.destroy(new Error('timeout')));
    req.on('error', reject);
  });
}

async function downloadAll(queue, concurrency = 8) {
  let i = 0, done = 0;
  const run = async () => {
    while (true) {
      const my = i++;
      if (my >= queue.length) break;
      const { url, dest } = queue[my];
      if (fs.existsSync(dest)) { done++; continue; }
      try {
        await httpGet(url, dest);
      } catch (e) {
        console.log(`  skip ${path.basename(dest)}: ${e.message}`);
      }
      done++;
      if (done % 25 === 0) console.log(`  images ${done}/${queue.length}`);
    }
  };
  await Promise.all(Array.from({ length: concurrency }, run));
}

// ── Build ──
function extFromUrl(u) {
  const m = /\.([a-z0-9]{3,4})(?:\?|$)/i.exec(u);
  return (m ? m[1] : 'jpg').toLowerCase();
}

// Manufacturer from description text (extracted if present near "Производитель")
function extractManufacturer(text) {
  const m = /Производитель[:\s]+([A-ZА-Я][A-Za-zА-Яа-я0-9 .&\-®®™]{2,60})/.exec(text);
  return m ? m[1].trim().replace(/\s{2,}/g, ' ') : undefined;
}

function buildCategory(catId, catPrefix, items) {
  const out = [];
  const usedSlugs = new Set();
  const imgQueue = [];
  items.forEach((p, idx) => {
    const id = `${catPrefix}-${String(idx + 1).padStart(3, '0')}`;
    let slug = slugify(p.name);
    // Ensure unique slugs within category
    let unique = slug; let n = 2;
    while (usedSlugs.has(unique)) { unique = `${slug}-${n++}`; }
    usedSlugs.add(unique);
    slug = unique;

    const detail = p.detail || {};
    const { specs, description: parsedDescr } = parseDetail(detail.descriptionHtml || '', detail.descriptionText || '');
    const skuText = (p.description || '').replace(/^Артикул[:\s]*/i, '').trim();
    const rawSku = detail.sku || skuText || '';
    const catalogNumber = rawSku.replace(/^Артикул[:\s]*/i, '').trim() || undefined;
    const manufacturer = extractManufacturer(detail.descriptionText || '');
    // Description: prefer the HTML-parsed paragraph; if empty, compose from name + key specs
    let description = parsedDescr;
    if (!description || description.length < 20) {
      const specSummary = specs.slice(0, 3).map(s => `${s.key}: ${s.value}`).join(', ');
      description = specSummary ? `${p.name}. ${specSummary}.` : p.name + '.';
    }
    const shortDescription = description.length > 160 ? description.slice(0, 157) + '…' : description;

    // Images — dedupe by basename (ignoring format suffix) since Tilda serves same asset as .jpg and .jpg.webp
    const rawUrls = (detail.images?.length ? detail.images : (p.image ? [p.image] : [])).filter(Boolean);
    const seenBases = new Set();
    const urls = [];
    for (const u of rawUrls) {
      const tail = (u.split('/').pop() || '').split('?')[0];
      const base = tail.replace(/\.webp$/i, '').replace(/\.(jpg|jpeg|png|gif)$/i, '');
      if (seenBases.has(base)) continue;
      seenBases.add(base);
      // Prefer the non-optim (static) URL if both were seen (they're captured in order; first wins)
      urls.push(u);
    }
    const imageFiles = [];
    urls.slice(0, 4).forEach((url, j) => {
      const ext = extFromUrl(url);
      const fname = j === 0 ? `${slug}.${ext}` : `${slug}-${j + 1}.${ext}`;
      imageFiles.push(`/images/products/${fname}`);
      imgQueue.push({ url, dest: path.join(IMG_DIR, fname) });
    });

    // Options
    const options = (detail.options || []).filter(o => o.title && o.variants?.length).map(o => ({
      title: o.title.trim(),
      variants: [...new Set(o.variants.map(v => v.trim()).filter(Boolean))],
    }));

    out.push({
      id,
      slug,
      name: p.name,
      shortDescription,
      description,
      categoryId: catId,
      images: imageFiles,
      specs,
      options,
      tags: [],
      featured: idx < 4,
      inStock: true,
      catalogNumber,
      manufacturer,
      createdAt: '2024-01-01',
    });
  });
  return { products: out, imgQueue };
}

function buildInfoCategory(catId, catPrefix, items, imgFallback, tablesByTitle) {
  return items.map((it, idx) => {
    const table = tablesByTitle ? tablesByTitle[it.title] : null;
    const specsExtra = [];
    if (table && table.rows.length) {
      specsExtra.push({ key: 'Количество позиций', value: String(table.rows.length) });
    }
    return {
      id: `${catPrefix}-${String(idx + 1).padStart(3, '0')}`,
      slug: slugify(it.title),
      name: it.title,
      shortDescription: it.description.slice(0, 160),
      description: it.description,
      categoryId: catId,
      images: imgFallback ? [imgFallback] : [],
      specs: [
        ...(it.country ? [{ key: 'Страна', value: it.country }] : []),
        ...specsExtra,
      ],
      options: [],
      dataTable: table && table.rows.length
        ? { title: 'Каталог наборов', header: table.header, rows: table.rows }
        : undefined,
      tags: [],
      featured: idx < 3,
      inStock: true,
      createdAt: '2024-01-01',
    };
  });
}

(async () => {
  const CATS = [
    { id: 'consumables',          prefix: 'cons' },
    { id: 'vacuum-systems',       prefix: 'vac' },
    { id: 'equipment',            prefix: 'eq' },
    { id: 'pathomorphology',      prefix: 'pat' },
    { id: 'veterinary',           prefix: 'vet' },
    { id: 'lancets',              prefix: 'lan' },
  ];

  const allImgs = [];
  const outByCat = {};

  for (const c of CATS) {
    const items = DETAILS[c.id] || [];
    const { products, imgQueue } = buildCategory(c.id, c.prefix, items);
    outByCat[c.id] = products;
    allImgs.push(...imgQueue);
    console.log(`${c.id}: ${products.length} products, ${imgQueue.length} images to download`);
  }

  // Info-only categories
  const reagentTablesByTitle = {};
  for (const t of REAGENT_TABLES) reagentTablesByTitle[t.tab] = t;
  outByCat['reagents'] = buildInfoCategory('reagents', 'rea', EXTRAS.reagentTabs, undefined, reagentTablesByTitle);
  outByCat['scientific-reagents'] = buildInfoCategory('scientific-reagents', 'sci', EXTRAS.manufacturers);

  console.log(`\nDownloading ${allImgs.length} images…`);
  await downloadAll(allImgs, 10);
  console.log('done downloading');

  // Write each category file
  for (const cat of Object.keys(outByCat)) {
    const file = path.join(ROOT, 'data', 'products', `${cat}.json`);
    fs.writeFileSync(file, JSON.stringify(outByCat[cat], null, 2));
    console.log(`wrote ${file} (${outByCat[cat].length})`);
  }
})();
