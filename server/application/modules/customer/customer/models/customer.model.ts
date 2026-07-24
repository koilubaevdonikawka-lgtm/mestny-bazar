import type { CustomerProfile } from "@server/application/modules/customer/customer/models/customer-profile.model";
import { normalizeCustomerProfile } from "@server/application/modules/customer/customer/models/customer-profile.model";
import {
  CustomerStatus,
  normalizeCustomerStatus,
  type CustomerStatusValue,
} from "@server/application/modules/customer/customer/models/customer-status.model";

/** Customer aggregate owned by the Customer capability module. */
export interface Customer {
  readonly id: string;
  readonly profile: CustomerProfile;
  readonly status: CustomerStatusValue;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export function createCustomer(input: {
  id: string;
  profile: CustomerProfile;
  status?: CustomerStatusValue;
}): Customer {
  const timestamp = new Date().toISOString();

  return Object.freeze({
    id: input.id.trim(),
    profile: input.profile,
    status: input.status ?? CustomerStatus.Active,
    createdAt: timestamp,
    updatedAt: timestamp,
  });
}

export function withCustomerProfile(customer: Customer, profile: CustomerProfile): Customer {
  return Object.freeze({
    ...customer,
    profile,
    updatedAt: new Date().toISOString(),
  });
}

export function withCustomerStatus(customer: Customer, status: CustomerStatusValue): Customer {
  return Object.freeze({
    ...customer,
    status,
    updatedAt: new Date().toISOString(),
  });
}

export function normalizeCustomer(customer: Customer): Customer {
  return Object.freeze({
    ...customer,
    status: normalizeCustomerStatus(customer.status),
    profile: normalizeCustomerProfile(customer.profile),
  });
}
