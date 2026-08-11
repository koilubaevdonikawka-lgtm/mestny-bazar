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
  stock: number;
  publicationStatus: ProductPublicationStatus;
  categoryId: string | null;
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
  stock?: number;
  categoryId?: string;
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
