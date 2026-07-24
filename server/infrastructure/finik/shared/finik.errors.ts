/** Raised when Finik HTTP API returns an error response. */
export class FinikInfrastructureError extends Error {
  readonly code = "infrastructure.finik_error";

  constructor(
    message: string,
    readonly statusCode?: number,
    readonly details?: string,
  ) {
    super(details ? `${message}: ${details}` : message);
    this.name = "FinikInfrastructureError";
  }
}

/** Raised when webhook signature verification fails. */
export class FinikWebhookVerificationError extends FinikInfrastructureError {
  constructor(message = "Finik webhook signature verification failed") {
    super(message);
    this.name = "FinikWebhookVerificationError";
  }
}
