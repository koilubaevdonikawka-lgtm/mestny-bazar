/** Input required to start order fulfillment after checkout. */
export interface FulfillmentRequest {
  readonly orderId: string;
  readonly paymentId: string;
}

export function createFulfillmentRequest(input: FulfillmentRequest): FulfillmentRequest {
  return Object.freeze({
    orderId: input.orderId.trim(),
    paymentId: input.paymentId.trim(),
  });
}
