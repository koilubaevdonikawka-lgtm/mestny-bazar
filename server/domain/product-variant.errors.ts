export class ProductVariantNotFoundError extends Error {
  constructor() {
    super("Product variant not found");
    this.name = "ProductVariantNotFoundError";
  }
}

export class ProductVariantValidationError extends Error {
  constructor(
    message: string,
    public readonly field: string,
  ) {
    super(message);
    this.name = "ProductVariantValidationError";
  }
}
