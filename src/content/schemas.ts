import { z } from "astro/zod";

/** Esquemas del contenido. Todo texto, precio, lista o imagen visible pasa por aquí. */

export const linkSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
});

export const imageSchema = z.object({
  src: z.string().min(1),
  alt: z.string(), // "" solo si la imagen es decorativa
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

export const siteConfigSchema = z.object({
  name: z.string().min(1),
  url: z.url(),
  lang: z.string().default("es"),
  locale: z.string().default("es_CO"),
  description: z.string().min(1).max(160),
  ogImage: imageSchema,
  logo: imageSchema.optional(),
  fontStylesheet: z.url().optional(), // p. ej. Google Fonts; la familia se declara en tokens.css
  skipLinkLabel: z.string().min(1),
  menuLabel: z.string().min(1),
  nav: z.array(linkSchema),
  footer: z.object({
    text: z.string(),
    links: z.array(linkSchema),
  }),
});

// ---- Secciones reutilizables (una por componente en src/components/sections) ----

const base = { id: z.string().regex(/^[a-z0-9-]+$/) };

export const heroSchema = z.object({
  type: z.literal("hero"),
  ...base,
  heading: z.string().min(1),
  subheading: z.string().min(1),
  primaryCta: linkSchema,
  secondaryCta: linkSchema.optional(),
});

export const featuresSchema = z.object({
  type: z.literal("features"),
  ...base,
  heading: z.string().min(1),
  intro: z.string().optional(),
  items: z.array(z.object({ title: z.string().min(1), description: z.string().min(1) })).min(1),
});

export const pricingSchema = z.object({
  type: z.literal("pricing"),
  ...base,
  heading: z.string().min(1),
  intro: z.string().optional(),
  plans: z
    .array(
      z.object({
        name: z.string().min(1),
        price: z.string().min(1), // texto formateado y aprobado, p. ej. "$1.200.000"
        period: z.string().optional(),
        features: z.array(z.string()).min(1),
        cta: linkSchema,
        highlighted: z.boolean().default(false),
      }),
    )
    .min(1),
  note: z.string().optional(),
});

export const testimonialsSchema = z.object({
  type: z.literal("testimonials"),
  ...base,
  heading: z.string().min(1),
  items: z
    .array(z.object({ quote: z.string().min(1), author: z.string().min(1), role: z.string() }))
    .min(1),
});

export const faqSchema = z.object({
  type: z.literal("faq"),
  ...base,
  heading: z.string().min(1),
  items: z.array(z.object({ question: z.string().min(1), answer: z.string().min(1) })).min(1),
});

export const ctaSchema = z.object({
  type: z.literal("cta"),
  ...base,
  heading: z.string().min(1),
  text: z.string().min(1),
  cta: linkSchema,
});

export const sectionSchema = z.discriminatedUnion("type", [
  heroSchema,
  featuresSchema,
  pricingSchema,
  testimonialsSchema,
  faqSchema,
  ctaSchema,
]);

export const pageSchema = z.object({
  title: z.string().min(1).max(60),
  description: z.string().min(1).max(160),
  ogImage: imageSchema.optional(),
  noindex: z.boolean().default(false),
  sections: z.array(sectionSchema).min(1),
});

// ---- Demos ----

export const featureStatus = z.enum(["disponible", "prototipo", "pendiente"]);

// ---- Demo «Su agencia trabajando» ----
// Textos de interfaz aquí (src/content/agencia/*.json); datos ficticios en src/demo/fixtures/.

const seccionId = z.enum(["tablero", "aprobar", "campanas", "pedido", "historial"]);

export const agenciaSchema = z.object({
  title: z.string().min(1).max(60),
  description: z.string().min(1).max(160),
  cliente: z.string().min(1),
  heading: z.string().min(1),
  intro: z.string().min(1),
  fictionalNotice: z.string().min(1),
  periodo: z.string().min(1),
  statusLabels: z.record(featureStatus, z.string()),
  navLabel: z.string(),
  nav: z.array(z.object({ id: seccionId, label: z.string(), status: featureStatus })).length(5),
  funcionesTitulo: z.string(),
  funciones: z
    .array(z.object({ name: z.string(), status: featureStatus, description: z.string() }))
    .min(1),
  tablero: z.object({
    titulo: z.string(),
    intro: z.string(),
    kpisTitulo: z.string(),
    vsAnterior: z.string(),
    agentesTitulo: z.string(),
    pendientesTitulo: z.string(), // admite {n}
    pendientesVacio: z.string(),
    irAprobar: z.string(),
  }),
  aprobar: z.object({
    titulo: z.string(),
    intro: z.string(),
    canalLabel: z.string(),
    programadaLabel: z.string(),
    aprobar: z.string(),
    pedirCambios: z.string(),
    cambiosLabel: z.string(),
    cambiosAyuda: z.string(),
    cambiosError: z.string(),
    enviarTexto: z.string(),
    enviarVoz: z.string(),
    cancelar: z.string(),
    aprobada: z.string(),
    enCambios: z.string(), // admite {agente}
    whatsappTitulo: z.string(),
    vozTranscripcion: z.string(),
    vacio: z.string(),
  }),
  campanas: z.object({
    titulo: z.string(),
    intro: z.string(),
    topeTotal: z.string(), // admite {valor}
    tope: z.string(),
    gastado: z.string(),
    pedidos: z.string(),
    costoPedido: z.string(),
    propuestaTitulo: z.string(),
    aprobarAjuste: z.string(),
    rechazarAjuste: z.string(),
    ajusteAprobado: z.string(),
    ajusteRechazado: z.string(),
  }),
  pedido: z.object({
    titulo: z.string(),
    intro: z.string(),
    chatTitulo: z.string(),
    tableroTitulo: z.string(),
    siguiente: z.string(),
    reproducir: z.string(),
    reiniciar: z.string(),
    notaVoz: z.string(),
    paraPersona: z.string(),
    columnas: z.array(z.object({ id: z.string(), label: z.string() })).min(2),
    vacio: z.string(),
    agentePrefijo: z.string(),
    sistema: z.string(),
  }),
  historial: z.object({
    titulo: z.string(),
    intro: z.string(),
    todos: z.string(),
    filtroLabel: z.string(),
    columnas: z.object({
      hora: z.string(),
      agente: z.string(),
      accion: z.string(),
      aprobo: z.string(),
    }),
    ahora: z.string(),
    aproboTexto: z.string(),
    aproboVoz: z.string(),
    accionAprobada: z.string(), // admite {titulo}
    accionCambios: z.string(), // admite {titulo} y {cambio}
    accionAjuste: z.string(), // admite {monto}
    accionPedido: z.string(), // admite {id} y {ciudad}
  }),
  pie: z.string(),
});

export type SiteConfig = z.infer<typeof siteConfigSchema>;
export type Section = z.infer<typeof sectionSchema>;
export type AgenciaContent = z.infer<typeof agenciaSchema>;
export type FeatureStatus = z.infer<typeof featureStatus>;
