export class CourierProfileNotFoundError extends Error {
  constructor() {
    super("Courier profile not found");
    this.name = "CourierProfileNotFoundError";
  }
}

export class CourierProfileAlreadyExistsError extends Error {
  constructor() {
    super("Courier profile already exists for this user");
    this.name = "CourierProfileAlreadyExistsError";
  }
}

export class CourierProfileValidationError extends Error {
  constructor(
    message: string,
    public readonly field: string,
  ) {
    super(message);
    this.name = "CourierProfileValidationError";
  }
}
