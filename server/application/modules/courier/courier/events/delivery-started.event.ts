/** Raised when a courier starts delivery for an assignment. */
export interface DeliveryStartedEvent {
  readonly type: "DeliveryStarted";
  readonly assignmentId: string;
  readonly routeId: string;
  readonly courierId: string;
  readonly orderId: string;
  readonly occurredAt: string;
}

export function createDeliveryStartedEvent(input: {
  assignmentId: string;
  routeId: string;
  courierId: string;
  orderId: string;
}): DeliveryStartedEvent {
  return Object.freeze({
    type: "DeliveryStarted",
    assignmentId: input.assignmentId,
    routeId: input.routeId,
    courierId: input.courierId,
    orderId: input.orderId,
    occurredAt: new Date().toISOString(),
  });
}
