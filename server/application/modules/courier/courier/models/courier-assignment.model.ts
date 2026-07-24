/** Courier assignment linking a courier to an order delivery. */
export interface CourierAssignment {
  readonly id: string;
  readonly courierId: string;
  readonly orderId: string;
  readonly address: string;
  readonly phone: string;
  readonly status: "assigned" | "in_transit" | "completed";
  readonly assignedAt: string;
  readonly startedAt: string | null;
  readonly completedAt: string | null;
}

export function createCourierAssignment(input: {
  id: string;
  courierId: string;
  orderId: string;
  address: string;
  phone: string;
}): CourierAssignment {
  const timestamp = new Date().toISOString();

  return Object.freeze({
    id: input.id.trim(),
    courierId: input.courierId.trim(),
    orderId: input.orderId.trim(),
    address: input.address.trim(),
    phone: input.phone.trim(),
    status: "assigned",
    assignedAt: timestamp,
    startedAt: null,
    completedAt: null,
  });
}

export function withCourierAssignmentStarted(assignment: CourierAssignment): CourierAssignment {
  const timestamp = new Date().toISOString();

  return Object.freeze({
    ...assignment,
    status: "in_transit",
    startedAt: timestamp,
  });
}

export function withCourierAssignmentCompleted(assignment: CourierAssignment): CourierAssignment {
  const timestamp = new Date().toISOString();

  return Object.freeze({
    ...assignment,
    status: "completed",
    completedAt: timestamp,
  });
}
