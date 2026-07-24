import type { IAdministrationStore } from "@server/application/modules/administration/administration/contracts";
import {
  type AdminRole,
  type FeatureFlag,
  type MaintenanceMode,
  type MarketplaceConfiguration,
  type SystemSettings,
} from "@server/application/modules/administration/administration/models";
import { InMemoryStore } from "@server/infrastructure/shared";

/** In-memory administration store for development and tests. */
export class MemoryAdministrationStore implements IAdministrationStore {
  private systemSettings: SystemSettings | null = null;
  private marketplaceConfiguration: MarketplaceConfiguration | null = null;
  private maintenanceMode: MaintenanceMode | null = null;
  private readonly roles = new InMemoryStore<AdminRole>((role) => role.id);
  private readonly rolesByName = new Map<string, string>();
  private readonly featureFlags = new InMemoryStore<FeatureFlag>((flag) => flag.key);

  async getSystemSettings(): Promise<SystemSettings | null> {
    return this.systemSettings;
  }

  async saveSystemSettings(settings: SystemSettings): Promise<void> {
    this.systemSettings = settings;
  }

  async getMarketplaceConfiguration(): Promise<MarketplaceConfiguration | null> {
    return this.marketplaceConfiguration;
  }

  async saveMarketplaceConfiguration(configuration: MarketplaceConfiguration): Promise<void> {
    this.marketplaceConfiguration = configuration;
  }

  async saveAdminRole(role: AdminRole): Promise<void> {
    this.roles.set(role);
    this.rolesByName.set(role.name.trim().toLowerCase(), role.id);
  }

  async findAdminRoleById(roleId: string): Promise<AdminRole | null> {
    return this.roles.get(roleId.trim()) ?? null;
  }

  async findAdminRoleByName(name: string): Promise<AdminRole | null> {
    const roleId = this.rolesByName.get(name.trim().toLowerCase());
    if (!roleId) {
      return null;
    }
    return this.roles.get(roleId) ?? null;
  }

  async listAdminRoles(): Promise<AdminRole[]> {
    return this.roles.values();
  }

  async getFeatureFlag(key: string): Promise<FeatureFlag | null> {
    return this.featureFlags.get(key.trim()) ?? null;
  }

  async saveFeatureFlag(flag: FeatureFlag): Promise<void> {
    this.featureFlags.set(flag);
  }

  async getMaintenanceMode(): Promise<MaintenanceMode | null> {
    return this.maintenanceMode;
  }

  async saveMaintenanceMode(mode: MaintenanceMode): Promise<void> {
    this.maintenanceMode = mode;
  }
}
