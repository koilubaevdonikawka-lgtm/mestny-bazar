import type { CatalogListQuery } from "@server/application/catalog-management/dto/catalog-query.dto";
import type { CatalogProductCard } from "@server/application/catalog-management/models/catalog-product.model";

/**
 * Future integration ports for Catalog Management.
 * Not implemented — reserved for Search Engine, Experience Engine, Analytics BCM,
 * Loyalty BCM, and AI Personalization.
 */

/** Search Engine — full-text and faceted catalog search. */
export interface ICatalogSearchProvider {
  searchProducts(query: string, filters?: CatalogListQuery): Promise<readonly CatalogProductCard[]>;
}

/** Experience Engine — enriches catalog cards with UX metadata (badges, layouts). */
export interface ICatalogExperienceEnricher {
  enrichProducts(cards: readonly CatalogProductCard[]): Promise<readonly CatalogProductCard[]>;
}

/** Analytics BCM — impression and conversion context for ranking. */
export interface ICatalogAnalyticsContext {
  trackProductView(productId: string, sessionId?: string): Promise<void>;
}

/** Loyalty BCM — personalized offers and member pricing hints. */
export interface ICatalogLoyaltyContext {
  resolveCustomerTier(customerId: string): Promise<string | null>;
}

/** AI Personalization — replaces default recommendation heuristics. */
export interface ICatalogPersonalizationEngine {
  personalizeProductIds(
    candidateIds: readonly string[],
    customerId?: string,
    limit?: number,
  ): Promise<readonly string[]>;
}
