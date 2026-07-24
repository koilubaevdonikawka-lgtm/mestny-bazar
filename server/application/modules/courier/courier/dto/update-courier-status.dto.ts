import type { CourierStatusValue } from "@server/application/modules/courier/courier/models";

export interface UpdateCourierStatusDto {
  readonly courierId: string;
  readonly status: CourierStatusValue;
}
