---
name: crear-pagina
description: Crea una página nueva del sitio a partir de un JSON de contenido validado con Zod, reutilizando las secciones existentes antes de crear nuevas. Úsala cuando pidan una página, landing o ruta nueva en este proyecto.
argument-hint: "<slug> <propósito de la página>"
---

# Crear página

Objetivo: una ruta nueva cuyo contenido vive 100% en `src/content/pages/<slug>.json`.

## 1. Entender el pedido

- Slug (kebab-case, sin tildes), propósito, público y acción principal (CTA).
- Contenido real disponible. Si falta, usa textos de relleno marcados como «ejemplo» y lístalos al final.
- Precios: nunca los inventes. Usa «Por definir» salvo que te den el valor aprobado.

## 2. Reutilizar antes de crear

1. Lee `src/content/schemas.ts` (`sectionSchema`) y `src/components/sections/SectionRenderer.astro`.
2. Mapea cada bloque pedido a una sección existente: `hero`, `features`, `pricing`,
   `testimonials`, `faq`, `cta`. Prefiere ajustar el contenido antes que crear un tipo nuevo.
3. Solo si ningún tipo encaja, crea una sección nueva:
   - esquema `xxxSchema` en `schemas.ts` y agrégalo a `sectionSchema`;
   - componente `src/components/sections/Xxx.astro` con `aria-labelledby`, solo tokens, sin textos propios;
   - regístralo en `SectionRenderer.astro`.
     Explica por qué no servía ninguna existente.

## 3. Crear el contenido

- Crea `src/content/pages/<slug>.json` con `title` (≤ 60), `description` (≤ 160) y `sections`.
- El primer bloque será el `<h1>` (lo resuelve `SectionRenderer`).
- `id` de cada sección en kebab-case y único en la página (se usa para anclas).
- Si debe aparecer en el menú, agrega el enlace en `src/content/site.config.json`.
- La ruta se genera sola con `src/pages/[...slug].astro`; no crees archivos `.astro` por página.

## 4. Verificar

1. `npm run check` (typecheck + lint + build + enlaces). Si Zod falla, corrige el JSON, no el esquema,
   salvo que el campo realmente falte.
2. `npm run shots` y revisa `<slug>-390.png` y `<slug>-1440.png`.
3. Recorre la página con teclado usando el MCP de Playwright: skip link, foco visible, CTA.

## 5. Entregar

- Ruta creada, archivos tocados, secciones reutilizadas vs. nuevas.
- Textos de relleno pendientes de reemplazar.
- Resultado de `npm run check` y ruta de las capturas.
