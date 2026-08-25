import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { yandexMapsSearchUrl, twoGisSearchUrl } from "@shared/lib/order-display";
import { Navigation } from "lucide-react";

interface RouteMenuButtonProps {
  address: string;
  /** Resolved via useZoneCityLookup (src/hooks/) — null when the order's zoneId can't be resolved to a city; the links still work, just without the extra disambiguation. */
  city: string | null;
  label?: string;
  className?: string;
}

/**
 * Задача №146 — replaces Задача №143's single hardcoded Yandex Maps link
 * with a compact choice between Yandex.Карты and 2GIS, opened from the same
 * button instead of two permanently-visible links.
 */
export function RouteMenuButton({
  address,
  city,
  label = "Маршрут",
  className,
}: RouteMenuButtonProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={
            className ??
            "inline-flex items-center gap-1.5 text-sm text-primary hover:underline flex-shrink-0"
          }
        >
          <Navigation className="h-4 w-4" />
          {label}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <a href={yandexMapsSearchUrl(address, city)} target="_blank" rel="noopener noreferrer">
            Яндекс.Карты
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={twoGisSearchUrl(address, city)} target="_blank" rel="noopener noreferrer">
            2GIS
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
