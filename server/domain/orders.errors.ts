export class UnauthorizedError extends Error {
  constructor(message = "Authentication required") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class OrderNotFoundError extends Error {
  constructor(message = "Order not found") {
    super(message);
    this.name = "OrderNotFoundError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "Access denied") {
    super(message);
    this.name = "ForbiddenError";
  }
}

/** Optimistic-concurrency conflict: the order's status changed between read and write. */
export class OrderConcurrentModificationError extends Error {
  constructor(message = "Order was modified by another action — please retry") {
    super(message);
    this.name = "OrderConcurrentModificationError";
  }
}
