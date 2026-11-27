/** Lógica pura de la demo «Su agencia trabajando» (sin red ni almacenamiento). */
import datos from "./fixtures/agencia.json";

export type Agente = (typeof datos.agentes)[number];
export type Pieza = (typeof datos.piezas)[number] & {
  imagen?: { src: string; alt: string; width: number; height: number };
};
export type Campana = (typeof datos.campanas.lista)[number];
export type Mensaje = {
  de: "clienta" | "agente" | "sistema";
  texto: string;
  agente?: string;
  voz?: boolean;
  etapa?: string;
};
export type Pedido = {
  id: string;
  cliente: string;
  ciudad: string;
  producto: string;
  valor: string;
  pago: string;
  etapa: string;
};
export type Registro = { hora: string; agente: string; accion: string; aprobo: string };

export const fixtures = {
  agentes: datos.agentes as Agente[],
  kpis: datos.kpis,
  piezas: datos.piezas as Pieza[],
  campanas: datos.campanas,
  conversacion: datos.conversacion as Mensaje[],
  pedidoNuevo: datos.pedidoNuevo,
  pedidos: datos.pedidos as Pedido[],
  historial: datos.historial as Registro[],
};

const COP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});
export const pesos = (n: number) => COP.format(n).replace(/\s/g, "");

export const costoPorPedido = (c: Pick<Campana, "gastado" | "pedidos">) =>
  c.pedidos > 0 ? Math.round(c.gastado / c.pedidos) : 0;

/** Mueve tope entre campañas sin cambiar el total ni dejar un tope por debajo de lo ya gastado. */
export function aplicarAjuste(
  lista: Campana[],
  desde: string,
  hacia: string,
  monto: number,
): Campana[] {
  const origen = lista.find((c) => c.id === desde);
  if (!origen || origen.tope - monto < origen.gastado) return lista;
  return lista.map((c) =>
    c.id === desde
      ? { ...c, tope: c.tope - monto }
      : c.id === hacia
        ? { ...c, tope: c.tope + monto }
        : c,
  );
}

/** Etapa del pedido nuevo después de mostrar los primeros `paso` mensajes (null si aún no existe). */
export function etapaTras(conversacion: Mensaje[], paso: number): string | null {
  let etapa: string | null = null;
  for (const m of conversacion.slice(0, paso)) if (m.etapa) etapa = m.etapa;
  return etapa;
}

export const plantilla = (texto: string, valores: Record<string, string | number>) =>
  texto.replace(/\{(\w+)\}/g, (_, k: string) => String(valores[k] ?? ""));
