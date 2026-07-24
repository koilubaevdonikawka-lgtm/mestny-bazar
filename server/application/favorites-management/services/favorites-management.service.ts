/**
 * Favorites Management — stores Customer ↔ Product links only.
 *
 * Product data is fetched exclusively via ICatalogFavoritesReader (Catalog Management).
 * Does NOT store or modify product entities. No Product BCM access.
 */
import type { ICatalogFavoritesReader } from "@server/application/favorites-management/contracts/catalog-favorites-reader.contract";
import type { IFavoritesAnalyticsProvider } from "@server/application/favorites-management/contracts/favorites-analytics-provider.contract";
import type { IFavoritesEventPublisher } from "@server/application/favorites-management/contracts/favorites-event-publisher.contract";
import type { IFavoritesRecommendationProvider } from "@server/application/favorites-management/contracts/favorites-recommendation-provider.contract";
import type { IFavoritesRepository } from "@server/application/favorites-management/contracts/favorites-repository.contract";
import type { FavoriteLink } from "@server/application/favorites-management/models/favorite-link.model";
import type {
  ClearFavoritesResult,
  FavoriteCheckResult,
  FavoriteEntry,
  FavoritesCountResult,
  FavoritesListResult,
} from "@server/application/favorites-management/models/favorites-view.model";

export class FavoritesManagementService {
  constructor(
    private readonly favoritesRepository: IFavoritesRepository,
    private readonly catalogReader: ICatalogFavoritesReader,
    private readonly eventPublisher: IFavoritesEventPublisher,
    private readonly analyticsProvider: IFavoritesAnalyticsProvider,
    private readonly recommendationProvider: IFavoritesRecommendationProvider,
  ) {}

  async addProduct(customerId: string, productId: string): Promise<FavoriteLink> {
    const product = await this.catalogReader.getProduct(productId);
    if (!product) {
      throw new Error(`Product is not available in catalog: ${productId}`);
    }

    const link = await this.favoritesRepository.add(customerId, productId);
    await this.eventPublisher.publishAdded(customerId, productId);
    await this.analyticsProvider.trackAdded(customerId, productId);
    return link;
  }

  async removeProduct(customerId: string, productId: string): Promise<boolean> {
    const removed = await this.favoritesRepository.remove(customerId, productId);
    if (removed) {
      await this.eventPublisher.publishRemoved(customerId, productId);
      await this.analyticsProvider.trackRemoved(customerId, productId);
    }
    return removed;
  }

  async getFavorites(customerId: string): Promise<FavoritesListResult> {
    const links = await this.favoritesRepository.findByCustomerId(customerId);
    const items = await this.enrichLinks(links);
    return { items, total: items.length };
  }

  async isFavorite(customerId: string, productId: string): Promise<FavoriteCheckResult> {
    const isFavorite = await this.favoritesRepository.exists(customerId, productId);
    return { productId, isFavorite };
  }

  async countFavorites(customerId: string): Promise<FavoritesCountResult> {
    const count = await this.favoritesRepository.count(customerId);
    return { count };
  }

  async clearFavorites(customerId: string): Promise<ClearFavoritesResult> {
    const removed = await this.favoritesRepository.clear(customerId);
    if (removed > 0) {
      await this.eventPublisher.publishCleared(customerId, removed);
      await this.analyticsProvider.trackCleared(customerId, removed);
    }
    return { removed };
  }

  async suggestFromFavorites(customerId: string, limit = 10): Promise<readonly string[]> {
    const links = await this.favoritesRepository.findByCustomerId(customerId);
    const productIds = links.map((link) => link.productId);
    return this.recommendationProvider.suggestFromFavorites(customerId, productIds, limit);
  }

  private async enrichLinks(links: readonly FavoriteLink[]): Promise<readonly FavoriteEntry[]> {
    const productIds = links.map((link) => link.productId);
    const products = await this.catalogReader.getProducts(productIds);
    const productMap = new Map(products.map((product) => [product.id, product]));

    return links.map((link) =>
      Object.freeze({
        productId: link.productId,
        addedAt: link.addedAt,
        product: productMap.get(link.productId) ?? null,
      }),
    );
  }
}
