/**
 * Admin-facing category shape — distinct from CategoryDTO (catalog.ts), which
 * is the customer-facing read model (active categories only, no isActive
 * field). Admins need to see and toggle inactive categories too; mirrors the
 * SellerProductDTO/ProductDTO split already used for products.
 */
export interface AdminCategoryDTO {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  /**
   * Задача №232 — a DECIMAL STRING, not `number` (same reasoning as
   * SellerProductDTO.sortOrder — a JS double can't hold arbitrarily long
   * fractions like "1.15555555555" without rounding, and supabase-js
   * parses every HTTP response with the platform's native JSON.parse
   * *inside the library*, which would silently turn a JSON number literal
   * into a lossy double first). Always read via categories.sort_order_text
   * (a generated text mirror column), never the raw numeric column.
   * Deliberately non-nullable, unlike products: the column stays
   * `NOT NULL DEFAULT 0`, so this can never actually be null — typing it
   * `string | null` to blindly mirror the product pattern would just be
   * inaccurate. Scoped per parent_id (siblings only) — see
   * next_subcategory_sort_order in the Задача №232 migration; two
   * categories/subcategories under different parents sharing the same
   * value is normal, not a conflict.
   */
  sortOrder: string;
  isActive: boolean;
  /** design.md — replaces the frontend's hardcoded KG_NAME_BY_SLUG map when set. */
  nameKg: string | null;
  /** Stage 10: null = top-level category. Not yet settable from the admin
   * UI (next-stage work) — the field exists so the write path doesn't need
   * a second migration when that UI is built. */
  parentId: string | null;
}

export interface CreateCategoryRequest {
  name: string;
  slug?: string;
  description?: string | null;
  imageUrl?: string | null;
  /** Задача №232 — decimal string (see AdminCategoryDTO.sortOrder). Omitted auto-assigns current-max+1 among siblings of the same parentId (server-side SQL MAX, never JS). */
  sortOrder?: string;
  isActive?: boolean;
  nameKg?: string | null;
  parentId?: string | null;
}

export interface UpdateCategoryRequest {
  id: string;
  name?: string;
  slug?: string;
  description?: string | null;
  imageUrl?: string | null;
  sortOrder?: string;
  isActive?: boolean;
  nameKg?: string | null;
  parentId?: string | null;
}
