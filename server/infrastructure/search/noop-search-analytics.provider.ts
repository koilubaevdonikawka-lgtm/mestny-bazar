import type { ISearchAnalyticsProvider } from "@server/application/search-management/contracts/search-analytics-provider.contract";
import type { SearchFilters } from "@server/application/search-management/dto/search-query.dto";

/** No-op analytics provider until Analytics BCM is connected. */
export class NoopSearchAnalyticsProvider implements ISearchAnalyticsProvider {
  async trackSearch(_filters: SearchFilters, _resultCount: number): Promise<void> {
    // Reserved for Analytics BCM / Experience Engine integration.
  }

  async trackSuggestion(_query: string): Promise<void> {
    // Reserved for Analytics BCM / Experience Engine integration.
  }

  async trackAutocomplete(_query: string): Promise<void> {
    // Reserved for Analytics BCM / Experience Engine integration.
  }
}
