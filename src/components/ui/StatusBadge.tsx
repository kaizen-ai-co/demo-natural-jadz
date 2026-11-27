import type { FeatureStatus } from "@/content/schemas";
import { cn } from "@/lib/utils";

const styles: Record<FeatureStatus, string> = {
  disponible: "border-status-available text-status-available",
  prototipo: "border-status-prototype text-status-prototype",
  pendiente: "border-status-pending text-status-pending",
};

/** Etiqueta obligatoria en demos: Disponible / Prototipo / Pendiente. El texto llega del contenido. */
export function StatusBadge({ status, label }: { status: FeatureStatus; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border bg-bg px-2 py-0.5 text-sm font-semibold",
        styles[status],
      )}
    >
      {label}
    </span>
  );
}
