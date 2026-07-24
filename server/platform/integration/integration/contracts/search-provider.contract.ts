export interface SearchQuery {
  readonly query: string;
  readonly limit?: number;
  readonly offset?: number;
  readonly filters?: Readonly<Record<string, string>>;
}

export interface SearchResultItem {
  readonly id: string;
  readonly title: string;
  readonly score: number;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export interface SearchResults {
  readonly items: readonly SearchResultItem[];
  readonly total: number;
}

/** Platform search provider contract. */
export interface ISearchProvider {
  search(request: SearchQuery): Promise<SearchResults>;
}
