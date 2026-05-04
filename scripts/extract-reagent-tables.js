// Extracts the 16 reagent tab tables from the static reagents HTML.
// Data format: tab title + <div class="t431__data-part1"> header ; separated + <div class="t431__data-part2"> rows (\n separated, ; inside row)
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync('C:/Work/viena/reagents-dump.html', 'utf8');

function decode(s) {
  return (s || '')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'").replace(/&laquo;/g, '«').replace(/&raquo;/g, '»')
    .replace(/&mdash;/g, '—').replace(/&ndash;/g, '–').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}
function strip(s) { return decode(s || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(); }

// Tab titles in order
const tabs = [];
const tabBtnRe = /<a[^>]*href="#!\/tab\/\d+-(\d+)"[^>]*>([\s\S]*?)<\/a>/g;
let m;
while ((m = tabBtnRe.exec(html)) !== null) {
  const idx = parseInt(m[1], 10);
  const title = strip(m[2]);
  if (title && !tabs.find(t => t.idx === idx)) tabs.push({ idx, title });
}
tabs.sort((a, b) => a.idx - b.idx);
console.log('Tab titles:', tabs.length);

// Data parts — there are pairs of part1/part2 divs per tab
const headerRe = /<div[^>]*class="[^"]*t431__data-part1[^"]*"[^>]*>([\s\S]*?)<\/div>/g;
const rowsRe = /<div[^>]*class="[^"]*t431__data-part2[^"]*"[^>]*>([\s\S]*?)<\/div>/g;

const headers = [];
while ((m = headerRe.exec(html)) !== null) headers.push(strip(m[1]));
const rowBlocks = [];
while ((m = rowsRe.exec(html)) !== null) rowBlocks.push(m[1]);

console.log('headers:', headers.length, '· rowBlocks:', rowBlocks.length);

function parseCsv(s) {
  // Split by real newlines (or <br>) for rows, by ';' for cells
  const lines = decode(s)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean);
  return lines.map(l => l.split(';').map(c => c.trim()));
}

const tables = tabs.map((t, i) => {
  const header = headers[i] ? headers[i].split(';').map(s => s.trim()) : [];
  const rowsRaw = rowBlocks[i] || '';
  const rows = parseCsv(rowsRaw);
  return { tab: t.title, header, rows };
});

console.log('\n=== Sample: first tab ===');
console.log('tab:', tables[0].tab);
console.log('header:', tables[0].header);
console.log('row 0:', tables[0].rows[0]);
console.log('row 1:', tables[0].rows[1]);
console.log('total rows:', tables[0].rows.length);

console.log('\n=== Row counts per tab ===');
for (const t of tables) console.log(' ', t.tab.padEnd(35), 'header=', t.header.length, 'rows=', t.rows.length);

const OUT = path.join(__dirname, '..', 'data', 'scraped', 'reagent-tables.json');
fs.writeFileSync(OUT, JSON.stringify(tables, null, 2));
console.log('\nWrote:', OUT);
