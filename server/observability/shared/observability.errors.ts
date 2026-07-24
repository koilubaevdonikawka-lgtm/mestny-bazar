/** Base class for observability-layer failures. */
export abstract class ObservabilityError extends Error {
  abstract readonly code: string;

  protected constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

/** Raised when an observability provider is unavailable. */
export class ObservabilityProviderError extends ObservabilityError {
  readonly code = "observability.provider_unavailable";

  constructor(message = "Observability provider is unavailable.") {
    super(message);
  }
}

/** Raised when a health check fails critically. */
export class HealthCheckFailedError extends ObservabilityError {
  readonly code = "observability.health_check_failed";

  constructor(message = "Health check failed.") {
    super(message);
  }
}
