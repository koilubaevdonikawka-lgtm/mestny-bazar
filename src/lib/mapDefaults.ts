/**
 * Задача №153 — default map-picker center. Neither CityDTO (shared/contracts/
 * delivery.ts) nor the current cities table has lat/lng columns at all, and
 * stores.lat/lng exists but the table has zero rows in production today
 * (confirmed via a direct DB check, Задача №148) — there is genuinely
 * nothing in the database to derive a default center from right now. This
 * is Bishkek's well-known public city-center coordinate, used only to point
 * the map somewhere sensible on first open; the customer picks their real
 * point from there. Revisit if stores/cities ever gain real coordinates.
 */
export const DEFAULT_MAP_CENTER = {
  latitude: 42.8746,
  longitude: 74.5698,
} as const;
