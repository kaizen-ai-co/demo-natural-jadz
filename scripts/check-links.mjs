// Revisa enlaces internos y anclas en dist/ (correr después de `npm run build`).
// Externos no se consultan para no depender de la red; se listan para revisión manual.
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, relative, posix } from "node:path";

const DIST = "dist";
if (!existsSync(DIST)) {
  console.error("No existe dist/. Corre primero: npm run build");
  process.exit(1);
}

const htmlFiles = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (name.endsWith(".html")) htmlFiles.push(p);
  }
})(DIST);

const idsByFile = new Map();
const routeOf = (file) => {
  const r = "/" + relative(DIST, file).split("\\").join("/");
  return r.replace(/index\.html$/, "").replace(/\.html$/, "");
};
for (const f of htmlFiles) {
  const html = readFileSync(f, "utf8");
  idsByFile.set(routeOf(f), new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
}

const resolveTarget = (path) => {
  const clean = path.replace(/\/$/, "") || "/";
  const candidates = [clean, clean + "/", clean === "/" ? "/" : clean + "/"];
  for (const c of candidates) if (idsByFile.has(c)) return c;
  const asset = join(DIST, decodeURIComponent(clean));
  return existsSync(asset) && statSync(asset).isFile() ? "asset" : null;
};

const broken = [];
const external = new Set();
for (const f of htmlFiles) {
  const from = routeOf(f);
  const html = readFileSync(f, "utf8");
  for (const [, href] of html.matchAll(/<a\s[^>]*href="([^"]+)"/g)) {
    if (/^(mailto:|tel:|https?:)/.test(href)) {
      if (href.startsWith("http")) external.add(href);
      continue;
    }
    const [pathPart, hash] = href.split("#");
    const path = pathPart === "" ? from : posix.resolve(posix.dirname(from + "x"), pathPart);
    const target = resolveTarget(path);
    if (!target) broken.push(`${from} → ${href} (no existe la página)`);
    else if (hash && target !== "asset" && !idsByFile.get(target)?.has(hash))
      broken.push(`${from} → ${href} (no existe el ancla #${hash})`);
  }
}

if (external.size)
  console.log(
    `Enlaces externos para revisar a mano (${external.size}):\n  ${[...external].join("\n  ")}`,
  );
if (broken.length) {
  console.error(`\n✖ ${broken.length} enlace(s) roto(s):\n  ${broken.join("\n  ")}`);
  process.exit(1);
}
console.log(`✔ Enlaces internos OK en ${htmlFiles.length} página(s).`);
