import type {
  AdminRole,
  FeatureFlag,
  MaintenanceMode,
  MarketplaceConfiguration,
  SystemSettings,
} from "@server/application/modules/administration/administration/models";

/** Administration persistence contract — implemented by infrastructure adapters. */
export interface IAdministrationStore {
  getSystemSettings(): Promise<SystemSettings | null>;
  saveSystemSettings(settings: SystemSettings): Promise<void>;

  getMarketplaceConfiguration(): Promise<MarketplaceConfiguration | null>;
  saveMarketplaceConfiguration(configuration: MarketplaceConfiguration): Promise<void>;

  saveAdminRole(role: AdminRole): Promise<void>;
  findAdminRoleById(roleId: string): Promise<AdminRole | null>;
  findAdminRoleByName(name: string): Promise<AdminRole | null>;
  listAdminRoles(): Promise<AdminRole[]>;

  getFeatureFlag(key: string): Promise<FeatureFlag | null>;
  saveFeatureFlag(flag: FeatureFlag): Promise<void>;

  getMaintenanceMode(): Promise<MaintenanceMode | null>;
  saveMaintenanceMode(mode: MaintenanceMode): Promise<void>;
}
