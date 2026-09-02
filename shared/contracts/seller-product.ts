export const ProductPublicationStatus = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
  HIDDEN: "HIDDEN",
} as const;

export type ProductPublicationStatus =
  (typeof ProductPublicationStatus)[keyof typeof ProductPublicationStatus];

export interface SellerProductDTO {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  currency: string;
  unit: string | null;
  imageUrl: string | null;
  /** Промпт №103 — full gallery; imageUrl stays the cover (first) image for existing seller/customer views. */
  imageUrls: string[];
  manufacturer: string | null;
  countryOfOrigin: string | null;
  sku: string | null;
  /** Kilograms — used for the weight-based delivery fee formula (docs/delivery/delivery-pricing.md). Null counts as 0 kg. */
  weightKg: number | null;
  stock: number;
  publicationStatus: ProductPublicationStatus;
  categoryId: string | null;
  /**
   * Global, category-independent manual display order (Задача №230/231).
   * A DECIMAL STRING, deliberately not `number` — a JS double can't hold
   * arbitrarily long fractions (e.g. "1.15555555555") without rounding, and
   * supabase-js parses every HTTP response with the platform's native
   * JSON.parse *inside the library*, which would silently turn a JSON
   * number literal into a lossy double before this code ever runs. The
   * string is compared/stored as Postgres `numeric` server-side (real
   * decimal semantics — never JS number comparison) and always read back
   * through products.sort_order_text (a generated text mirror column PostgREST
   * serializes as a JSON string, not a number — see the Задача №231
   * migration). Admin/seller-only — never sent to a customer-facing DTO.
   * Null = not yet numbered.
   */
  sortOrder: string | null;
}

export interface CreateSellerProductRequest {
  name: string;
  slug?: string;
  description?: string;
  price: number;
  currency?: string;
  unit?: string;
  imageUrl?: string;
  imageUrls?: string[];
  manufacturer?: string;
  countryOfOrigin?: string;
  sku?: string;
  weightKg?: number | null;
  stock?: number;
  categoryId?: string;
  /**
   * Задача №230/231 — decimal string (see SellerProductDTO.sortOrder for
   * why not `number`). On create: omitted/empty (null) auto-assigns
   * current-max+1 (SellerProductService.createProduct, via a SQL MAX() —
   * never a JS Math.max). On update: omitted leaves the existing value
   * untouched; explicit null clears it back to unset.
   */
  sortOrder?: string | null;
  /**
   * Only meaningful when the actor is an admin (Промпт №103 — unified product
   * lifecycle) — SellerProductService always forces DRAFT on seller_create
   * regardless of this field, matching the pre-existing seller behavior.
   */
  publicationStatus?: ProductPublicationStatus;
}

export interface UpdateSellerProductRequest extends Partial<CreateSellerProductRequest> {
  id: string;
}

/** Same shape as ProductListResult (catalog.ts) applied to SellerProductDTO — admin's paginated, cross-seller product list. */
export interface SellerProductListResult {
  items: SellerProductDTO[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface SellerProductListParams {
  page?: number;
  pageSize?: number;
}

/**
 * Задача №237 — reference-only stats for the product form's sort-order
 * hint, never used in list/save logic. maxWhole is a decimal STRING for
 * the same JSON.parse precision reason as SellerProductDTO.sortOrder —
 * both are computed server-side (SQL FLOOR/COUNT DISTINCT), never JS
 * Math.floor. distinctWholeCount is a plain count, safe as `number`.
 * maxWhole: null / distinctWholeCount: 0 means no product has a sortOrder
 * set yet (e.g. right after the Задача №233 reset).
 */
export interface ProductSortOrderStatsDTO {
  maxWhole: string | null;
  distinctWholeCount: number;
}
