import type { SearchModule } from "@server/application/modules/search";
import type { SearchFilters } from "@server/application/modules/search/search/dto";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readNumber,
  readQueryString,
} from "@server/api/modules/routing/module-controller.helpers";

/** Search HTTP controller — delegates to SearchModule. */
export class SearchController {
  constructor(private readonly search: SearchModule) {}

  async searchProducts(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.search.products(readSearchFilters(context));
    return createJsonResponse(context, result);
  }

  async searchCategories(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.search.categories(readSearchFilters(context));
    return createJsonResponse(context, result);
  }

  async searchSellers(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.search.sellers(readSearchFilters(context));
    return createJsonResponse(context, result);
  }
}

function readSearchFilters(context: ApiRequestContext): SearchFilters {
  const query = context.query;
  return Object.freeze({
    query: readQueryString(query, "q") ?? readQueryString(query, "query"),
    sellerId: readQueryString(query, "sellerId"),
    catalogId: readQueryString(query, "catalogId"),
    categoryId: readQueryString(query, "categoryId"),
    minPrice: readNumber(readQueryString(query, "minPrice")),
    maxPrice: readNumber(readQueryString(query, "maxPrice")),
    limit: readNumber(readQueryString(query, "limit")),
  });
}
