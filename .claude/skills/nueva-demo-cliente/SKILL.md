---
name: nueva-demo-cliente
description: Arma la demo web de un cliente a partir de esta plantilla, con su problema en sus palabras, datos ficticios de su sector, estado honesto de cada función y un guion corto para que Duván la muestre. Úsala con pedidos como "demo para la clínica X", "arma la demo de <cliente>" o "prepara la demo para la reunión del sábado".
argument-hint: "<cliente> [sector] [fecha de la reunión]"
---

# Demo para un cliente

Pedido: **$ARGUMENTS**

## 1. Entender al cliente (sin datos personales)

Busca el contexto en el hilo del cliente en Slack (#operacion-clientes), el acta de Meet o las notas de Duván:

- Problema en palabras del cliente, frecuencia y costo del problema, quién decide.
- El recorrido que más le importa ver y la fecha de la reunión.

Si falta algo esencial, pregúntalo en **una sola** pregunta. Nunca copies nombres, teléfonos ni correos reales.

## 2. Elegir el recorrido

| El cliente necesita ver…                                   | Base en esta plantilla                                                          |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Que un visitante deja sus datos y llega como lead asignado | `/demo/lead-crm`                                                                |
| Su empresa presentada con servicios, planes y preguntas    | Portada (`src/content/pages/index.json`)                                        |
| Algo que ninguna de las dos cubre                          | Marca la pieza como **Pendiente** y avisa: la revisa Lucas antes de construirla |

Si el cliente necesita editor con roles, catálogo con PDF, visor 3D o agenda, propón usar `kaizen-demos`.

## 3. Crear y llenar

- Rama `demo/<cliente>` (pide confirmación antes de crearla en el remoto).
- Contenido en palabras del cliente en `src/content/` (portada y textos de la demo); precios «Por definir».
- Colores del cliente solo en `src/styles/tokens.css`; luego `npm run contrast` y `npm run og`.
- Datos ficticios realistas del sector en `src/demo/fixtures/` (`@ejemplo.test`, `300000000X`, «(ficticio)»).
- Cada función con su `StatusBadge`: Disponible / Prototipo / Pendiente, sin exagerar.

## 4. Probar

1. `npm run check` y `npm run shots` (390 px y 1440 px).
2. Recorre el flujo principal con el MCP de Playwright como lo haría el cliente desde el celular.

## 5. Entregar

- Contrato de entrega (estado, archivos, evidencia, estado honesto, bloqueos).
- **Guion para Duván** (3–5 pasos): qué mostrar en cada paso y qué decir, conectado con el problema
  del cliente y la siguiente decisión que se le pedirá.
- `/registro-slack` en el hilo del cliente (con confirmación antes de publicar).
