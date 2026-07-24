/** Returned stock line recorded during the returns business process. */
export interface ReturnedItem {
  readonly productId: string;
  readonly sellerId: string;
  readonly name: string;
  readonly quantity: number;
  readonly previousStock: number;
  readonly restoredStock: number;
}

export function createReturnedItem(input: {
  productId: string;
  sellerId: string;
  name: string;
  quantity: number;
  previousStock: number;
  restoredStock: number;
}): ReturnedItem {
  return Object.freeze({
    productId: input.productId,
    sellerId: input.sellerId,
    name: input.name,
    quantity: input.quantity,
    previousStock: input.previousStock,
    restoredStock: input.restoredStock,
  });
}
