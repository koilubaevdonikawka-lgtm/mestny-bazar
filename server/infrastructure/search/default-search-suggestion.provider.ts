import type { CatalogProductCard } from "@server/application/catalog-management/models/catalog-product.model";
import type {
  ISearchSuggestionProvider,
  SearchSuggestion,
} from "@server/application/search-management/contracts/search-suggestion-provider.contract";

const DEFAULT_LIMIT = 10;

/** Simple prefix-based suggestions from indexed product names. */
export class DefaultSearchSuggestionProvider implements ISearchSuggestionProvider {
  suggest(
    products: readonly CatalogProductCard[],
    query: string,
    limit = DEFAULT_LIMIT,
  ): readonly SearchSuggestion[] {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return [];
    }

    const suggestions: SearchSuggestion[] = [];
    const seen = new Set<string>();

    for (const product of products) {
      const name = product.name.trim();
      const lower = name.toLowerCase();
      if (lower.includes(normalized) && !seen.has(lower)) {
        seen.add(lower);
        suggestions.push({ text: name, type: "product" });
      }
      if (suggestions.length >= limit) {
        break;
      }
    }

    if (suggestions.length < limit && normalized.length >= 2) {
      suggestions.push({ text: normalized, type: "keyword" });
    }

    return suggestions.slice(0, limit);
  }

  autocomplete(
    products: readonly CatalogProductCard[],
    query: string,
    limit = DEFAULT_LIMIT,
  ): readonly string[] {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return [];
    }

    const completions: string[] = [];
    const seen = new Set<string>();

    for (const product of products) {
      const name = product.name.trim();
      const lower = name.toLowerCase();
      if (lower.startsWith(normalized) && !seen.has(lower)) {
        seen.add(lower);
        completions.push(name);
      }
      if (completions.length >= limit) {
        break;
      }
    }

    return completions;
  }
}
