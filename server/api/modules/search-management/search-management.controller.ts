import { ApiValidationError } from "@server/api/errors/api.errors";
import type { SearchManagementApplicationService } from "@server/application/search-management/services/search-management-application.service";
import type { SearchFilters } from "@server/application/search-management/dto/search-query.dto";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readNumber,
  readQueryString,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** Search management HTTP controller — read-only search over catalog. */
export class SearchManagementController {
  constructor(private readonly search: SearchManagementApplicationService) {}

  async search(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const filters = readSearchFilters(context);
    const useAdvanced = hasAdvancedFilters(filters);

    const result = useAdvanced
      ? await this.search.advancedSearch(filters)
      : filters.availableOnly
        ? await this.search.searchAvailable(filters)
        : filters.minPrice !== undefined && filters.maxPrice !== undefined
          ? await this.search.searchByPriceRange(filters.minPrice, filters.maxPrice, filters)
          : await this.search.search(filters);

    return createJsonResponse(context, result.value);
  }

  async searchByCategory(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const categoryId = this.requireParam(context, "id");
    const result = await this.search.searchByCategory(categoryId, readSearchFilters(context));
    return createJsonResponse(context, result.value);
  }

  async searchBySeller(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const sellerId = this.requireParam(context, "id");
    const result = await this.search.searchBySeller(sellerId, readSearchFilters(context));
    return createJsonResponse(context, result.value);
  }

  async suggestions(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const query = readQueryString(context.query, "q") ?? readQueryString(context.query, "query");
    if (!query) {
      throw new ApiValidationError({ q: ["q or query is required"] });
    }
    const limit = readNumber(readQueryString(context.query, "limit"));
    const result = await this.search.suggestions(query, limit);
    return createJsonResponse(context, result.value);
  }

  async autocomplete(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const query = readQueryString(context.query, "q") ?? readQueryString(context.query, "query");
    if (!query) {
      throw new ApiValidationError({ q: ["q or query is required"] });
    }
    const limit = readNumber(readQueryString(context.query, "limit"));
    const result = await this.search.autocomplete(query, limit);
    return createJsonResponse(context, result.value);
  }

  private requireParam(context: ApiRequestContext, name: string): string {
    const value = readString(context.params[name]);
    if (!value) {
      throw new ApiValidationError({ [name]: [`${name} is required`] });
    }
    return value;
  }
}

function readSearchFilters(context: ApiRequestContext): SearchFilters {
  const availableOnlyRaw = readQueryString(context.query, "availableOnly");
  const availableOnly =
    availableOnlyRaw === "true" || availableOnlyRaw === "1" ? true : undefined;

  return {
    query: readQueryString(context.query, "q") ?? readQueryString(context.query, "query"),
    categoryId: readQueryString(context.query, "categoryId"),
    sellerId: readQueryString(context.query, "sellerId"),
    minPrice: readNumber(readQueryString(context.query, "minPrice")),
    maxPrice: readNumber(readQueryString(context.query, "maxPrice")),
    availableOnly,
    minRating: readNumber(readQueryString(context.query, "minRating")),
    limit: readNumber(readQueryString(context.query, "limit")),
    offset: readNumber(readQueryString(context.query, "offset")),
  };
}

function hasAdvancedFilters(filters: SearchFilters): boolean {
  const filterCount = [
    filters.query,
    filters.categoryId,
    filters.sellerId,
    filters.minPrice,
    filters.maxPrice,
    filters.availableOnly,
    filters.minRating,
  ].filter((value) => value !== undefined && value !== false && value !== "").length;

  return filterCount >= 2;
}
