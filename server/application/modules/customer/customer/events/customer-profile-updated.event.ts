/** Raised when a customer profile is updated. */
export interface CustomerProfileUpdatedEvent {
  readonly type: "CustomerProfileUpdated";
  readonly customerId: string;
  readonly displayName: string;
  readonly occurredAt: string;
}

export function createCustomerProfileUpdatedEvent(input: {
  customerId: string;
  displayName: string;
}): CustomerProfileUpdatedEvent {
  return Object.freeze({
    type: "CustomerProfileUpdated",
    customerId: input.customerId,
    displayName: input.displayName,
    occurredAt: new Date().toISOString(),
  });
}
