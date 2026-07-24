/** Customer ↔ Product association stored by Favorites Management. */
export interface FavoriteLink {
  readonly customerId: string;
  readonly productId: string;
  readonly addedAt: string;
}

export function createFavoriteLink(customerId: string, productId: string): FavoriteLink {
  return Object.freeze({
    customerId: customerId.trim(),
    productId: productId.trim(),
    addedAt: new Date().toISOString(),
  });
}
