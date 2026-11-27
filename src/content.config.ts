import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { agenciaSchema, pageSchema } from "./content/schemas";

// Cada archivo src/content/pages/<slug>.json es una ruta (hoy solo la 404).
const pages = defineCollection({
  loader: glob({ pattern: "*.json", base: "./src/content/pages" }),
  schema: pageSchema,
});

// Textos de la demo «Su agencia trabajando».
const agencia = defineCollection({
  loader: glob({ pattern: "*.json", base: "./src/content/agencia" }),
  schema: agenciaSchema,
});

export const collections = { pages, agencia };
