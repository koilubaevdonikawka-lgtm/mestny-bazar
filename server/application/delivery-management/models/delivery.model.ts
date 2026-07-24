/** Delivery lifecycle statuses. */
export const DeliveryStatus = {
  Pending: "Pending",
  Assigned: "Assigned",
  InTransit: "InTransit",
  Delivered: "Delivered",
  Cancelled: "Cancelled",
} as const;

export type DeliveryStatus = (typeof DeliveryStatus)[keyof typeof DeliveryStatus];

/** Delivery record owned by Delivery Management. */
export interface Delivery {
  readonly deliveryId: string;
  readonly orderId: string;
  readonly customerId: string;
  readonly courierId: string | null;
  readonly status: DeliveryStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export function createDelivery(input: {
  deliveryId: string;
  orderId: string;
  customerId: string;
}): Delivery {
  const now = new Date().toISOString();
  return Object.freeze({
    deliveryId: input.deliveryId,
    orderId: input.orderId.trim(),
    customerId: input.customerId.trim(),
    courierId: null,
    status: DeliveryStatus.Pending,
    createdAt: now,
    updatedAt: now,
  });
}

export function withDeliveryStatus(delivery: Delivery, status: DeliveryStatus): Delivery {
  return Object.freeze({
    ...delivery,
    status,
    updatedAt: new Date().toISOString(),
  });
}

export function withCourierId(delivery: Delivery, courierId: string): Delivery {
  return Object.freeze({
    ...delivery,
    courierId: courierId.trim(),
    updatedAt: new Date().toISOString(),
  });
}

export function isDeliveryStatus(value: string): value is DeliveryStatus {
  return Object.values(DeliveryStatus).includes(value as DeliveryStatus);
}
