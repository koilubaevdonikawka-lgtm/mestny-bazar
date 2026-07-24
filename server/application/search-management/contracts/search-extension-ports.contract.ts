/**
 * Future integration ports for Search Management.
 * Not implemented — reserved for external search engines and personalization.
 *
 * - Elasticsearch / OpenSearch / Meilisearch → ISearchIndexProvider + IFullTextSearchProvider
 * - AI Search / Vector Search → IFullTextSearchProvider
 * - Recommendation Engine / Experience Engine → ISearchRankingProvider
 */

/** Elasticsearch / OpenSearch cluster adapter. */
export interface IElasticsearchAdapter {
  readonly engine: "elasticsearch" | "opensearch";
}

/** Meilisearch cluster adapter. */
export interface IMeilisearchAdapter {
  readonly engine: "meilisearch";
}

/** AI-powered semantic search. */
export interface IAISearchProvider {
  semanticSearch(query: string, limit?: number): Promise<readonly string[]>;
}

/** Vector embedding search. */
export interface IVectorSearchProvider {
  vectorSearch(embedding: readonly number[], limit?: number): Promise<readonly string[]>;
}

/** Recommendation Engine ranking overlay. */
export interface ISearchRecommendationEngine {
  rerankProductIds(productIds: readonly string[], customerId?: string): Promise<readonly string[]>;
}

/** Experience Engine search UX enrichment. */
export interface ISearchExperienceEngine {
  enrichSearchResults<T extends { id: string }>(items: readonly T[]): Promise<readonly T[]>;
}
