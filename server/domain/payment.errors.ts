export class PaymentNotFoundError extends Error {
  constructor(message = "Payment not found") {
    super(message);
    this.name = "PaymentNotFoundError";
  }
}

export class PaymentProviderError extends Error {
  constructor(message = "Payment provider request failed") {
    super(message);
    this.name = "PaymentProviderError";
  }
}

export class InvalidWebhookSignatureError extends Error {
  constructor(message = "Webhook signature verification failed") {
    super(message);
    this.name = "InvalidWebhookSignatureError";
  }
}

export class PaymentAlreadyProcessedError extends Error {
  constructor(message = "Payment has already reached a terminal state") {
    super(message);
    this.name = "PaymentAlreadyProcessedError";
  }
}

export class PaymentRetryNotAllowedError extends Error {
  constructor(message = "This order's payment cannot be retried") {
    super(message);
    this.name = "PaymentRetryNotAllowedError";
  }
}
