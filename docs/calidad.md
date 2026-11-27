# Reglas de calidad y entrega

Valen para cada sitio o demo creado desde esta plantilla. **No está entregado si incumple alguna.**

| Regla                      | Cómo se comprueba                                                                          |
| -------------------------- | ------------------------------------------------------------------------------------------ |
| Sin datos reales           | `src/demo/fixtures/` y contenido: correos `@ejemplo.test`, teléfonos `300000000X`          |
| Contenido fuera del código | `/auditar-web` (búsqueda de texto y colores sueltos en componentes)                        |
| Marca solo desde tokens    | `npm run contrast` + búsqueda de hex/`rgb()` fuera de `tokens.css`                         |
| Controles automáticos      | `npm run check` (tipos, lint a11y, contraste, licencias, build, enlaces)                   |
| Recorrido completo         | Recorrido principal con datos ficticios en 390 px y 1440 px (`npm run shots` + Playwright) |
| Licencias                  | Cada archivo de `public/` en `LICENCIAS.md` (`npm run licencias`)                          |
| Estado honesto             | Cada función de demo con `StatusBadge` Disponible / Prototipo / Pendiente                  |
| Registro                   | Mensaje en el hilo de Slack con `/registro-slack`                                          |

## Umbrales

> Provisionales hasta que Lucas los fije. Si una métrica no tiene meta, se registra la línea base.

| Métrica                     | Móvil (390 px) | Escritorio (1440 px) |
| --------------------------- | -------------- | -------------------- |
| Lighthouse Rendimiento      | ≥ 90           | ≥ 95                 |
| Lighthouse Accesibilidad    | ≥ 95           | ≥ 95                 |
| Lighthouse Buenas prácticas | ≥ 90           | ≥ 90                 |
| LCP                         | ≤ 2,5 s        | ≤ 2,0 s              |
| CLS                         | ≤ 0,1          | ≤ 0,1                |
| axe serias/críticas         | 0              | 0                    |
| Contraste de texto          | ≥ 4,5:1        | ≥ 4,5:1              |

## Checklist de entrega (copiar en el PR)

```
- [ ] npm run check en verde
- [ ] npm run shots revisado (sin «⚠ scroll horizontal»)
- [ ] recorrido principal probado con teclado en móvil y escritorio
- [ ] Lighthouse móvil/escritorio dentro de umbral (o línea base registrada)
- [ ] LICENCIAS.md al día
- [ ] funciones de la demo con estado honesto
- [ ] sin TODO-MARCA pendientes (o aprobado como relleno)
- [ ] mensaje para Slack listo
```
