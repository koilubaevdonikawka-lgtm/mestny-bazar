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

/** Stage 19 — variant stock reservation failed atomically. Mirrors InsufficientStockError exactly, scoped to a variant. */
export class InsufficientVariantStockError extends Error {
  constructor(public readonly variantId: string) {
    super(`Insufficient stock for product variant ${variantId}`);
    this.name = "InsufficientVariantStockError";
  }
}
