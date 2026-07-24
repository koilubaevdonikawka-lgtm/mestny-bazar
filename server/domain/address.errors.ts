export class AddressNotFoundError extends Error {
  constructor(message = "Address not found") {
    super(message);
    this.name = "AddressNotFoundError";
  }
}

export class AddressValidationError extends Error {
  constructor(
    message: string,
    public readonly field?: string,
  ) {
    super(message);
    this.name = "AddressValidationError";
  }
}
