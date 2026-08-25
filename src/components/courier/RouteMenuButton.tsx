import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  yandexMapsSearchUrl,
  twoGisSearchUrl,
  yandexMapsRouteUrl,
  twoGisRouteUrl,
} from "@shared/lib/order-display";
import { Navigation } from "lucide-react";

interface RouteMenuButtonProps {
  address: string;
  /** Resolved via useZoneCityLookup (src/hooks/) — null when the order's zoneId can't be resolved to a city; the links still work, just without the extra disambiguation. */
  city: string | null;
  /**
   * Задача №151 — order.deliveryLatitude/deliveryLongitude, set only when
   * the customer used the geolocation button at checkout. When both are
   * present, both map links route to the exact point instead of a text
   * search — most useful for villages/rural addresses poorly indexed by
   * map providers.
   */
  latitude?: number | null;
  longitude?: number | null;
  label?: string;
  className?: string;
}

/**
 * Задача №146 — replaces Задача №143's single hardcoded Yandex Maps link
 * with a compact choice between Yandex.Карты and 2GIS, opened from the same
 * button instead of two permanently-visible links. Задача №151 — prefers
 * exact-coordinate routing over text search whenever the order has real GPS
 * coordinates.
 */
export function RouteMenuButton({
  address,
  city,
  latitude,
  longitude,
  label = "Маршрут",
  className,
}: RouteMenuButtonProps) {
  const hasCoordinates = latitude != null && longitude != null;
  const yandexUrl = hasCoordinates
    ? yandexMapsRouteUrl(latitude, longitude)
    : yandexMapsSearchUrl(address, city);
  const twoGisUrl = hasCoordinates
    ? twoGisRouteUrl(latitude, longitude)
    : twoGisSearchUrl(address, city);

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
          <a href={yandexUrl} target="_blank" rel="noopener noreferrer">
            Яндекс.Карты
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={twoGisUrl} target="_blank" rel="noopener noreferrer">
            2GIS
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
