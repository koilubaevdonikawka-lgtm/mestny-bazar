/** Delivery route created when a courier starts delivery. */
export interface DeliveryRoute {
  readonly id: string;
  readonly assignmentId: string;
  readonly orderId: string;
  readonly courierId: string;
  readonly destinationAddress: string;
  readonly destinationPhone: string;
  readonly status: "planned" | "active" | "completed";
  readonly createdAt: string;
  readonly startedAt: string | null;
  readonly completedAt: string | null;
}

export function createDeliveryRoute(input: {
  id: string;
  assignmentId: string;
  orderId: string;
  courierId: string;
  destinationAddress: string;
  destinationPhone: string;
}): DeliveryRoute {
  const timestamp = new Date().toISOString();

  return Object.freeze({
    id: input.id.trim(),
    assignmentId: input.assignmentId.trim(),
    orderId: input.orderId.trim(),
    courierId: input.courierId.trim(),
    destinationAddress: input.destinationAddress.trim(),
    destinationPhone: input.destinationPhone.trim(),
    status: "active",
    createdAt: timestamp,
    startedAt: timestamp,
    completedAt: null,
  });
}

export function withDeliveryRouteCompleted(route: DeliveryRoute): DeliveryRoute {
  const timestamp = new Date().toISOString();

  return Object.freeze({
    ...route,
    status: "completed",
    completedAt: timestamp,
  });
}
