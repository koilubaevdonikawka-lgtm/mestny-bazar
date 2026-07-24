/** Raised when a courier completes delivery for an assignment. */
export interface DeliveryCompletedEvent {
  readonly type: "DeliveryCompleted";
  readonly assignmentId: string;
  readonly routeId: string;
  readonly courierId: string;
  readonly orderId: string;
  readonly occurredAt: string;
}

export function createDeliveryCompletedEvent(input: {
  assignmentId: string;
  routeId: string;
  courierId: string;
  orderId: string;
}): DeliveryCompletedEvent {
  return Object.freeze({
    type: "DeliveryCompleted",
    assignmentId: input.assignmentId,
    routeId: input.routeId,
    courierId: input.courierId,
    orderId: input.orderId,
    occurredAt: new Date().toISOString(),
  });
}
