export class ApiValidationError extends Error {
  readonly name = "ApiValidationError";

  constructor(
    readonly fieldErrors: Readonly<Record<string, readonly string[]>>,
    message = "Validation failed",
  ) {
    super(message);
  }
}

export class ApiNotFoundError extends Error {
  readonly name = "ApiNotFoundError";

  constructor(
    readonly resource: string,
    message?: string,
  ) {
    super(message ?? `${resource} not found`);
  }
}

export class ApiApplicationError extends Error {
  readonly name = "ApiApplicationError";

  constructor(
    message: string,
    readonly code: string = "APPLICATION_ERROR",
  ) {
    super(message);
  }
}

export class ApiInfrastructureError extends Error {
  readonly name = "ApiInfrastructureError";

  constructor(
    message: string,
    readonly code: string = "INFRASTRUCTURE_ERROR",
  ) {
    super(message);
  }
}
