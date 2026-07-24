import type { IAdministrationStore } from "@server/application/modules/administration/administration/contracts";
import type {
  AdminRole,
  FeatureFlag,
  MaintenanceMode,
  MarketplaceConfiguration,
  SystemSettings,
} from "@server/application/modules/administration/administration/models";
import {
  AdministrationMapper,
  AdministrationRecordType,
  type AdministrationRecordTypeValue,
} from "@server/infrastructure/marketplace/mappers/administration.mapper";
import { MarketplaceSnapshotTables } from "@server/infrastructure/marketplace/shared";
import type { ISupabaseClientProvider } from "@server/infrastructure/supabase/client";
import type { SupabaseConfiguration } from "@server/infrastructure/supabase/configuration";
import { assertSupabaseSuccess, type SnapshotRow } from "@server/infrastructure/supabase/shared";

/** Supabase-backed administration store using JSON snapshot persistence. */
export class SupabaseAdministrationStore implements IAdministrationStore {
  constructor(
    private readonly clientProvider: ISupabaseClientProvider,
    private readonly configuration: SupabaseConfiguration,
  ) {}

  async getSystemSettings(): Promise<SystemSettings | null> {
    return this.findSingleton<SystemSettings>(AdministrationRecordType.SystemSettings);
  }

  async saveSystemSettings(settings: SystemSettings): Promise<void> {
    await this.saveRecord(settings.id, AdministrationRecordType.SystemSettings, settings);
  }

  async getMarketplaceConfiguration(): Promise<MarketplaceConfiguration | null> {
    return this.findSingleton<MarketplaceConfiguration>(
      AdministrationRecordType.MarketplaceConfiguration,
    );
  }

  async saveMarketplaceConfiguration(configuration: MarketplaceConfiguration): Promise<void> {
    await this.saveRecord(
      configuration.id,
      AdministrationRecordType.MarketplaceConfiguration,
      configuration,
    );
  }

  async saveAdminRole(role: AdminRole): Promise<void> {
    await this.saveRecord(role.id, AdministrationRecordType.AdminRole, role);
  }

  async findAdminRoleById(roleId: string): Promise<AdminRole | null> {
    return this.findRecord<AdminRole>(roleId.trim(), AdministrationRecordType.AdminRole);
  }

  async findAdminRoleByName(name: string): Promise<AdminRole | null> {
    const rows = assertSupabaseSuccess(
      `${MarketplaceSnapshotTables.administrationRecords}.selectByName`,
      await this.table()
        .select("id, record_type, snapshot, updated_at")
        .eq("record_type", AdministrationRecordType.AdminRole)
        .limit(200),
    ) as Array<SnapshotRow<AdminRole> & { record_type?: string }>;

    const normalized = name.trim().toLowerCase();
    const match = rows.find((row) => {
      const role = AdministrationMapper.fromSnapshotRow<AdminRole>(row);
      return role?.name.trim().toLowerCase() === normalized;
    });

    return match ? AdministrationMapper.fromSnapshotRow<AdminRole>(match) : null;
  }

  async listAdminRoles(): Promise<AdminRole[]> {
    const rows = assertSupabaseSuccess(
      `${MarketplaceSnapshotTables.administrationRecords}.selectRoles`,
      await this.table()
        .select("id, record_type, snapshot, updated_at")
        .eq("record_type", AdministrationRecordType.AdminRole),
    ) as Array<SnapshotRow<AdminRole> & { record_type?: string }>;

    return rows
      .map((row) => AdministrationMapper.fromSnapshotRow<AdminRole>(row))
      .filter((role): role is AdminRole => role !== null);
  }

  async getFeatureFlag(key: string): Promise<FeatureFlag | null> {
    return this.findRecord<FeatureFlag>(key.trim(), AdministrationRecordType.FeatureFlag);
  }

  async saveFeatureFlag(flag: FeatureFlag): Promise<void> {
    await this.saveRecord(flag.key, AdministrationRecordType.FeatureFlag, flag);
  }

  async getMaintenanceMode(): Promise<MaintenanceMode | null> {
    return this.findSingleton<MaintenanceMode>(AdministrationRecordType.MaintenanceMode);
  }

  async saveMaintenanceMode(mode: MaintenanceMode): Promise<void> {
    await this.saveRecord(mode.id, AdministrationRecordType.MaintenanceMode, mode);
  }

  private async findSingleton<T>(recordType: AdministrationRecordTypeValue): Promise<T | null> {
    const rows = assertSupabaseSuccess(
      `${MarketplaceSnapshotTables.administrationRecords}.selectSingleton`,
      await this.table()
        .select("id, record_type, snapshot, updated_at")
        .eq("record_type", recordType)
        .limit(1),
    ) as Array<SnapshotRow<T> & { record_type?: string }>;

    return AdministrationMapper.fromSnapshotRow<T>(rows[0] ?? null);
  }

  private async findRecord<T>(id: string, recordType: AdministrationRecordTypeValue): Promise<T | null> {
    const row = assertSupabaseSuccess(
      `${MarketplaceSnapshotTables.administrationRecords}.select`,
      await this.table()
        .select("id, record_type, snapshot, updated_at")
        .eq("id", id)
        .eq("record_type", recordType)
        .maybeSingle(),
    ) as (SnapshotRow<T> & { record_type?: string }) | null;

    return AdministrationMapper.fromSnapshotRow<T>(row);
  }

  private async saveRecord<T extends { updatedAt: string }>(
    id: string,
    recordType: AdministrationRecordTypeValue,
    snapshot: T,
  ): Promise<void> {
    const row = AdministrationMapper.toSnapshotRow(id, recordType, snapshot);
    assertSupabaseSuccess(
      `${MarketplaceSnapshotTables.administrationRecords}.upsert`,
      await this.table().upsert(row, { onConflict: "id" }),
    );
  }

  private table() {
    const client = this.clientProvider.getServiceClient();
    if (this.configuration.schema === "public") {
      return client.from(MarketplaceSnapshotTables.administrationRecords);
    }
    return client
      .schema(this.configuration.schema)
      .from(MarketplaceSnapshotTables.administrationRecords);
  }
}
