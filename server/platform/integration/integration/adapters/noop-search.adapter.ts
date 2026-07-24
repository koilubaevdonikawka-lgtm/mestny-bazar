import type { ISearchProvider, SearchQuery, SearchResults } from "@server/platform/integration/integration/contracts";

/** Placeholder search provider until an external search service is configured. */
export class NoopSearchProvider implements ISearchProvider {
  search(_request: SearchQuery): Promise<SearchResults> {
    return Promise.resolve(Object.freeze({ items: Object.freeze([]), total: 0 }));
  }
}
