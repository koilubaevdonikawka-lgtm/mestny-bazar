/** Seller domain error base. */
export abstract class SellerDomainError extends Error {
  abstract readonly code: string;

  protected constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class InvalidSellerIdError extends SellerDomainError {
  readonly code = "INVALID_SELLER_ID";
  constructor(message = "Seller id must be a non-empty string") {
    super(message);
  }
}

export class InvalidSellerNameError extends SellerDomainError {
  readonly code = "INVALID_SELLER_NAME";
  constructor(message = "Seller name must be between 2 and 200 characters") {
    super(message);
  }
}

export class InvalidSellerPhoneError extends SellerDomainError {
  readonly code = "INVALID_SELLER_PHONE";
  constructor(message = "Seller phone must contain at least 9 digits") {
    super(message);
  }
}

export class InvalidSellerEmailError extends SellerDomainError {
  readonly code = "INVALID_SELLER_EMAIL";
  constructor(message = "Seller email is invalid") {
    super(message);
  }
}

export class InvalidSellerAddressError extends SellerDomainError {
  readonly code = "INVALID_SELLER_ADDRESS";
  constructor(message = "Seller address must be at least 5 characters") {
    super(message);
  }
}

export class InvalidSellerRatingError extends SellerDomainError {
  readonly code = "INVALID_SELLER_RATING";
  constructor(message = "Seller rating must be between 0 and 5") {
    super(message);
  }
}

export class InvalidSellerStatusError extends SellerDomainError {
  readonly code = "INVALID_SELLER_STATUS";
  constructor(message = "Seller status is invalid") {
    super(message);
  }
}

export class InvalidSellerVerificationError extends SellerDomainError {
  readonly code = "INVALID_SELLER_VERIFICATION";
  constructor(message = "Seller verification state is invalid") {
    super(message);
  }
}

export class InvalidSellerLimitsError extends SellerDomainError {
  readonly code = "INVALID_SELLER_LIMITS";
  constructor(message = "Seller limits are invalid") {
    super(message);
  }
}

export class SellerLifecycleViolationError extends SellerDomainError {
  readonly code = "SELLER_LIFECYCLE_VIOLATION";
  constructor(
    message: string,
    public readonly fromStatus: string,
    public readonly toStatus: string,
  ) {
    super(message);
  }
}

export class SellerPolicyViolationError extends SellerDomainError {
  readonly code = "SELLER_POLICY_VIOLATION";
  constructor(
    message: string,
    public readonly action: string,
  ) {
    super(message);
  }
}

export class SellerInvariantViolationError extends SellerDomainError {
  readonly code = "SELLER_INVARIANT_VIOLATION";
  constructor(message: string) {
    super(message);
  }
}
