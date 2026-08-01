export class SupplierNotFoundError extends Error {
  constructor() {
    super("Supplier not found");
    this.name = "SupplierNotFoundError";
  }
}

export class SupplierValidationError extends Error {
  constructor(
    message: string,
    public readonly field: string,
  ) {
    super(message);
    this.name = "SupplierValidationError";
  }
}

export class SupplyNotFoundError extends Error {
  constructor() {
    super("Supply not found");
    this.name = "SupplyNotFoundError";
  }
}

export class SupplyTransitionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SupplyTransitionError";
  }
}
