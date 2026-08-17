export class VariantStockNotFoundError extends Error {
  constructor() {
    super("Variant stock is not tracked yet — call initializeStock first");
    this.name = "VariantStockNotFoundError";
  }
}

export class VariantStockAlreadyExistsError extends Error {
  constructor() {
    super("Variant stock is already tracked");
    this.name = "VariantStockAlreadyExistsError";
  }
}

export class VariantStockValidationError extends Error {
  constructor(
    message: string,
    public readonly field: string,
  ) {
    super(message);
    this.name = "VariantStockValidationError";
  }
}
