# demo-natural-jadz

Demo con datos ficticios del ecosistema de agentes de Kaizen para Natural Jadz: tablero, contenido por aprobar, campañas con tope, del WhatsApp al pedido e historial. Base: kaizen-web-starter.

- Guion para la reunión: [docs/guion-duvan.md](docs/guion-duvan.md)
- Ver en local: `npm ci && npm run build && npm run preview` → http://localhost:4322

## Arrancar un proyecto nuevo

```powershell
git clone <url-de-la-plantilla> cliente-x
cd cliente-x
Remove-Item -Recurse -Force .git; git init
npm ci
npm run dev
```

1. Abre el proyecto con Claude Code y aprueba los MCP del proyecto (`shadcn`, `playwright`).
2. Cambia `src/content/site.config.json` (nombre, URL, menú).
3. Reemplaza los valores `TODO-MARCA` de `src/styles/tokens.css` y `public/favicon.svg`; luego `npm run contrast` y `npm run og`.
4. Crea páginas con `/crear-pagina` y revisa con `/auditar-web` antes de entregar.

## Comandos

| Comando            | Qué hace                                                      |
| ------------------ | ------------------------------------------------------------- |
| `npm run dev`      | Desarrollo en http://localhost:4321                           |
| `npm run check`    | typecheck + lint + contraste + build + enlaces                |
| `npm run shots`    | Capturas en 390px y 1440px en `screenshots/` (requiere build) |
| `npm run contrast` | Contraste WCAG AA de los tokens                               |
| `npm run og`       | Regenera `public/og-default.png` con la marca                 |

## Demo incluida

`/demo/lead-crm`: formulario móvil → asignación por ciudad y servicio → lead en un CRM ficticio. Datos de `src/demo/fixtures/`, todo en el navegador, sin red.

Reglas completas del proyecto en [CLAUDE.md](CLAUDE.md).
