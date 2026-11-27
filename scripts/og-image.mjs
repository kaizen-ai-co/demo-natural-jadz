// Genera public/og-default.png (1200×630) con el nombre del sitio y los tokens de marca.
// Correr cuando cambie la marca: npm run og
import { readFileSync } from "node:fs";
import { chromium } from "@playwright/test";

const site = JSON.parse(readFileSync("src/content/site.config.json", "utf8"));
const tokens = readFileSync("src/styles/tokens.css", "utf8");
const esc = (s) =>
  s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

const html = `<!doctype html><html><head><style>${tokens}
  body{margin:0;width:1200px;height:630px;display:flex;flex-direction:column;justify-content:center;
  padding:0 96px;box-sizing:border-box;background:var(--k-color-primary);color:var(--k-color-primary-fg);
  font-family:var(--k-font-display)}
  h1{font-size:96px;margin:0;line-height:1.05} p{font-size:36px;margin:32px 0 0;max-width:900px;opacity:.92}
</style></head><body><h1>${esc(site.name)}</h1><p>${esc(site.description)}</p></body></html>`;

const browser = await chromium.launch({ channel: "chrome" }).catch(() => chromium.launch());
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html);
await page.screenshot({ path: "public/og-default.png" });
await browser.close();
console.log("✔ public/og-default.png");
