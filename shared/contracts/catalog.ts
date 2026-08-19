export interface CategoryDTO {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  /** design.md — admin-editable Kyrgyz name, replaces the frontend's hardcoded KG_NAME_BY_SLUG map when set. */
  nameKg: string | null;
  /** Stage 10 (subcategory architecture): null = top-level category — every
   * category created before this field existed is null, i.e. top-level. */
  parentId: string | null;
}

/** A category plus its direct/indirect children, for tree consumers
 * (Stage 11+). Built in-memory from a flat CategoryDTO[] — see
 * shared/lib/category-tree.ts — never a separate stored shape. */
export interface CategoryTreeNode extends CategoryDTO {
  children: CategoryTreeNode[];
}

export interface ProductDTO {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  currency: string;
  unit: string | null;
  imageUrl: string | null;
  /** Full gallery — already-existing products.image_urls column. May be empty even when imageUrl is set. */
  imageUrls: string[];
  stock: number;
  inStock: boolean;
  categoryId: string | null;
  manufacturer: string | null;
  countryOfOrigin: string | null;
  /** Kilograms — used for the weight-based delivery fee formula (docs/delivery/delivery-pricing.md). Null counts as 0 kg. */
  weightKg: number | null;
  category?: Pick<CategoryDTO, "id" | "name" | "slug">;
}

/**
 * `popularity` = units sold across non-cancelled orders (order_items),
 * computed by the repository — never a fabricated/static value. `newest` is
 * the pre-existing default ordering (created_at desc).
 */
export type ProductSortBy = "newest" | "popularity" | "price_asc" | "price_desc" | "name";

export interface ProductListParams {
  /** Client-facing, slug-based category scope — validated at the API boundary (catalog.schema.ts). */
  categorySlug?: string;
  /**
   * Resolved Postgres id for `categorySlug`, set only by `CatalogService`
   * after looking the slug up via `ICategoryRepository` — never accepted
   * directly from a client/server-fn boundary (not part of the zod schema).
   */
  categoryId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  inStockOnly?: boolean;
  minPrice?: number;
  maxPrice?: number;
  /** Multi-select facet filters — matches any of the given values. */
  manufacturers?: string[];
  countriesOfOrigin?: string[];
  sortBy?: ProductSortBy;
  /** Omits one product id from the result — e.g. the product a "related
   * products" list is being built for, so it never lists itself. */
  excludeProductId?: string;
}

export interface ProductListResult {
  items: ProductDTO[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
