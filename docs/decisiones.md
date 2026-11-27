# Decisiones

## Tomadas

| Fecha                 | Tema                          | Decisión                                                        | Efecto en el código                               |
| --------------------- | ----------------------------- | --------------------------------------------------------------- | ------------------------------------------------- |
| 27/11/2026            | Stack de la plantilla ligera  | Astro estático + islas React; contenido JSON validado con Zod   | `src/content.config.ts`, `src/content/schemas.ts` |
| 27/11/2026            | Gestor de paquetes            | npm con versiones exactas (`save-exact`)                        | `.npmrc`, `package-lock.json`                     |
| 27/11/2026            | TypeScript                    | 6.0 hasta que `astro check` y `typescript-eslint` soporten TS 7 | `package.json`                                    |
| 27/11/2026            | Anchos de evidencia           | 390 px (móvil) y 1440 px (escritorio)                           | `scripts/shots.mjs`                               |
| 25/11/2026 (Santiago) | Dónde corren las demos serias | Cloudflare Pages (DNS y Access ya existen)                      | `public/_headers`                                 |
| 25/11/2026 (Santiago) | Repos                         | `main` protegido, PR con CI en verde                            | `.github/workflows/ci.yml`                        |

## Pendientes

- [ ] Marca oficial de Kaizen: colores hex, tipografías, radios y logo SVG → `src/styles/tokens.css`.
- [ ] Umbrales definitivos de rendimiento y accesibilidad (Lucas) → `docs/calidad.md`.
- [ ] Mover el repo a la organización de GitHub de Kaizen cuando haya acceso.
