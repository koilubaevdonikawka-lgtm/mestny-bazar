/** Favorite marketplace item tracked for a customer. */
export interface FavoriteItem {
  readonly userId: string;
  readonly productId: string;
  readonly sellerId: string;
  readonly addedAt: string;
}

export function createFavoriteItem(input: {
  userId: string;
  productId: string;
  sellerId: string;
}): FavoriteItem {
  return Object.freeze({
    userId: input.userId,
    productId: input.productId,
    sellerId: input.sellerId,
    addedAt: new Date().toISOString(),
  });
}
