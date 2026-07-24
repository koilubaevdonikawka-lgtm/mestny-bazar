import type { Payment } from "@server/application/modules/payment/payment/models";
import { fromSnapshotRow, toSnapshotRow } from "@server/infrastructure/supabase/mappers";
import type { SnapshotRow } from "@server/infrastructure/supabase/shared";

/** Maps payment snapshots to Supabase rows. */
export const PaymentMapper = {
  toSnapshotRow(payment: Payment): SnapshotRow<Payment> {
    return toSnapshotRow(payment);
  },

  fromSnapshotRow(row: SnapshotRow<Payment> | null): Payment | null {
    return fromSnapshotRow(row);
  },
};
