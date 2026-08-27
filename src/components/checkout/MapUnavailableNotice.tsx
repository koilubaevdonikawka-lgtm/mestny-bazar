import { MapPinOff } from "lucide-react";
import { useTranslation } from "@/i18n/LanguageProvider";

/**
 * Задача №153 — shown by either map picker when its API key is missing or
 * its script failed to load (network error, or — the architect's own
 * documented risk — the 2GIS demo key expiring ~25.09.2026). The map is a
 * convenience on top of manual address entry, never a requirement, so this
 * is informational only: the address field and every checkout action stay
 * fully usable underneath it.
 */
export function MapUnavailableNotice() {
  const { t } = useTranslation();
  return (
    <div className="flex h-[320px] w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card px-6 text-center">
      <MapPinOff className="h-6 w-6 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">{t("cart.mapUnavailable")}</p>
    </div>
  );
}
