/**
 * Shared by CategoryAdminService and SellerProductService (previously two
 * byte-for-byte identical copies except for the fallback prefix) — the only
 * part that differs per entity is what the timestamp-based fallback slug is
 * prefixed with when the name strips down to nothing.
 */
export function slugify(name: string, fallbackPrefix: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return base.slice(0, 80) || `${fallbackPrefix}-${Date.now()}`;
}
