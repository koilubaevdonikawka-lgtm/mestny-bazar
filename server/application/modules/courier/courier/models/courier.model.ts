import {
  CourierStatus,
  type CourierStatusValue,
} from "@server/application/modules/courier/courier/models/courier-status.model";

/** Courier owned by the Courier capability module. */
export interface Courier {
  readonly id: string;
  readonly name: string;
  readonly phone: string;
  readonly status: CourierStatusValue;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export function createCourier(input: {
  id: string;
  name: string;
  phone: string;
}): Courier {
  const timestamp = new Date().toISOString();

  return Object.freeze({
    id: input.id.trim(),
    name: input.name.trim(),
    phone: input.phone.trim(),
    status: CourierStatus.Available,
    createdAt: timestamp,
    updatedAt: timestamp,
  });
}

export function withCourierStatus(courier: Courier, status: CourierStatusValue): Courier {
  return Object.freeze({
    ...courier,
    status,
    updatedAt: new Date().toISOString(),
  });
}
