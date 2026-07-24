/**
 * Customer account lifecycle statuses.
 * Extended for future moderation and onboarding flows — Stage 89.1 adds states only.
 */
export const CustomerStatus = {
  Draft: "Draft",
  Verified: "Verified",
  Active: "Active",
  Suspended: "Suspended",
  Blocked: "Blocked",
  Deactivated: "Deactivated",
} as const;

export type CustomerStatusValue = (typeof CustomerStatus)[keyof typeof CustomerStatus];

export const CUSTOMER_STATUS_VALUES: readonly CustomerStatusValue[] = Object.values(CustomerStatus);

export function isCustomerStatus(value: string): value is CustomerStatusValue {
  return CUSTOMER_STATUS_VALUES.includes(value as CustomerStatusValue);
}

/** Returns true only for Active — existing Stage 89 behavior is preserved. */
export function isActiveCustomerStatus(status: CustomerStatusValue): boolean {
  return status === CustomerStatus.Active;
}

export function normalizeCustomerStatus(value: string | undefined): CustomerStatusValue {
  if (value && isCustomerStatus(value)) {
    return value;
  }
  return CustomerStatus.Active;
}
