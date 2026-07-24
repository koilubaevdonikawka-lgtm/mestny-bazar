/** Delivery task created when a courier is assigned to an order. */
export interface DeliveryTask {
  readonly id: string;
  readonly orderId: string;
  readonly courierId: string;
  readonly status: "assigned";
  readonly address: string;
  readonly phone: string;
  readonly createdAt: string;
}

export function createDeliveryTask(input: {
  id: string;
  orderId: string;
  courierId: string;
  address: string;
  phone: string;
}): DeliveryTask {
  return Object.freeze({
    id: input.id.trim(),
    orderId: input.orderId.trim(),
    courierId: input.courierId.trim(),
    status: "assigned",
    address: input.address.trim(),
    phone: input.phone.trim(),
    createdAt: new Date().toISOString(),
  });
}
