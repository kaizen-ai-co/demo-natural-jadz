// Hook Stop: corre typecheck + lint al terminar un turno con cambios.
// Si fallan, AVISA con systemMessage (no bloquea). Siempre sale con código 0.
import { spawnSync } from "node:child_process";

const RELEVANT = /^(src\/|scripts\/|astro\.config|eslint\.config|tsconfig|package\.json)/;

let input = "";
process.stdin.on("data", (d) => (input += d));
process.stdin.on("end", () => {
  let payload = {};
  try {
    payload = JSON.parse(input || "{}");
  } catch {
    /* entrada vacía o inválida */
  }
  if (payload.stop_hook_active) process.exit(0); // evita bucles

  const cwd = process.env.CLAUDE_PROJECT_DIR || payload.cwd || process.cwd();
  const run = (cmd) =>
    spawnSync(cmd, { cwd, shell: true, encoding: "utf8", timeout: 150000, maxBuffer: 1 << 24 });

  // Con git: solo si hay cambios relevantes. Sin git (antes del primer commit): siempre.
  const status = run("git status --porcelain");
  if (status.status === 0) {
    const changed = status.stdout
      .split("\n")
      .map((l) => l.slice(3).trim().replace(/^"|"$/g, ""))
      .filter((f) => RELEVANT.test(f));
    if (changed.length === 0) process.exit(0);
  }

  const failures = [];
  for (const script of ["typecheck", "lint"]) {
    const r = run(`npm run --silent ${script}`);
    if (r.status !== 0) {
      const out = `${r.stdout}\n${r.stderr}`
        .replace(/\x1b\[[0-9;]*m/g, "")
        .split("\n")
        .filter((l) => /error|✖|warning/i.test(l) && !/^\d{2}:\d{2}:\d{2}/.test(l.trim()))
        .map((l) => l.trim())
        .slice(0, 8)
        .join("\n");
      failures.push(`${script}:\n${out || "(ver salida completa con npm run " + script + ")"}`);
    }
  }

  if (failures.length) {
    process.stdout.write(
      JSON.stringify({
        systemMessage: `⚠ Falló ${failures.length === 2 ? "typecheck y lint" : failures[0].split(":")[0]} (no bloquea, revísalo antes de decir «listo»):\n${failures.join("\n\n")}`,
      }),
    );
  }
  process.exit(0);
});
