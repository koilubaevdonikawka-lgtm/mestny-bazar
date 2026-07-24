/** Raised when a courier is assigned to an order. */
export interface CourierAssignedEvent {
  readonly type: "CourierAssigned";
  readonly assignmentId: string;
  readonly courierId: string;
  readonly orderId: string;
  readonly occurredAt: string;
}

export function createCourierAssignedEvent(input: {
  assignmentId: string;
  courierId: string;
  orderId: string;
}): CourierAssignedEvent {
  return Object.freeze({
    type: "CourierAssigned",
    assignmentId: input.assignmentId,
    courierId: input.courierId,
    orderId: input.orderId,
    occurredAt: new Date().toISOString(),
  });
}
