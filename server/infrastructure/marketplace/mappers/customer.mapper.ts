import type { Customer } from "@server/application/modules/customer/customer/models";
import type { SnapshotRow } from "@server/infrastructure/supabase/shared";
import { fromSnapshotRow, toSnapshotRow } from "@server/infrastructure/supabase/mappers";

/** Maps customers to Supabase snapshot rows. */
export const CustomerMapper = {
  toSnapshotRow(customer: Customer): SnapshotRow<Customer> {
    return toSnapshotRow(customer);
  },

  fromSnapshotRow(row: SnapshotRow<Customer> | null): Customer | null {
    return fromSnapshotRow(row);
  },
};
