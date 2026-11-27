// Hook PostToolUse (Edit|Write): si se editó contenido (src/content/**/*.json) o los esquemas,
// valida con `astro sync` en el acto. Si falla, devuelve el error a Claude con código 2 para
// que lo corrija en el mismo turno. (Los fixtures de src/demo los valida el typecheck.)
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { relative, resolve } from "node:path";

const RELEVANTE = /^src\/(content\/.+\.(json|ts)|content\.config\.ts)$/;

let entrada = "";
process.stdin.on("data", (d) => (entrada += d));
process.stdin.on("end", () => {
  let payload = {};
  try {
    payload = JSON.parse(entrada || "{}");
  } catch {
    process.exit(0);
  }
  const proyecto = process.env.CLAUDE_PROJECT_DIR || payload.cwd || process.cwd();
  const ruta = payload.tool_input?.file_path;
  if (!ruta) process.exit(0);
  const rel = relative(proyecto, resolve(proyecto, ruta)).replace(/\\/g, "/");
  if (!RELEVANTE.test(rel)) process.exit(0);

  const astro = resolve(proyecto, "node_modules", "astro", "bin", "astro.mjs");
  if (!existsSync(astro)) process.exit(0); // sin npm install todavía

  const r = spawnSync(process.execPath, [astro, "sync"], {
    cwd: proyecto,
    encoding: "utf8",
    timeout: 50000,
    env: { ...process.env, ASTRO_TELEMETRY_DISABLED: "1", FORCE_COLOR: "0" },
  });
  if (r.status !== 0) {
    const salida = `${r.stdout}\n${r.stderr}`.replace(/\x1b\[[0-9;]*m/g, "").trim();
    process.stderr.write(
      `El contenido no pasó la validación de esquema tras editar ${rel}. Corrígelo antes de seguir:\n${salida.split("\n").slice(-25).join("\n")}`,
    );
    process.exit(2);
  }
  process.exit(0);
});
