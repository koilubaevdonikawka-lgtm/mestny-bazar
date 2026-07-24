import type { ISearchRatingProvider } from "@server/application/search-management/contracts/search-rating-provider.contract";

/** Stub rating provider until Reviews BCM is connected. */
export class DefaultSearchRatingProvider implements ISearchRatingProvider {
  async getRating(_productId: string): Promise<number | null> {
    return null;
  }
}
