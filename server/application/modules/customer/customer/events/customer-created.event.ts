/** Raised when a new customer is created. */
export interface CustomerCreatedEvent {
  readonly type: "CustomerCreated";
  readonly customerId: string;
  readonly displayName: string;
  readonly occurredAt: string;
}

export function createCustomerCreatedEvent(input: {
  customerId: string;
  displayName: string;
}): CustomerCreatedEvent {
  return Object.freeze({
    type: "CustomerCreated",
    customerId: input.customerId,
    displayName: input.displayName,
    occurredAt: new Date().toISOString(),
  });
}
