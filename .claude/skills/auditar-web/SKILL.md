---
name: auditar-web
description: Audita el sitio del proyecto en accesibilidad, responsive, SEO técnico (metadata, Open Graph, sitemap, robots), enlaces rotos y contenido o estilos hardcodeados, y entrega hallazgos priorizados con evidencia. Úsala cuando pidan revisar, auditar o dejar listo el sitio antes de entregarlo.
argument-hint: "[ruta opcional, p. ej. /demo/lead-crm]"
---

# Auditar web

Solo lectura: no corrijas nada hasta que el usuario elija qué arreglar.

## 1. Preparar evidencia

1. `npm run check`. Anota cualquier error de typecheck, lint (incluye jsx-a11y), build o enlaces.
2. `npm run shots`. Anota los avisos «⚠ scroll horizontal».
3. Arranca el preview (`kaizen-preview` en `.claude/launch.json`, puerto 4322) para revisar con Playwright.

## 2. Revisar por categoría

**Accesibilidad (WCAG 2.2 AA)**

- Un `<h1>` por página y jerarquía sin saltos; landmarks `header`/`nav`/`main`/`footer`.
- Recorrido con teclado (Playwright `browser_press_key` Tab): skip link, orden lógico, foco visible, sin trampas.
- Formularios: `label` visible, `aria-invalid`, `aria-describedby`, error junto al campo, resumen enfocable.
- Contraste: calcula los pares de `tokens.css` que se usan juntos (texto 4.5:1, UI 3:1).
- Imágenes con `alt` (vacío solo si son decorativas); objetivos táctiles ≥ 44px.

**Responsive**

- Capturas de 390px y 1440px: desbordes, texto cortado, menú móvil usable, CTA visible.

**SEO técnico** (revisa el HTML de `dist/`)

- `<title>` ≤ 60 y `description` ≤ 160 únicos por página; `canonical`; `lang`.
- Open Graph: `og:title`, `og:description`, `og:image` (existe el archivo y mide 1200×630), `og:url`.
- `sitemap-index.xml` incluye las páginas públicas; `robots.txt` apunta al sitemap.
- Demos y 404 con `noindex`. `site.config.json` no debe seguir con `https://example.com` en producción.

**Enlaces**

- Resultado de `npm run links` (internos y anclas). Lista los externos para revisión manual.

**Contenido y estilos hardcodeados**

- Busca texto visible dentro de componentes: `rg ">[^<{}]*[A-Za-zÁÉÍÓÚáéíóúñ]{3,}[^<{}]*<" src/components src/demo src/pages -g "*.astro" -g "*.tsx"`.
- Busca valores de marca sueltos: `rg "#[0-9a-fA-F]{3,8}\b|rgb\(|hsl\(|font-family" src -g "!tokens.css"`.
- Precios o cifras fuera de `src/content/`. `TODO-MARCA` pendientes en `tokens.css` y `public/`.
- Demos: cada función con StatusBadge (Disponible / Prototipo / Pendiente) y aviso de datos ficticios.

## 3. Entregar hallazgos priorizados

Tabla ordenada por prioridad:

| Prioridad | Categoría | Hallazgo | Evidencia (archivo:línea o captura) | Arreglo propuesto |
| --------- | --------- | -------- | ----------------------------------- | ----------------- |

- **P1 Bloquea entrega:** falla de check, error de accesibilidad que impide usar el sitio, enlace roto, datos reales en demo.
- **P2 Importante:** contraste insuficiente, SEO faltante, hardcode, desborde en móvil.
- **P3 Mejora:** pulido visual o de copy.

## 4. Veredicto de entrega

Contrasta con `docs/calidad.md` (reglas, umbrales y checklist):

| Regla                                   | Resultado | Evidencia |
| --------------------------------------- | --------- | --------- |
| Sin datos reales                        | ✅/❌     | …         |
| Contenido fuera del código              |           |           |
| Marca solo desde tokens                 |           |           |
| Controles automáticos (`npm run check`) |           |           |
| Recorrido 390 px / 1440 px              |           |           |
| Licencias                               |           |           |
| Estado honesto                          |           |           |

**Veredicto: lista / no lista** (motivo en una línea). Cualquier P1 = no lista.
Cierra con qué se verificó, qué no se pudo verificar y la ruta de las capturas.
