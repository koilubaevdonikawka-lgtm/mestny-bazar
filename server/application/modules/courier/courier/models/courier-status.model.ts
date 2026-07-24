/** Canonical courier availability statuses. */
export const CourierStatus = {
  Available: "available",
  Assigned: "assigned",
  OnDelivery: "on_delivery",
  Offline: "offline",
} as const;

export type CourierStatusValue = (typeof CourierStatus)[keyof typeof CourierStatus];

export const COURIER_STATUS_VALUES: readonly CourierStatusValue[] = Object.values(CourierStatus);

export function isCourierStatus(value: string): value is CourierStatusValue {
  return COURIER_STATUS_VALUES.includes(value as CourierStatusValue);
}

export function assertCourierStatus(value: string): CourierStatusValue {
  if (!isCourierStatus(value)) {
    throw new Error(`Unknown courier status: ${value}`);
  }
  return value;
}
