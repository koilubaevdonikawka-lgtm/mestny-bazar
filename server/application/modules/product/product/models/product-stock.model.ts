export interface ProductStock {
  readonly quantity: number;
}

export function createProductStock(quantity: number): ProductStock {
  if (!Number.isInteger(quantity) || quantity < 0) {
    throw new Error("Product stock quantity must be a non-negative integer.");
  }

  return Object.freeze({ quantity });
}

export function isStockAvailableForSale(stock: ProductStock): boolean {
  return stock.quantity > 0;
}
