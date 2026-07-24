/** Product domain error base. */
export abstract class ProductDomainError extends Error {
  abstract readonly code: string;

  protected constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class InvalidProductIdError extends ProductDomainError {
  readonly code = "INVALID_PRODUCT_ID";

  constructor(message = "Product id must be a non-empty string") {
    super(message);
  }
}

export class InvalidProductNameError extends ProductDomainError {
  readonly code = "INVALID_PRODUCT_NAME";

  constructor(message = "Product name must be between 2 and 200 characters") {
    super(message);
  }
}

export class InvalidProductDescriptionError extends ProductDomainError {
  readonly code = "INVALID_PRODUCT_DESCRIPTION";

  constructor(message = "Product description must not exceed 5000 characters") {
    super(message);
  }
}

export class InvalidProductPriceError extends ProductDomainError {
  readonly code = "INVALID_PRODUCT_PRICE";

  constructor(message = "Product price must be a positive amount with a valid currency") {
    super(message);
  }
}

export class InvalidProductInventoryError extends ProductDomainError {
  readonly code = "INVALID_PRODUCT_INVENTORY";

  constructor(message = "Product inventory must be a non-negative integer") {
    super(message);
  }
}

export class InvalidProductMediaError extends ProductDomainError {
  readonly code = "INVALID_PRODUCT_MEDIA";

  constructor(message = "Product media collection is invalid") {
    super(message);
  }
}

export class InvalidProductAttributesError extends ProductDomainError {
  readonly code = "INVALID_PRODUCT_ATTRIBUTES";

  constructor(message = "Product attributes are invalid") {
    super(message);
  }
}

export class InvalidSellerIdError extends ProductDomainError {
  readonly code = "INVALID_SELLER_ID";

  constructor(message = "Seller id must be a non-empty string") {
    super(message);
  }
}

export class ProductLifecycleViolationError extends ProductDomainError {
  readonly code = "PRODUCT_LIFECYCLE_VIOLATION";

  constructor(
    message: string,
    public readonly fromStatus: string,
    public readonly toStatus: string,
  ) {
    super(message);
  }
}

export class ProductPolicyViolationError extends ProductDomainError {
  readonly code = "PRODUCT_POLICY_VIOLATION";

  constructor(
    message: string,
    public readonly action: string,
  ) {
    super(message);
  }
}

export class ProductInvariantViolationError extends ProductDomainError {
  readonly code = "PRODUCT_INVARIANT_VIOLATION";

  constructor(message: string) {
    super(message);
  }
}
