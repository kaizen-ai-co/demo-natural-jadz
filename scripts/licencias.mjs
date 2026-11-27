// Cada archivo de public/ debe estar anotado en LICENCIAS.md por su nombre.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { basename, join } from "node:path";

const licencias = readFileSync("LICENCIAS.md", "utf8");
const archivos = [];
(function recorrer(dir) {
  if (!existsSync(dir)) return;
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) recorrer(p);
    else archivos.push(p);
  }
})("public");

// Archivos de configuración del hosting (_headers, _redirects) no son recursos.
const recursos = archivos.filter((p) => !basename(p).startsWith("_"));
const faltan = recursos.filter((p) => !licencias.includes(basename(p)));
if (faltan.length) {
  console.error(
    `✖ ${faltan.length} recurso(s) sin licencia en LICENCIAS.md:\n  ${faltan.join("\n  ")}`,
  );
  process.exit(1);
}
console.log(`✔ Los ${recursos.length} recursos de public/ tienen licencia anotada.`);
