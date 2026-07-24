import type { Courier } from "@server/application/modules/courier/courier/models";
import type { SnapshotRow } from "@server/infrastructure/supabase/shared";
import { fromSnapshotRow, toSnapshotRow } from "@server/infrastructure/supabase/mappers";

/** Maps couriers to Supabase snapshot rows. */
export const CourierMapper = {
  toSnapshotRow(courier: Courier): SnapshotRow<Courier> {
    return toSnapshotRow(courier);
  },

  fromSnapshotRow(row: SnapshotRow<Courier> | null): Courier | null {
    return fromSnapshotRow(row);
  },
};
