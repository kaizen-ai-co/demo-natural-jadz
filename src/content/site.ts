import raw from "./site.config.json";
import { siteConfigSchema } from "./schemas";

/** Configuración global validada. Si el JSON es inválido, el build falla con el error de Zod. */
export const site = siteConfigSchema.parse(raw);
