import type {
  ProductMediaItem,
  ProductPrice,
} from "@server/application/modules/product/product/models";

/** Buyer-facing product card for catalog display. */
export interface CatalogProductCard {
  readonly id: string;
  readonly sellerId: string;
  readonly name: string;
  readonly description: string | null;
  readonly price: ProductPrice;
  readonly stockAvailable: number;
  readonly media: readonly ProductMediaItem[];
  readonly categoryId: string | null;
  readonly createdAt: string;
}

/** Full buyer-facing product details. */
export interface CatalogProductDetails extends CatalogProductCard {
  readonly attributes: Readonly<Record<string, string>>;
}

/** Product availability snapshot for buyers. */
export interface CatalogProductAvailability {
  readonly productId: string;
  readonly published: boolean;
  readonly available: boolean;
  readonly stockQuantity: number;
}

/** Paginated catalog listing result. */
export interface CatalogProductListResult {
  readonly items: readonly CatalogProductCard[];
  readonly total: number;
  readonly limit: number;
  readonly offset: number;
}
