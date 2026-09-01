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
  /** Fractional manual display order (Задача №230, same idea as CategoryDTO.sortOrder but NUMERIC — supports inserting between two products, e.g. 1.1 between 1 and 2, without renumbering the rest). Null = not yet numbered. */
  sortOrder: number | null;
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
  /** Задача №230 — fractional manual display order. Omitted/undefined = leave unset (null). */
  sortOrder?: number | null;
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
