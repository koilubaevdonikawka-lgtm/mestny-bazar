/** Base class for security-layer failures. */
export abstract class SecurityError extends Error {
  abstract readonly code: string;

  protected constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

/** Raised when authentication is required but missing or invalid. */
export class UnauthorizedError extends SecurityError {
  readonly code = "security.unauthorized";

  constructor(message = "Authentication is required.") {
    super(message);
  }
}

/** Raised when the caller is authenticated but lacks sufficient privileges. */
export class ForbiddenError extends SecurityError {
  readonly code = "security.forbidden";

  constructor(message = "Access denied.") {
    super(message);
  }
}

/** Raised when a security token or session is invalid or expired. */
export class InvalidSecurityTokenError extends SecurityError {
  readonly code = "security.invalid_token";

  constructor(message = "Security token is invalid or expired.") {
    super(message);
  }
}
