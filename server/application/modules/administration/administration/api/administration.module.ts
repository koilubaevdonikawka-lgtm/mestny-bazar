import type {
  CreateAdminRoleDto,
  GetFeatureFlagDto,
  SetMaintenanceModeDto,
  UpdateAdminRoleDto,
  UpdateFeatureFlagDto,
  UpdateMarketplaceConfigurationDto,
  UpdateSystemSettingsDto,
} from "@server/application/modules/administration/administration/dto";
import type {
  AdminRole,
  FeatureFlag,
  MaintenanceMode,
  MarketplaceConfiguration,
  SystemSettings,
} from "@server/application/modules/administration/administration/models";
import type { AdministrationService } from "@server/application/modules/administration/administration/services";

/** Public entry point for the Administration business capability module. */
export class AdministrationModule {
  constructor(private readonly service: AdministrationService) {}

  getSystemSettings(): Promise<SystemSettings> {
    return this.service.getSystemSettings();
  }

  updateSystemSettings(dto: UpdateSystemSettingsDto): Promise<SystemSettings> {
    return this.service.updateSystemSettings(dto);
  }

  getMarketplaceConfiguration(): Promise<MarketplaceConfiguration> {
    return this.service.getMarketplaceConfiguration();
  }

  updateMarketplaceConfiguration(
    dto: UpdateMarketplaceConfigurationDto,
  ): Promise<MarketplaceConfiguration> {
    return this.service.updateMarketplaceConfiguration(dto);
  }

  createAdminRole(dto: CreateAdminRoleDto): Promise<AdminRole> {
    return this.service.createAdminRole(dto);
  }

  updateAdminRole(dto: UpdateAdminRoleDto): Promise<AdminRole> {
    return this.service.updateAdminRole(dto);
  }

  getFeatureFlag(dto: GetFeatureFlagDto): Promise<FeatureFlag | null> {
    return this.service.getFeatureFlag(dto);
  }

  updateFeatureFlag(dto: UpdateFeatureFlagDto): Promise<FeatureFlag> {
    return this.service.updateFeatureFlag(dto);
  }

  setMaintenanceMode(dto: SetMaintenanceModeDto): Promise<MaintenanceMode> {
    return this.service.setMaintenanceMode(dto);
  }
}
