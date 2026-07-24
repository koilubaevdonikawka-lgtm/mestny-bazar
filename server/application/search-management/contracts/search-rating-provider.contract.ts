/** Product rating lookup for search filters — replace with Reviews BCM later. */
export interface ISearchRatingProvider {
  getRating(productId: string): Promise<number | null>;
}
