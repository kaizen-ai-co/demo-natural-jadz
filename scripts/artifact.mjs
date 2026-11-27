// Convierte dist/ en una página publicable como Artifact de claude.ai: rutas relativas (./assets, ./marca),
// sin esqueleto propio (la publicación agrega charset UTF-8 y viewport). Uso: npm run build && npm run artifact
import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const [, , DIST, OUT] = process.argv;
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
for (const d of ["_astro", "marca"])
  cpSync(join(DIST, d), join(OUT, d === "_astro" ? "assets" : d), { recursive: true });
cpSync(join(DIST, "favicon.svg"), join(OUT, "favicon.svg"));

const rel = (s) =>
  s
    .replace(/(["'(`])\/(_astro|marca)\//g, (_m, a, b) => `${a}./${b === "_astro" ? "assets" : b}/`)
    .replace(/(&quot;)\/(_astro|marca)\//g, (_m, a, b) => `${a}./${b === "_astro" ? "assets" : b}/`)
    .replace(/href="\/favicon\.svg"/g, 'href="favicon.svg"');

for (const f of readdirSync(join(OUT, "assets"))) {
  if (f.endsWith(".js") || f.endsWith(".css")) {
    const p = join(OUT, "assets", f);
    writeFileSync(p, rel(readFileSync(p, "utf8")));
  }
}

const html = readFileSync(join(DIST, "index.html"), "utf8");
const head = html.match(/<head>([\s\S]*?)<\/head>/)[1];
const bodyTag = html.match(/<body([^>]*)>/)[1];
const body = html.match(/<body[^>]*>([\s\S]*?)<\/body>/)[1];
const bodyClass = (bodyTag.match(/class="([^"]*)"/) || [])[1] || "";

const headLimpio = head
  .replace(/<meta charset[^>]*>/, "")
  .replace(/<meta name="viewport"[^>]*>/, "")
  .replace(/<title>[\s\S]*?<\/title>/, "")
  .replace(/<link rel="canonical"[^>]*>/, "")
  .replace(/<link rel="sitemap"[^>]*>/, "")
  .replace(/<meta property="og:[^>]*>/g, "")
  .replace(/<meta name="twitter:[^>]*>/g, "");

const pagina = `<title>Demo Natural Jadz</title>
${rel(headLimpio)}
<style>body{background:var(--k-color-bg);color:var(--k-color-fg)}</style>
<div class="${bodyClass}">
${rel(body).replace(/href="\/"/g, 'href="#tablero"')}
</div>
`;
writeFileSync(join(OUT, "demo-natural-jadz.html"), pagina);

const restantes = pagina.match(/(src|href|component-url|renderer-url)="\/[^"]*"/g) || [];
console.log("archivos:", readdirSync(OUT), "rutas absolutas restantes:", restantes);
