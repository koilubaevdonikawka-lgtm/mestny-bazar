export class SellerProductNotFoundError extends Error {
  constructor(message = "Product not found") {
    super(message);
    this.name = "SellerProductNotFoundError";
  }
}

export class SellerProductValidationError extends Error {
  constructor(
    message: string,
    public readonly field?: string,
  ) {
    super(message);
    this.name = "SellerProductValidationError";
  }
}
