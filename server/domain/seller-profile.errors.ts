export class SellerProfileNotFoundError extends Error {
  constructor() {
    super("Seller profile not found");
    this.name = "SellerProfileNotFoundError";
  }
}

export class SellerProfileValidationError extends Error {
  constructor(
    message: string,
    public readonly field: string,
  ) {
    super(message);
    this.name = "SellerProfileValidationError";
  }
}
