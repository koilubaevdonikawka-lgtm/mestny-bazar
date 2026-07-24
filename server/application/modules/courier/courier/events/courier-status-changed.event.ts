import type { CourierStatusValue } from "@server/application/modules/courier/courier/models";

/** Raised when a courier status changes. */
export interface CourierStatusChangedEvent {
  readonly type: "CourierStatusChanged";
  readonly courierId: string;
  readonly previousStatus: CourierStatusValue;
  readonly newStatus: CourierStatusValue;
  readonly occurredAt: string;
}

export function createCourierStatusChangedEvent(input: {
  courierId: string;
  previousStatus: CourierStatusValue;
  newStatus: CourierStatusValue;
}): CourierStatusChangedEvent {
  return Object.freeze({
    type: "CourierStatusChanged",
    courierId: input.courierId,
    previousStatus: input.previousStatus,
    newStatus: input.newStatus,
    occurredAt: new Date().toISOString(),
  });
}
