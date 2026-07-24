export class ProductPublicationDeniedError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ProductPublicationDeniedError";
  }
}
