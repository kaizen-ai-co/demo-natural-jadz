---
name: agregar-seccion
description: Agrega un tipo de sección nuevo (o una variante) a la plantilla conectando sus cuatro piezas, componente, registro, esquema y contenido, y lo verifica. Úsala con pedidos como "agrega una sección de aliados", "quiero una variante de portada con imagen" o "añade un mapa al contacto".
argument-hint: "<nombre de la sección o variante>"
---

# Agregar una sección

Pedido: **$ARGUMENTS**

Una sección solo está terminada cuando las **cuatro piezas** coinciden. Antes de crear, confirma que
ninguna sección existente (`hero`, `features`, `pricing`, `testimonials`, `faq`, `cta`) sirve ajustando su contenido.

## 1. Esquema

En `src/content/schemas.ts`: `xxxSchema` con `type: z.literal("xxx")`, `...base` (id) y campos con
límites (`min`, `max`). Agrégalo a `sectionSchema`. Imágenes con `imageSchema` (alt obligatorio).
Para una **variante**, agrega `variant: z.enum([...]).default("...")` al esquema existente.

## 2. Componente

`src/components/sections/Xxx.astro`:

- Props `z.infer<typeof xxxSchema>`; ningún texto propio: todo llega por props.
- `<section id aria-labelledby>`, `<h2>` (o `h1` si puede ir primero vía `headingLevel`).
- Solo clases de tokens (`bg-primary`, `text-fg`, `rounded-md`, `min-h-tap`), mobile-first.
- Interacción solo si es imprescindible: isla React en `src/components/` con `client:visible`.

## 3. Registro

Agrega el `case "xxx"` en `src/components/sections/SectionRenderer.astro`.

## 4. Contenido

Úsala en un JSON de `src/content/pages/` con textos de ejemplo marcados como tales. El hook de
validación revisa el esquema al guardar; corrige en el mismo turno si falla.

## 5. Verificar

1. `npm run check`.
2. `npm run shots` y revisa la sección en 390 px y 1440 px.
3. Recorre con teclado (Playwright): foco visible, orden lógico, sin scroll horizontal.
