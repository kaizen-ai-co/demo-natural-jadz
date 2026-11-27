# demo-natural-jadz

Demo para Natural Jadz («Su agencia, trabajando hoy») construida sobre kaizen-web-starter. Datos ficticios. Responde en español de Colombia.

## Stack (versiones fijadas en package.json; no actualices sin aprobación)

- Astro 7 (estático) + islas React 19 solo donde hay interacción
- Tailwind CSS 4 conectado a `src/styles/tokens.css` vía `@theme` en `src/styles/global.css`
- Contenido en JSON validado con Zod (`astro/zod`) en `src/content/schemas.ts`
- TypeScript 6 (TS 7 aún no es compatible con `astro check` ni `typescript-eslint`)
- npm (`package-lock.json` versionado). Node ≥ 22.12

## Comandos

| Comando            | Qué hace                                                                        |
| ------------------ | ------------------------------------------------------------------------------- |
| `npm run dev`      | Servidor en http://localhost:4321 (launch: `kaizen-dev`)                        |
| `npm run check`    | typecheck + lint + contraste + licencias + build + enlaces internos             |
| `npm run shots`    | Capturas 390px y 1440px de todas las páginas en `screenshots/` (requiere build) |
| `npm run contrast` | Contraste WCAG AA de los pares de `tokens.css`                                  |
| `npm run og`       | Regenera `public/og-default.png` con nombre y tokens de marca                   |
| `npm run format`   | Prettier en todo el repo                                                        |

Hooks (`.claude/settings.json`): Prettier sobre cada archivo editado; al editar `src/content/`
se valida el esquema y, si falla, corrígelo en el mismo turno; al terminar un turno con cambios,
typecheck + lint con aviso. Reglas de entrega y umbrales: `docs/calidad.md`. Decisiones: `docs/decisiones.md`.

## Rutas

- `src/content/site.config.json` → nombre, URL, menú, footer, imagen OG (esquema `siteConfigSchema`)
- `src/content/pages/<slug>.json` → una página por archivo; `index` = portada (esquema `pageSchema`)
- `src/content/demos/<demo>.json` → textos de demos (esquema `leadDemoSchema`)
- `src/components/sections/` → bloques reutilizables; se registran en `SectionRenderer.astro`
- `src/components/layout/` → `BaseLayout` (SEO, OG, skip link), `Header`, `Footer`
- `src/components/ui/` → piezas pequeñas (Button, Container, StatusBadge) y componentes shadcn
- `src/styles/tokens.css` → ÚNICA fuente de identidad visual
- `src/demo/` → lógica de demos (`crm.ts`), islas React y `fixtures/` con datos ficticios

## Reglas (obligatorias)

1. **Contenido fuera del código.** Textos, precios, listas, enlaces e imágenes viven en `src/content/`.
   Ningún componente tiene texto visible propio. Si falta un campo, agrégalo al esquema y al JSON.
2. **Precios.** Nunca inventes precios ni descuentos: usa «Por definir» hasta que dirección los apruebe.
3. **Marca solo desde tokens.** Prohibido usar hex, `rgb()`, fuentes o radios sueltos en componentes;
   usa clases como `bg-primary`, `text-fg`, `rounded-md`. Los valores con `TODO-MARCA` son relleno:
   pide la marca oficial (colores hex, tipografías, radios, logo SVG) antes de darlos por buenos.
4. **Accesibilidad y responsive.** Mobile-first; HTML semántico (un solo `<h1>`, landmarks, listas);
   foco visible; objetivos táctiles ≥ 44px (`min-h-tap`); etiquetas visibles en formularios;
   errores junto al campo y resumen enfocable; contraste WCAG AA (4.5:1 texto, 3:1 UI);
   `prefers-reduced-motion` respetado; sin scroll horizontal en 390px.
5. **Demos.** Solo datos ficticios de `src/demo/fixtures/` (nombres marcados como ficticios,
   teléfonos `300000000X`, correos `@ejemplo.test`). Cada función visible lleva `StatusBadge`
   con **Disponible / Prototipo / Pendiente** y el aviso de datos ficticios. Las demos llevan `noindex`.
6. **shadcn.** Usa el MCP `shadcn` para buscar componentes y agrégalos con la versión fijada:
   `npx shadcn@4.23.0 add <componente>`. Si shadcn inserta variables CSS en `global.css`,
   elimínalas: los alias ya apuntan a los tokens Kaizen.
7. **Dependencias.** No agregues paquetes sin proponerlo primero (nombre, versión, motivo, peso).
   Fija versiones exactas (`save-exact`).
8. **Licencias.** Todo archivo nuevo en `public/` se anota en `LICENCIAS.md` (solo CC0 o comercial clara).

## Antes de decir «listo»

1. `npm run check` sin errores.
2. `npm run shots` y revisa las capturas de 390px y 1440px (busca «⚠ scroll horizontal»).
3. Para cambios de UI, recorre el flujo con el MCP de Playwright (teclado incluido).
4. Informa qué verificaste, qué no y dónde está la evidencia (ruta de las capturas).

## Prohibiciones

- No hardcodear contenido ni estilos de marca en componentes.
- No usar datos reales de clientes en demos ni capturas.
- No publicar, desplegar ni crear repos remotos sin aprobación explícita.
- No editar `.env*` ni subir secretos. No desactivar reglas de lint para «pasar» el check.

## Skills del proyecto

- `/crear-pagina` → nueva ruta desde JSON reutilizando secciones existentes.
- `/agregar-seccion` → tipo de sección nuevo con sus 4 piezas (esquema, componente, registro, contenido).
- `/nueva-demo-cliente` → demo de un cliente con sus palabras, datos ficticios y guion para Duván.
- `/auditar-web` → auditoría priorizada y veredicto «lista / no lista» contra `docs/calidad.md`.
- Al cerrar: `/registro-slack` (skill global) para el hilo del cliente o tarea.
