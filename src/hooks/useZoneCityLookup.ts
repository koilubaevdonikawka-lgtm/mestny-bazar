import { useQuery } from "@tanstack/react-query";
import { listDeliveryZones } from "@/api/delivery-zone";
import { listCities } from "@/api/city";

/**
 * Задача №146 — resolves an order's zoneId to its city name, for
 * disambiguating map-search links (e.g. "Кант" vs a same-named place in
 * another country) with the correct Kyrgyzstan city. Both lists are small
 * and change rarely, so they're cached generously; an unresolvable zoneId
 * (null, or a zone/city not found) returns null — callers must not block
 * on it, see yandexMapsSearchUrl/twoGisSearchUrl's own city? fallback.
 */
export function useZoneCityLookup(): (zoneId: string | null) => string | null {
  const zonesQuery = useQuery({
    queryKey: ["delivery-zones", "list"],
    queryFn: listDeliveryZones,
    staleTime: 10 * 60 * 1000,
  });
  const citiesQuery = useQuery({
    queryKey: ["cities", "list"],
    queryFn: listCities,
    staleTime: 10 * 60 * 1000,
  });

  return (zoneId: string | null): string | null => {
    if (!zoneId) return null;
    const zone = zonesQuery.data?.find((z) => z.id === zoneId);
    if (!zone) return null;
    const city = citiesQuery.data?.find((c) => c.id === zone.cityId);
    return city?.name ?? null;
  };
}
