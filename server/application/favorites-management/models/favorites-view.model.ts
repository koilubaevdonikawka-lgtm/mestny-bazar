import type { CatalogProductCard } from "@server/application/catalog-management/models/catalog-product.model";

/** Favorite entry enriched with catalog product data. */
export interface FavoriteEntry {
  readonly productId: string;
  readonly addedAt: string;
  readonly product: CatalogProductCard | null;
}

export interface FavoritesListResult {
  readonly items: readonly FavoriteEntry[];
  readonly total: number;
}

export interface FavoriteCheckResult {
  readonly productId: string;
  readonly isFavorite: boolean;
}

export interface FavoritesCountResult {
  readonly count: number;
}

export interface ClearFavoritesResult {
  readonly removed: number;
}
