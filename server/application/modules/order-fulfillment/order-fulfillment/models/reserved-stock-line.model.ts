/** Reserved stock line recorded during order fulfillment. */
export interface ReservedStockLine {
  readonly reservationId: string;
  readonly productId: string;
  readonly sellerId: string;
  readonly name: string;
  readonly quantity: number;
  readonly previousStock: number;
  readonly remainingStock: number;
}

export function createReservedStockLine(input: {
  reservationId: string;
  productId: string;
  sellerId: string;
  name: string;
  quantity: number;
  previousStock: number;
  remainingStock: number;
}): ReservedStockLine {
  return Object.freeze({
    reservationId: input.reservationId,
    productId: input.productId,
    sellerId: input.sellerId,
    name: input.name,
    quantity: input.quantity,
    previousStock: input.previousStock,
    remainingStock: input.remainingStock,
  });
}
