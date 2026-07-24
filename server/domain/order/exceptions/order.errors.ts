/** Order domain error base. */
export abstract class OrderDomainError extends Error {
  abstract readonly code: string;

  protected constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class InvalidOrderIdError extends OrderDomainError {
  readonly code = "INVALID_ORDER_ID";
  constructor(message = "Order id must be a non-empty string") {
    super(message);
  }
}

export class InvalidOrderNumberError extends OrderDomainError {
  readonly code = "INVALID_ORDER_NUMBER";
  constructor(message = "Order number must be a non-empty string") {
    super(message);
  }
}

export class InvalidCustomerIdError extends OrderDomainError {
  readonly code = "INVALID_CUSTOMER_ID";
  constructor(message = "Customer id must be a non-empty string") {
    super(message);
  }
}

export class InvalidSellerIdError extends OrderDomainError {
  readonly code = "INVALID_SELLER_ID";
  constructor(message = "Seller id must be a non-empty string") {
    super(message);
  }
}

export class InvalidCatalogIdError extends OrderDomainError {
  readonly code = "INVALID_CATALOG_ID";
  constructor(message = "Catalog id must be a non-empty string") {
    super(message);
  }
}

export class InvalidProductIdError extends OrderDomainError {
  readonly code = "INVALID_PRODUCT_ID";
  constructor(message = "Product id must be a non-empty string") {
    super(message);
  }
}

export class InvalidOrderStatusError extends OrderDomainError {
  readonly code = "INVALID_ORDER_STATUS";
  constructor(message = "Order status is invalid") {
    super(message);
  }
}

export class InvalidOrderAddressError extends OrderDomainError {
  readonly code = "INVALID_ORDER_ADDRESS";
  constructor(message = "Order address must be at least 5 characters") {
    super(message);
  }
}

export class InvalidOrderPhoneError extends OrderDomainError {
  readonly code = "INVALID_ORDER_PHONE";
  constructor(message = "Order phone must contain at least 9 digits") {
    super(message);
  }
}

export class InvalidOrderCommentError extends OrderDomainError {
  readonly code = "INVALID_ORDER_COMMENT";
  constructor(message = "Order comment exceeds maximum length") {
    super(message);
  }
}

export class InvalidOrderMoneyError extends OrderDomainError {
  readonly code = "INVALID_ORDER_MONEY";
  constructor(message = "Order money amount is invalid") {
    super(message);
  }
}

export class InvalidOrderCurrencyError extends OrderDomainError {
  readonly code = "INVALID_ORDER_CURRENCY";
  constructor(message = "Order currency must be a 3-letter ISO code") {
    super(message);
  }
}

export class InvalidOrderQuantityError extends OrderDomainError {
  readonly code = "INVALID_ORDER_QUANTITY";
  constructor(message = "Order quantity must be a positive integer") {
    super(message);
  }
}

export class InvalidOrderTotalsError extends OrderDomainError {
  readonly code = "INVALID_ORDER_TOTALS";
  constructor(message = "Order totals are invalid") {
    super(message);
  }
}

export class InvalidPaymentMethodError extends OrderDomainError {
  readonly code = "INVALID_PAYMENT_METHOD";
  constructor(message = "Payment method is invalid") {
    super(message);
  }
}

export class InvalidDeliveryMethodError extends OrderDomainError {
  readonly code = "INVALID_DELIVERY_METHOD";
  constructor(message = "Delivery method is invalid") {
    super(message);
  }
}

export class InvalidOrderItemError extends OrderDomainError {
  readonly code = "INVALID_ORDER_ITEM";
  constructor(message = "Order item is invalid") {
    super(message);
  }
}

export class OrderLifecycleViolationError extends OrderDomainError {
  readonly code = "ORDER_LIFECYCLE_VIOLATION";
  constructor(
    message: string,
    public readonly fromStatus: string,
    public readonly toStatus: string,
  ) {
    super(message);
  }
}

export class OrderPolicyViolationError extends OrderDomainError {
  readonly code = "ORDER_POLICY_VIOLATION";
  constructor(
    message: string,
    public readonly action: string,
  ) {
    super(message);
  }
}

export class OrderInvariantViolationError extends OrderDomainError {
  readonly code = "ORDER_INVARIANT_VIOLATION";
  constructor(message: string) {
    super(message);
  }
}
