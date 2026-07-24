import type { SnapshotRow } from "@server/infrastructure/supabase/shared";
import { fromSnapshotRow } from "@server/infrastructure/supabase/mappers";

export const AdministrationRecordType = {
  SystemSettings: "system_settings",
  MarketplaceConfiguration: "marketplace_configuration",
  AdminRole: "admin_role",
  FeatureFlag: "feature_flag",
  MaintenanceMode: "maintenance_mode",
} as const;

export type AdministrationRecordTypeValue =
  (typeof AdministrationRecordType)[keyof typeof AdministrationRecordType];

/** Maps administration records to Supabase snapshot rows. */
export const AdministrationMapper = {
  toSnapshotRow<T extends { updatedAt: string }>(
    id: string,
    recordType: AdministrationRecordTypeValue,
    snapshot: T,
  ): SnapshotRow<T> & { record_type: string } {
    return {
      id,
      record_type: recordType,
      snapshot,
      updated_at: snapshot.updatedAt,
    };
  },

  fromSnapshotRow<T>(
    row: (SnapshotRow<T> & { record_type?: string }) | null,
  ): T | null {
    return fromSnapshotRow(row);
  },
};
