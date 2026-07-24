/** Raised when a customer address is updated. */
export interface CustomerAddressUpdatedEvent {
  readonly type: "CustomerAddressUpdated";
  readonly customerId: string;
  readonly addressId: string;
  readonly isDefault: boolean;
  readonly occurredAt: string;
}

export function createCustomerAddressUpdatedEvent(input: {
  customerId: string;
  addressId: string;
  isDefault: boolean;
}): CustomerAddressUpdatedEvent {
  return Object.freeze({
    type: "CustomerAddressUpdated",
    customerId: input.customerId,
    addressId: input.addressId,
    isDefault: input.isDefault,
    occurredAt: new Date().toISOString(),
  });
}
