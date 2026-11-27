// Verifica contraste WCAG AA de los pares de tokens que se usan juntos.
// Correr después de cambiar src/styles/tokens.css: npm run contrast
import { readFileSync } from "node:fs";

const css = readFileSync("src/styles/tokens.css", "utf8");
const tokens = Object.fromEntries(
  [...css.matchAll(/--(k-[\w-]+):\s*(#[0-9a-fA-F]{6})\b/g)].map((m) => [m[1], m[2]]),
);

// [texto, fondo, mínimo] — 4.5 texto normal, 3 componentes de UI y foco
const PAIRS = [
  ["k-color-fg", "k-color-bg", 4.5],
  ["k-color-fg", "k-color-surface", 4.5],
  ["k-color-muted", "k-color-bg", 4.5],
  ["k-color-muted", "k-color-surface", 4.5],
  ["k-color-primary", "k-color-bg", 4.5],
  ["k-color-primary-fg", "k-color-primary", 4.5],
  ["k-color-accent-fg", "k-color-accent", 4.5],
  ["k-color-danger", "k-color-bg", 4.5],
  ["k-color-success", "k-color-bg", 4.5],
  ["k-status-available", "k-color-bg", 4.5],
  ["k-status-prototype", "k-color-bg", 4.5],
  ["k-status-pending", "k-color-bg", 4.5],
  ["k-color-focus", "k-color-bg", 3],
  ["k-color-border", "k-color-bg", 1], // informativo: bordes decorativos no exigen 3:1
];

const lum = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
};

let fails = 0;
for (const [fg, bg, min] of PAIRS) {
  if (!tokens[fg] || !tokens[bg]) {
    console.log(`? ${fg} / ${bg}: falta el token`);
    fails++;
    continue;
  }
  const r = ratio(tokens[fg], tokens[bg]);
  const ok = r >= min;
  if (!ok) fails++;
  console.log(`${ok ? "✔" : "✖"} ${r.toFixed(2)}:1 (mín ${min}) ${fg} sobre ${bg}`);
}
process.exit(fails ? 1 : 0);
