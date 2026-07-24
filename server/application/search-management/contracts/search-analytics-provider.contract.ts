import type { SearchFilters } from "@server/application/search-management/dto/search-query.dto";

/** Search analytics — replace with Analytics BCM / Experience Engine later. */
export interface ISearchAnalyticsProvider {
  trackSearch(filters: SearchFilters, resultCount: number): Promise<void>;
  trackSuggestion(query: string): Promise<void>;
  trackAutocomplete(query: string): Promise<void>;
}
