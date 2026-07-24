import type { CustomerAddress } from "@server/application/modules/customer/customer/models";
import type { SnapshotRow } from "@server/infrastructure/supabase/shared";
import { fromSnapshotRow, toSnapshotRow } from "@server/infrastructure/supabase/mappers";

/** Maps customer addresses to Supabase snapshot rows. */
export const CustomerAddressMapper = {
  toSnapshotRow(
    address: CustomerAddress,
  ): SnapshotRow<CustomerAddress> & { customer_id: string } {
    return {
      ...toSnapshotRow(address),
      customer_id: address.customerId,
    };
  },

  fromSnapshotRow(
    row: (SnapshotRow<CustomerAddress> & { customer_id?: string }) | null,
  ): CustomerAddress | null {
    return fromSnapshotRow(row);
  },
};
