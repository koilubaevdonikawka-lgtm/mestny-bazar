/** Input required to start delivery after order assembly. */
export interface DeliveryRequest {
  readonly orderId: string;
  readonly courierId: string;
}

export function createDeliveryRequest(input: DeliveryRequest): DeliveryRequest {
  return Object.freeze({
    orderId: input.orderId.trim(),
    courierId: input.courierId.trim(),
  });
}
