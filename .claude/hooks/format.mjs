// Hook PostToolUse (Edit|Write): formatea con Prettier SOLO el archivo editado.
// Nunca bloquea: cualquier problema se ignora y sale con código 0.
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { extname, relative, resolve, isAbsolute } from "node:path";

const EXTS = new Set([".astro", ".ts", ".tsx", ".js", ".mjs", ".json", ".css", ".md"]);

let input = "";
process.stdin.on("data", (d) => (input += d));
process.stdin.on("end", () => {
  try {
    const { tool_input: toolInput, cwd } = JSON.parse(input || "{}");
    const projectDir = process.env.CLAUDE_PROJECT_DIR || cwd || process.cwd();
    const file = toolInput?.file_path ? resolve(projectDir, toolInput.file_path) : null;
    if (!file || !existsSync(file) || !EXTS.has(extname(file).toLowerCase())) return;

    const rel = relative(projectDir, file);
    if (rel.startsWith("..") || isAbsolute(rel)) return; // fuera del proyecto
    if (/^(node_modules|dist|\.astro)[\\/]/.test(rel)) return;

    const prettier = resolve(projectDir, "node_modules", "prettier", "bin", "prettier.cjs");
    if (!existsSync(prettier)) return; // sin npm install todavía
    spawnSync(process.execPath, [prettier, "--write", "--ignore-unknown", rel], {
      cwd: projectDir,
      stdio: "ignore",
      timeout: 25000,
    });
  } catch {
    /* nunca bloquear la edición */
  }
  process.exit(0);
});
