export class InvalidTranslationRequestError extends Error {
  constructor(message = "Invalid translation request") {
    super(message);
    this.name = "InvalidTranslationRequestError";
  }
}

export class AiProviderError extends Error {
  constructor(message = "AI provider request failed") {
    super(message);
    this.name = "AiProviderError";
  }
}
