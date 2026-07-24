/** Raised when storage infrastructure operations fail. */
export class StorageInfrastructureError extends Error {
  readonly code = "infrastructure.storage_error";

  constructor(
    message: string,
    readonly statusCode?: number,
    readonly details?: string,
  ) {
    super(details ? `${message}: ${details}` : message);
    this.name = "StorageInfrastructureError";
  }
}

/** Raised when a requested storage object does not exist. */
export class StorageObjectNotFoundError extends StorageInfrastructureError {
  constructor(path: string) {
    super(`Storage object not found: ${path}`, 404);
    this.name = "StorageObjectNotFoundError";
  }
}
