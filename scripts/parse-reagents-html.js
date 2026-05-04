// Parses the static reagents HTML files to extract the 16 tab blocks + manufacturer cards.
// The Tilda t431 tabs block embeds tab titles and content directly in the HTML, just hidden via CSS.
const fs = require('fs');
const path = require('path');

const reagentsHtml = fs.readFileSync('C:/Work/viena/reagents-dump.html', 'utf8');
const scienceHtml = fs.readFileSync('C:/Work/viena/science-dump.html', 'utf8');
const OUT = path.join(__dirname, '..', 'data', 'scraped', 'reagents-extra.json');

function decode(s) {
  if (!s) return '';
  return s
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// 1. Reagent tabs — titles are in the tab navigation (<a href="#!/tab/NNN-K">Title</a>)
function parseReagentTabs(html) {
  const tabs = [];
  // Match the tab navigation buttons with their titles
  const tabBtns = html.matchAll(/<a[^>]*href="#!\/tab\/\d+-(\d+)"[^>]*>([\s\S]*?)<\/a>/g);
  for (const m of tabBtns) {
    const idx = parseInt(m[1], 10);
    const title = decode(m[2]);
    if (title && !tabs.find(t => t.idx === idx)) {
      tabs.push({ idx, title });
    }
  }
  tabs.sort((a, b) => a.idx - b.idx);
  // For each tab, content lives in an element like <div id="tabs_..." data-tabs-content="N">
  // or more commonly t431 puts content in <div class="t431__tabscontent">... with data-tab-index
  // Fallback: Tilda often shows tab content as plain text sections — we'll use description text from tab nav sibling
  const tabContents = {};
  const contentBlocks = [...html.matchAll(/<div[^>]*class="[^"]*t431__tabscontent[^"]*"[^>]*data-tab-index="(\d+)"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/g)];
  for (const m of contentBlocks) {
    tabContents[parseInt(m[1], 10)] = decode(m[2]);
  }
  // Try alt extraction — sometimes tab panels have their description inline in tab buttons
  return tabs.map(t => ({
    title: t.title,
    description: tabContents[t.idx] || '',
  }));
}

// 2. Science manufacturers — t107 or t492/t776 style item blocks
function parseManufacturers(html) {
  const out = [];
  // Look for img+title pairs in cover blocks. The page has blocks like t107__item with image + name + description.
  // Scan for big image divs with data-original
  const imgBlocks = [...html.matchAll(/<div[^>]*class="[^"]*(?:t107__item|t492__item|t776__item|t778__item|t-col[^"]*)[^"]*"[^>]*>([\s\S]*?)(?=<div[^>]*class="[^"]*(?:t107__item|t492__item|t776__item|t778__item|t-col[^"]*row)|<\/section)/g)];
  const known = ['thermo', 'nimagen', 'illumina', 'qiagen', 'promega', 'miltenyi', 'new_eng', 'biolab'];
  // Simpler fallback — grep large PNG/JPG from tildacdn and nearest strong/p text block
  const imgRefs = [...html.matchAll(/src="(https:\/\/static\.tildacdn\.biz\/[^"]+\.(?:jpg|jpeg|png|webp))"/gi)];
  return { imgBlocks: imgBlocks.length, imgRefs: imgRefs.length };
}

const tabs = parseReagentTabs(reagentsHtml);
console.log('reagent tabs:', tabs.length);
for (const t of tabs) console.log('  -', t.title, '| descr len=', t.description.length);

const man = parseManufacturers(scienceHtml);
console.log('\nmanufacturers raw:', man);

fs.writeFileSync(OUT, JSON.stringify({ reagentTabs: tabs }, null, 2));
console.log('\nWrote:', OUT);
