// Rasterizes public/leo/crest.svg to the Leo PWA icon PNGs using the
// pre-installed Chromium (no network needed). Run: node scripts/gen-leo-icons.mjs
import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const svg = readFileSync(resolve(root, 'public/leo/crest.svg'), 'utf8');
const OUT = resolve(root, 'public/leo');

// maskable icons need a full-bleed background + safe-zone padding (~80% crest)
const targets = [
  { file: 'icon-192.png', size: 192, pad: 0, bg: 'transparent' },
  { file: 'icon-512.png', size: 512, pad: 0, bg: 'transparent' },
  { file: 'icon-maskable-512.png', size: 512, pad: 0.12, bg: '#fdf2db' },
  { file: 'apple-touch-icon.png', size: 180, pad: 0.06, bg: '#fdf2db' },
];

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium',
});
try {
  const page = await browser.newPage();
  for (const t of targets) {
    const inset = Math.round(t.size * t.pad);
    const html = `<!doctype html><html><head><style>
      html,body{margin:0;padding:0}
      .wrap{width:${t.size}px;height:${t.size}px;background:${t.bg};
        display:flex;align-items:center;justify-content:center}
      .crest{width:${t.size - inset * 2}px;height:${t.size - inset * 2}px}
    </style></head><body><div class="wrap"><div class="crest">${svg}</div></div></body></html>`;
    await page.setViewportSize({ width: t.size, height: t.size });
    await page.setContent(html, { waitUntil: 'networkidle' });
    const el = await page.$('.wrap');
    const buf = await el.screenshot({ omitBackground: t.bg === 'transparent' });
    writeFileSync(resolve(OUT, t.file), buf);
    console.log('wrote', t.file);
  }
} finally {
  await browser.close();
}
