/** Raised when a customer address is added. */
export interface CustomerAddressAddedEvent {
  readonly type: "CustomerAddressAdded";
  readonly customerId: string;
  readonly addressId: string;
  readonly isDefault: boolean;
  readonly occurredAt: string;
}

export function createCustomerAddressAddedEvent(input: {
  customerId: string;
  addressId: string;
  isDefault: boolean;
}): CustomerAddressAddedEvent {
  return Object.freeze({
    type: "CustomerAddressAdded",
    customerId: input.customerId,
    addressId: input.addressId,
    isDefault: input.isDefault,
    occurredAt: new Date().toISOString(),
  });
}
