/**
 * Задача №151 — free, no-API-key reverse geocoding via OpenStreetMap's
 * public Nominatim instance. Client-side only: the browser sets its own
 * Referer, which satisfies Nominatim's usage policy for this kind of
 * low-volume, user-initiated lookup — never called from the server.
 * Returns null (not a throw) on any failure — the caller must fall back to
 * keeping whatever address text the customer already had, coordinates are
 * still useful on their own even if this fails.
 */
export async function reverseGeocode(latitude: number, longitude: number): Promise<string | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=ru&zoom=18`;
    const response = await fetch(url, { headers: { Accept: "application/json" } });
    if (!response.ok) return null;
    const data: unknown = await response.json();
    const displayName = (data as { display_name?: unknown } | null)?.display_name;
    return typeof displayName === "string" && displayName.trim().length > 0
      ? displayName.trim()
      : null;
  } catch {
    return null;
  }
}
