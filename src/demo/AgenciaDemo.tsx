import { useEffect, useRef, useState } from "react";
import type { AgenciaContent } from "@/content/schemas";
import { cn } from "@/lib/utils";
import {
  aplicarAjuste,
  costoPorPedido,
  etapaTras,
  fixtures,
  pesos,
  plantilla,
  type Pedido,
  type Registro,
} from "./agencia";

type SeccionId = AgenciaContent["nav"][number]["id"];
type EstadoPieza = {
  estado: "pendiente" | "aprobada" | "cambios";
  abierta: boolean;
  borrador: string;
  error: boolean;
  enviado?: string;
};

const tarjeta = "rounded-lg border border-border bg-bg p-4 sm:p-5";
const botonPrimario =
  "min-h-tap inline-flex items-center justify-center rounded-md bg-primary px-4 font-bold text-primary-fg hover:bg-primary/90";
const botonBorde =
  "min-h-tap inline-flex items-center justify-center rounded-md border border-primary bg-bg px-4 font-bold text-primary hover:bg-surface";

export default function AgenciaDemo({ content }: { content: AgenciaContent }) {
  const c = content;
  const [seccion, setSeccion] = useState<SeccionId>("tablero");
  const [aviso, setAviso] = useState("");
  const primeraCarga = useRef(true);

  // Estado compartido entre secciones
  const [piezas, setPiezas] = useState<Record<string, EstadoPieza>>(() =>
    Object.fromEntries(
      fixtures.piezas.map((p) => [
        p.id,
        { estado: "pendiente", abierta: false, borrador: "", error: false },
      ]),
    ),
  );
  const [historial, setHistorial] = useState<Registro[]>(fixtures.historial);
  const [campanas, setCampanas] = useState(fixtures.campanas.lista);
  const [propuesta, setPropuesta] = useState<"pendiente" | "aprobada" | "rechazada">("pendiente");
  const [paso, setPaso] = useState(0);
  const [filtro, setFiltro] = useState("");

  const registrar = (agente: string, accion: string, aprobo = "—") =>
    setHistorial((h) => [{ hora: c.historial.ahora, agente, accion, aprobo }, ...h]);

  // Navegación por hash (#tablero, #aprobar…), útil para enlazar una sección en la reunión
  useEffect(() => {
    const desdeHash = () => {
      const id = window.location.hash.slice(1) as SeccionId;
      if (c.nav.some((n) => n.id === id)) setSeccion(id);
    };
    desdeHash();
    window.addEventListener("hashchange", desdeHash);
    return () => window.removeEventListener("hashchange", desdeHash);
  }, [c.nav]);

  useEffect(() => {
    if (primeraCarga.current) {
      primeraCarga.current = false;
      return;
    }
    document.querySelector<HTMLElement>(`#${seccion} [data-titulo-seccion]`)?.focus();
  }, [seccion]);

  const ir = (id: SeccionId) => {
    history.replaceState(null, "", `#${id}`);
    setSeccion(id);
  };

  const pendientes = fixtures.piezas.filter((p) => piezas[p.id]?.estado === "pendiente");

  // ---------- Acciones ----------
  const actualizarPieza = (id: string, cambio: Partial<EstadoPieza>) =>
    setPiezas((p) => ({ ...p, [id]: { ...p[id]!, ...cambio } }));

  const aprobarPieza = (id: string, titulo: string) => {
    actualizarPieza(id, { estado: "aprobada", abierta: false });
    registrar("Atraer", plantilla(c.historial.accionAprobada, { titulo }), c.historial.aproboTexto);
    setAviso(c.aprobar.aprobada);
  };

  const enviarCambios = (id: string, titulo: string, agente: string, porVoz: boolean) => {
    const estado = piezas[id]!;
    const cambio = porVoz ? c.aprobar.vozTranscripcion : estado.borrador.trim();
    if (!cambio) {
      actualizarPieza(id, { error: true });
      return;
    }
    actualizarPieza(id, { estado: "cambios", abierta: false, error: false, enviado: cambio });
    registrar(
      agente,
      plantilla(c.historial.accionCambios, { titulo, cambio }),
      porVoz ? c.historial.aproboVoz : c.historial.aproboTexto,
    );
    setAviso(plantilla(c.aprobar.enCambios, { agente }));
  };

  const decidirPropuesta = (aprobar: boolean) => {
    const { desde, hacia, monto } = fixtures.campanas.propuesta;
    if (aprobar) {
      const ajustadas = aplicarAjuste(campanas, desde, hacia, monto);
      // La regla protege el tope: si el ajuste dejaría una campaña por debajo de lo gastado, no se aplica
      if (ajustadas === campanas) {
        setPropuesta("rechazada");
        setAviso(c.campanas.ajusteRechazado);
        return;
      }
      setCampanas(ajustadas);
      registrar(
        "Pautar",
        plantilla(c.historial.accionAjuste, { monto: pesos(monto) }),
        c.historial.aproboTexto,
      );
    }
    setPropuesta(aprobar ? "aprobada" : "rechazada");
    setAviso(aprobar ? c.campanas.ajusteAprobado : c.campanas.ajusteRechazado);
  };

  const conversacion = fixtures.conversacion;
  const avanzar = (hasta: number) => {
    const destino = Math.min(hasta, conversacion.length);
    const antes = etapaTras(conversacion, paso);
    const despues = etapaTras(conversacion, destino);
    setPaso(destino);
    const ultimo = c.pedido.columnas.at(-1)?.id;
    if (despues === ultimo && antes !== ultimo) {
      registrar(
        "Vender",
        plantilla(c.historial.accionPedido, {
          id: fixtures.pedidoNuevo.id,
          ciudad: fixtures.pedidoNuevo.ciudad,
        }),
      );
    }
  };
  const etapaNuevo = etapaTras(conversacion, paso);
  const pedidos: (Pedido & { nuevo?: boolean })[] = [
    ...(etapaNuevo ? [{ ...fixtures.pedidoNuevo, etapa: etapaNuevo, nuevo: true }] : []),
    ...fixtures.pedidos,
  ];

  // ---------- Vistas ----------
  // El título de cada sección recibe el foco al cambiar de sección (lectores de pantalla y teclado)
  const tituloSeccion = (texto: string) => (
    <h2
      tabIndex={-1}
      data-titulo-seccion
      className="text-2xl font-extrabold focus:outline-none sm:text-3xl"
    >
      {texto}
    </h2>
  );

  const vistaTablero = () => (
    <>
      {tituloSeccion(c.tablero.titulo)}
      <p className="mt-2 text-muted">{c.tablero.intro}</p>
      <p className="mt-1 text-sm font-semibold text-muted">{c.periodo}</p>

      <h3 className="mt-8 text-lg font-bold">{c.tablero.kpisTitulo}</h3>
      <dl className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-3">
        {fixtures.kpis.map((k) => (
          <div key={k.etiqueta} className={tarjeta}>
            <dt className="text-sm text-muted">{k.etiqueta}</dt>
            <dd className="mt-1 text-2xl font-extrabold sm:text-3xl">{k.valor}</dd>
            <dd className="text-sm font-semibold text-success">{k.cambio}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <section
          aria-labelledby="pendientes-titulo"
          className="self-start rounded-lg bg-primary p-5 text-primary-fg"
        >
          <h3 id="pendientes-titulo" className="text-lg font-bold">
            {plantilla(c.tablero.pendientesTitulo, { n: pendientes.length })}
          </h3>
          {pendientes.length === 0 ? (
            <p className="mt-3">{c.tablero.pendientesVacio}</p>
          ) : (
            <>
              <ul className="mt-3 space-y-2">
                {pendientes.map((p) => (
                  <li key={p.id} className="rounded-md bg-primary-fg/10 px-3 py-2">
                    <span className="block text-sm opacity-90">{p.tipo}</span>
                    <span className="font-semibold">{p.titulo}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => ir("aprobar")}
                className="min-h-tap mt-4 inline-flex items-center rounded-md bg-bg px-4 font-bold text-primary hover:bg-surface"
              >
                {c.tablero.irAprobar}
              </button>
            </>
          )}
        </section>

        <section aria-labelledby="agentes-titulo">
          <h3 id="agentes-titulo" className="text-lg font-bold">
            {c.tablero.agentesTitulo}
          </h3>
          <ul className="mt-3 space-y-3">
            {fixtures.agentes.map((a) => (
              <li key={a.id} className={tarjeta}>
                <p className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <span className="font-extrabold">
                    {a.nombre} <span className="font-semibold text-muted">· {a.rol}</span>
                  </span>
                  <span className="text-sm text-muted">{a.hora}</span>
                </p>
                <p className="mt-1">{a.ultimaAccion}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );

  const vistaAprobar = () => (
    <>
      {tituloSeccion(c.aprobar.titulo)}
      <p className="mt-2 max-w-prose text-muted">{c.aprobar.intro}</p>
      {pendientes.length === 0 && (
        <p className="mt-4 font-semibold text-success">{c.aprobar.vacio}</p>
      )}
      <ul className="mt-6 grid gap-6 lg:grid-cols-3">
        {fixtures.piezas.map((p) => {
          const e = piezas[p.id]!;
          const idCampo = `cambios-${p.id}`;
          return (
            <li key={p.id} className={cn(tarjeta, "flex flex-col")}>
              <p className="text-sm font-semibold text-muted">{p.tipo}</p>
              <h3 className="mt-1 text-lg font-extrabold">{p.titulo}</h3>
              {p.imagen && (
                <img
                  src={p.imagen.src}
                  alt={p.imagen.alt}
                  width={p.imagen.width}
                  height={p.imagen.height}
                  loading="lazy"
                  className="mt-3 aspect-square w-full rounded-md object-cover sm:max-h-56"
                />
              )}
              <ol className="mt-3 space-y-1 text-sm">
                {p.guion.map((g) => (
                  <li key={g}>{g}</li>
                ))}
              </ol>
              <p className="mt-3 rounded-md bg-surface p-3 text-sm">{p.texto}</p>
              <p className="mt-3 text-sm">
                <span className="font-semibold">{c.aprobar.canalLabel}</span> {p.canal}
                <br />
                <span className="font-semibold">{c.aprobar.programadaLabel}</span> {p.programada}
              </p>

              <div className="mt-auto pt-4">
                {e.estado === "aprobada" && (
                  <p className="rounded-md border border-success p-3 font-semibold text-success">
                    {c.aprobar.aprobada}
                  </p>
                )}
                {e.estado === "cambios" && (
                  <div>
                    <p className="text-sm font-semibold text-muted">{c.aprobar.whatsappTitulo}</p>
                    <p className="mt-1 rounded-md rounded-tr-none bg-accent p-3 text-sm text-accent-fg">
                      {e.enviado}
                    </p>
                    <p className="mt-2 font-semibold text-status-prototype">
                      {plantilla(c.aprobar.enCambios, { agente: p.agente })}
                    </p>
                  </div>
                )}
                {e.estado === "pendiente" && !e.abierta && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className={botonPrimario}
                      onClick={() => aprobarPieza(p.id, p.titulo)}
                    >
                      {c.aprobar.aprobar}
                    </button>
                    <button
                      type="button"
                      className={botonBorde}
                      onClick={() => actualizarPieza(p.id, { abierta: true })}
                    >
                      {c.aprobar.pedirCambios}
                    </button>
                  </div>
                )}
                {e.estado === "pendiente" && e.abierta && (
                  <div>
                    <label htmlFor={idCampo} className="font-semibold">
                      {c.aprobar.cambiosLabel}
                    </label>
                    <p id={`${idCampo}-ayuda`} className="text-sm text-muted">
                      {c.aprobar.cambiosAyuda}
                    </p>
                    <textarea
                      id={idCampo}
                      rows={3}
                      value={e.borrador}
                      onChange={(ev) =>
                        actualizarPieza(p.id, { borrador: ev.target.value, error: false })
                      }
                      aria-invalid={e.error || undefined}
                      aria-describedby={`${idCampo}-ayuda${e.error ? ` ${idCampo}-error` : ""}`}
                      className={cn(
                        "mt-1 block w-full rounded-md border bg-bg p-2",
                        e.error ? "border-danger" : "border-border",
                      )}
                    />
                    {e.error && (
                      <p id={`${idCampo}-error`} className="mt-1 text-sm font-semibold text-danger">
                        {c.aprobar.cambiosError}
                      </p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        className={botonPrimario}
                        onClick={() => enviarCambios(p.id, p.titulo, p.agente, false)}
                      >
                        {c.aprobar.enviarTexto}
                      </button>
                      <button
                        type="button"
                        className={botonBorde}
                        onClick={() => enviarCambios(p.id, p.titulo, p.agente, true)}
                      >
                        {c.aprobar.enviarVoz}
                      </button>
                      <button
                        type="button"
                        className="min-h-tap px-3 font-semibold text-muted underline"
                        onClick={() => actualizarPieza(p.id, { abierta: false, error: false })}
                      >
                        {c.aprobar.cancelar}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );

  const vistaCampanas = () => {
    const { propuesta: prop } = fixtures.campanas;
    return (
      <>
        {tituloSeccion(c.campanas.titulo)}
        <p className="mt-2 max-w-prose text-muted">{c.campanas.intro}</p>
        <p className="mt-3 inline-block rounded-md bg-surface px-3 py-2 font-bold">
          {plantilla(c.campanas.topeTotal, { valor: pesos(fixtures.campanas.topeTotal) })}
        </p>
        <ul className="mt-6 grid gap-4 md:grid-cols-2">
          {campanas.map((camp) => (
            <li key={camp.id} className={tarjeta}>
              <p className="text-sm font-semibold text-muted">{camp.plataforma}</p>
              <h3 className="mt-1 text-lg font-extrabold">{camp.nombre}</h3>
              <meter
                className="mt-3 h-3 w-full"
                min={0}
                max={camp.tope}
                value={camp.gastado}
                aria-label={`${c.campanas.gastado} ${pesos(camp.gastado)} / ${c.campanas.tope} ${pesos(camp.tope)}`}
              />
              <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <dt className="text-muted">{c.campanas.tope}</dt>
                  <dd className="font-bold">{pesos(camp.tope)}</dd>
                </div>
                <div>
                  <dt className="text-muted">{c.campanas.gastado}</dt>
                  <dd className="font-bold">{pesos(camp.gastado)}</dd>
                </div>
                <div>
                  <dt className="text-muted">{c.campanas.pedidos}</dt>
                  <dd className="font-bold">{camp.pedidos}</dd>
                </div>
                <div>
                  <dt className="text-muted">{c.campanas.costoPedido}</dt>
                  <dd className="font-bold">{pesos(costoPorPedido(camp))}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
        <section
          aria-labelledby="propuesta-titulo"
          className="mt-6 rounded-lg border-2 border-accent bg-bg p-5"
        >
          <h3 id="propuesta-titulo" className="text-lg font-bold">
            {c.campanas.propuestaTitulo}
          </h3>
          <p className="mt-2">{prop.texto}</p>
          {propuesta === "pendiente" ? (
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                className={botonPrimario}
                onClick={() => decidirPropuesta(true)}
              >
                {c.campanas.aprobarAjuste}
              </button>
              <button type="button" className={botonBorde} onClick={() => decidirPropuesta(false)}>
                {c.campanas.rechazarAjuste}
              </button>
            </div>
          ) : (
            <p className="mt-4 font-semibold text-success">
              {propuesta === "aprobada" ? c.campanas.ajusteAprobado : c.campanas.ajusteRechazado}
            </p>
          )}
        </section>
      </>
    );
  };

  const vistaPedido = () => (
    <>
      {tituloSeccion(c.pedido.titulo)}
      <p className="mt-2 max-w-prose text-muted">{c.pedido.intro}</p>
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,26rem)_1fr]">
        <section
          aria-labelledby="chat-titulo"
          className="rounded-lg border border-border bg-surface"
        >
          <h3
            id="chat-titulo"
            className="rounded-t-lg bg-primary px-4 py-3 font-bold text-primary-fg"
          >
            {c.pedido.chatTitulo}
          </h3>
          <ol aria-live="polite" className="min-h-48 space-y-3 p-4">
            {conversacion.slice(0, paso).map((m, i) => (
              <li
                key={i}
                className={cn(
                  "max-w-[85%] rounded-lg p-3 text-sm",
                  m.de === "clienta" && "rounded-tl-none bg-bg",
                  m.de === "agente" && "ml-auto rounded-tr-none bg-accent text-accent-fg",
                  m.de === "sistema" &&
                    "mx-auto border border-border bg-bg text-center font-semibold",
                )}
              >
                <span className="mb-1 block text-xs font-bold opacity-90">
                  {m.de === "clienta"
                    ? fixtures.pedidoNuevo.cliente
                    : m.de === "agente"
                      ? `${c.pedido.agentePrefijo} ${m.agente}${m.voz ? ` · ${c.pedido.notaVoz}` : ""}`
                      : c.pedido.sistema}
                </span>
                {m.texto}
              </li>
            ))}
          </ol>
          <div className="flex flex-wrap gap-2 border-t border-border p-4">
            {paso < conversacion.length ? (
              <>
                <button type="button" className={botonPrimario} onClick={() => avanzar(paso + 1)}>
                  {c.pedido.siguiente}
                </button>
                <button
                  type="button"
                  className={botonBorde}
                  onClick={() => avanzar(conversacion.length)}
                >
                  {c.pedido.reproducir}
                </button>
              </>
            ) : (
              <button type="button" className={botonBorde} onClick={() => setPaso(0)}>
                {c.pedido.reiniciar}
              </button>
            )}
          </div>
        </section>

        <section aria-labelledby="pedidos-titulo" className="min-w-0">
          <h3 id="pedidos-titulo" className="text-lg font-bold">
            {c.pedido.tableroTitulo}
          </h3>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {c.pedido.columnas.map((col) => {
              const enCol = pedidos.filter((p) => p.etapa === col.id);
              return (
                <div key={col.id} className="rounded-lg bg-surface p-3">
                  <h4 className="font-bold">
                    {col.label} <span className="text-muted">({enCol.length})</span>
                  </h4>
                  {enCol.length === 0 ? (
                    <p className="mt-2 text-sm text-muted">{c.pedido.vacio}</p>
                  ) : (
                    <ul className="mt-2 space-y-2">
                      {enCol.map((p) => (
                        <li
                          key={p.id}
                          className={cn(
                            "rounded-md bg-bg p-3 text-sm",
                            p.nuevo ? "border-2 border-accent" : "border border-border",
                          )}
                        >
                          <p className="font-bold">
                            {p.id} · {p.valor}
                          </p>
                          <p>{p.cliente}</p>
                          <p className="text-muted">
                            {p.ciudad} · {p.pago}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );

  const vistaHistorial = () => {
    const agentes = [...new Set(historial.map((h) => h.agente))];
    const visibles = filtro ? historial.filter((h) => h.agente === filtro) : historial;
    return (
      <>
        {tituloSeccion(c.historial.titulo)}
        <p className="mt-2 max-w-prose text-muted">{c.historial.intro}</p>
        <label htmlFor="filtro-agente" className="mt-4 block font-semibold">
          {c.historial.filtroLabel}
        </label>
        <select
          id="filtro-agente"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="min-h-tap mt-1 rounded-md border border-border bg-bg px-3"
        >
          <option value="">{c.historial.todos}</option>
          {agentes.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <ol className="mt-4 space-y-3">
          {visibles.map((h, i) => (
            <li
              key={`${h.hora}-${i}`}
              className={cn(tarjeta, "grid gap-1 sm:grid-cols-[10rem_7rem_1fr_12rem] sm:gap-4")}
            >
              <p className="text-sm text-muted">
                <span className="sr-only">{c.historial.columnas.hora}: </span>
                {h.hora}
              </p>
              <p className="font-bold">
                <span className="sr-only">{c.historial.columnas.agente}: </span>
                {h.agente}
              </p>
              <p>
                <span className="sr-only">{c.historial.columnas.accion}: </span>
                {h.accion}
              </p>
              <p className="text-sm text-muted">
                <span className="font-semibold">{c.historial.columnas.aprobo}:</span> {h.aprobo}
              </p>
            </li>
          ))}
        </ol>
      </>
    );
  };

  const vistas: Record<SeccionId, () => React.ReactNode> = {
    tablero: vistaTablero,
    aprobar: vistaAprobar,
    campanas: vistaCampanas,
    pedido: vistaPedido,
    historial: vistaHistorial,
  };

  return (
    <div>
      <nav
        aria-label={c.navLabel}
        className="sticky top-0 z-10 -mx-4 border-b border-border bg-bg/95 px-4 py-2 backdrop-blur sm:mx-0 sm:px-0"
      >
        <ul className="flex flex-wrap gap-2">
          {c.nav.map((n) => (
            <li key={n.id}>
              <a
                href={`#${n.id}`}
                aria-current={seccion === n.id ? "page" : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  ir(n.id);
                }}
                className={cn(
                  "min-h-tap inline-flex items-center gap-2 rounded-md px-3 font-bold no-underline",
                  seccion === n.id ? "bg-primary text-primary-fg" : "text-fg hover:bg-surface",
                )}
              >
                {n.label}
                {n.id === "aprobar" && pendientes.length > 0 && (
                  <span className="rounded-full bg-accent px-2 text-xs text-accent-fg">
                    {pendientes.length}
                  </span>
                )}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <p role="status" className="sr-only">
        {aviso}
      </p>

      {/* Las cinco secciones existen en el HTML (anclas reales); solo se muestra la activa */}
      {c.nav.map((n) => (
        <section
          key={n.id}
          id={n.id}
          aria-label={n.label}
          hidden={seccion !== n.id}
          className="pt-6"
        >
          {seccion === n.id || primeraCarga.current ? vistas[n.id]() : null}
        </section>
      ))}
    </div>
  );
}
