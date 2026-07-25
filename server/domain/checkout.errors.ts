export class CheckoutValidationError extends Error {
  constructor(public readonly details: Record<string, string[]>) {
    super("Checkout validation failed");
    this.name = "CheckoutValidationError";
  }
}

/** Product exists in storefront but is not yet synced to Supabase platform catalog. */
export class ProductNotSynchronized extends Error {
  constructor(
    public readonly identifier: string,
    message?: string,
  ) {
    super(message ?? `Product not synchronized: ${identifier}`);
    this.name = "ProductNotSynchronized";
  }
}

/** Stock reservation failed atomically — another order already took the remaining units. */
export class InsufficientStockError extends Error {
  constructor(public readonly productId: string) {
    super(`Insufficient stock for product ${productId}`);
    this.name = "InsufficientStockError";
  }
}
