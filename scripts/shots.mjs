// Capturas de evidencia en 390px (móvil) y 1440px (escritorio) de todas las páginas de dist/.
// Uso: npm run build && npm run shots   → archivos en screenshots/<fecha>/
// Usa Chrome instalado; si no existe, Chromium de Playwright (npx playwright install chromium).
import { spawn } from "node:child_process";
import { mkdirSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";
import { chromium } from "@playwright/test";

const PORT = 4322;
const BASE = `http://localhost:${PORT}`;
const WIDTHS = [
  { name: "390", width: 390, height: 844 },
  { name: "1440", width: 1440, height: 900 },
];

if (!existsSync("dist")) {
  console.error("No existe dist/. Corre primero: npm run build");
  process.exit(1);
}

const routes = [];
(function walk(dir) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) walk(p);
    else if (n === "index.html") routes.push("/" + relative("dist", dir).split("\\").join("/"));
  }
})("dist");
const paths = routes.map((r) => (r === "/" ? "/" : r.replace(/^\/+/, "/") + "/"));

const server = spawn(`npx astro preview --port ${PORT}`, { shell: true, stdio: "ignore" });
const stop = () => {
  if (process.platform === "win32") spawn("taskkill", ["/pid", String(server.pid), "/f", "/t"]);
  else server.kill();
};

async function waitForServer() {
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(BASE)).ok) return;
    } catch {
      /* aún no arranca */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error("El servidor de preview no arrancó");
}

const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
const out = join("screenshots", stamp);
mkdirSync(out, { recursive: true });

let browser;
try {
  await waitForServer();
  browser = await chromium.launch({ channel: "chrome" }).catch(() => chromium.launch());
  for (const w of WIDTHS) {
    const page = await browser.newPage({ viewport: { width: w.width, height: w.height } });
    for (const p of paths) {
      await page.goto(BASE + p, { waitUntil: "networkidle" });
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
      );
      const file = join(
        out,
        `${(p.replace(/\//g, "_") || "_").replace(/^_|_$/g, "") || "inicio"}-${w.name}.png`,
      );
      await page.screenshot({ path: file, fullPage: true });
      console.log(`${overflow ? "⚠ scroll horizontal" : "✔"} ${w.name}px ${p} → ${file}`);
    }
    await page.close();
  }
} catch (e) {
  console.error("✖", e.message);
  process.exitCode = 1;
} finally {
  await browser?.close();
  stop();
}
