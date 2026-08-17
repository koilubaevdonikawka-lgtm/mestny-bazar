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
  sortOrder: number;
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
  sortOrder?: number;
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
  sortOrder?: number;
  isActive?: boolean;
  nameKg?: string | null;
  parentId?: string | null;
}
