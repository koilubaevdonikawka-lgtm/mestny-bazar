import type { AnalyticsModule } from "@server/application/modules/analytics/analytics/api/analytics.module";
import type { IAdministrationStore } from "@server/application/modules/administration/administration/contracts";
import type {
  CreateAdminRoleDto,
  GetFeatureFlagDto,
  SetMaintenanceModeDto,
  UpdateAdminRoleDto,
  UpdateFeatureFlagDto,
  UpdateMarketplaceConfigurationDto,
  UpdateSystemSettingsDto,
} from "@server/application/modules/administration/administration/dto";
import {
  createAdminRoleUpdatedEvent,
  createFeatureFlagUpdatedEvent,
  createMaintenanceModeChangedEvent,
  createMarketplaceConfigurationUpdatedEvent,
  createSystemSettingsUpdatedEvent,
} from "@server/application/modules/administration/administration/events";
import {
  createAdminRole,
  createDefaultMaintenanceMode,
  createDefaultMarketplaceConfiguration,
  createDefaultSystemSettings,
  createFeatureFlag,
  withAdminRoleUpdate,
  withFeatureFlagUpdate,
  withMaintenanceModeUpdate,
  withMarketplaceConfigurationUpdate,
  withSystemSettingsUpdate,
  type AdminRole,
  type FeatureFlag,
  type MaintenanceMode,
  type MarketplaceConfiguration,
  type SystemSettings,
} from "@server/application/modules/administration/administration/models";
import {
  AdministrationPolicy,
  FeatureFlagPolicy,
} from "@server/application/modules/administration/administration/policies";
import type { CustomerModule } from "@server/application/modules/customer/customer/api/customer.module";
import type { InventoryModule } from "@server/application/modules/inventory/inventory/api/inventory.module";
import type { MarketplaceModule } from "@server/application/modules/marketplace/marketplace/api/marketplace.module";
import { ModerationTarget } from "@server/application/modules/moderation/moderation/models";
import type { ModerationModule } from "@server/application/modules/moderation/moderation/api/moderation.module";
import type { OrderModule } from "@server/application/modules/order/order/api/order.module";
import type { PaymentModule } from "@server/application/modules/payment/payment/api/payment.module";
import type { PricingModule } from "@server/application/modules/pricing/pricing/api/pricing.module";
import type { SellerModule } from "@server/application/modules/seller/seller/api/seller.module";
import type { SupportModule } from "@server/application/modules/support/support/api/support.module";
import type { IIdGenerator } from "@server/application/ports";

/** Administration business capability service — orchestrates platform settings via IAdministrationStore. */
export class AdministrationService {
  private readonly administrationPolicy = new AdministrationPolicy();
  private readonly featureFlagPolicy = new FeatureFlagPolicy();

  constructor(
    private readonly store: IAdministrationStore,
    private readonly idGenerator: IIdGenerator,
    private readonly marketplace: MarketplaceModule,
    private readonly moderation: ModerationModule,
    private readonly support: SupportModule,
    private readonly analytics: AnalyticsModule,
    private readonly customer: CustomerModule,
    private readonly seller: SellerModule,
    private readonly order: OrderModule,
    private readonly payment: PaymentModule,
    private readonly inventory: InventoryModule,
    private readonly pricing: PricingModule,
  ) {}

  async getSystemSettings(): Promise<SystemSettings> {
    return this.requireSystemSettings();
  }

  async updateSystemSettings(dto: UpdateSystemSettingsDto): Promise<SystemSettings> {
    validateActorId(dto.actorId);
    const roles = await this.store.listAdminRoles();
    this.administrationPolicy.assertCanManagePlatform(dto.actorId, roles);

    const current = await this.requireSystemSettings();
    const updated = withSystemSettingsUpdate(current, {
      platformName: dto.platformName,
      supportEmail: dto.supportEmail,
      defaultLocale: dto.defaultLocale,
      defaultCurrency: dto.defaultCurrency,
      updatedBy: dto.actorId,
    });

    await this.store.saveSystemSettings(updated);
    createSystemSettingsUpdatedEvent(updated);
    return updated;
  }

  async getMarketplaceConfiguration(): Promise<MarketplaceConfiguration> {
    return this.requireMarketplaceConfiguration();
  }

  async updateMarketplaceConfiguration(
    dto: UpdateMarketplaceConfigurationDto,
  ): Promise<MarketplaceConfiguration> {
    validateActorId(dto.actorId);
    const roles = await this.store.listAdminRoles();
    this.administrationPolicy.assertCanManagePlatform(dto.actorId, roles);

    await this.analytics.getMarketplaceMetrics();
    await this.moderation.getStatus({
      target: ModerationTarget.Listing,
      targetId: "platform",
    });

    const current = await this.requireMarketplaceConfiguration();
    const updated = withMarketplaceConfigurationUpdate(current, {
      maxListingCount: dto.maxListingCount,
      autoApproveSellers: dto.autoApproveSellers,
      commissionRate: dto.commissionRate,
      updatedBy: dto.actorId,
    });

    await this.store.saveMarketplaceConfiguration(updated);
    createMarketplaceConfigurationUpdatedEvent(updated);
    return updated;
  }

  async createAdminRole(dto: CreateAdminRoleDto): Promise<AdminRole> {
    validateActorId(dto.actorId);
    validateRoleName(dto.name);

    const roles = await this.store.listAdminRoles();
    this.administrationPolicy.assertCanManagePlatform(dto.actorId, roles);
    this.administrationPolicy.assertValidRolePermissions(dto.permissions);
    this.administrationPolicy.assertUniqueRoleName(dto.name, roles);

    const role = createAdminRole({
      id: this.idGenerator.generate(),
      name: dto.name,
      permissions: dto.permissions,
      description: dto.description,
    });

    await this.store.saveAdminRole(role);
    createAdminRoleUpdatedEvent(role);
    return role;
  }

  async updateAdminRole(dto: UpdateAdminRoleDto): Promise<AdminRole> {
    validateActorId(dto.actorId);
    validateRoleId(dto.roleId);

    const roles = await this.store.listAdminRoles();
    this.administrationPolicy.assertCanManagePlatform(dto.actorId, roles);

    const existing = await this.store.findAdminRoleById(dto.roleId);
    if (!existing) {
      throw new Error(`Admin role not found: ${dto.roleId}`);
    }

    if (dto.permissions) {
      this.administrationPolicy.assertValidRolePermissions(dto.permissions);
    }
    if (dto.name) {
      validateRoleName(dto.name);
      this.administrationPolicy.assertUniqueRoleName(dto.name, roles, dto.roleId);
    }

    const updated = withAdminRoleUpdate(existing, {
      name: dto.name,
      permissions: dto.permissions,
      description: dto.description,
      active: dto.active,
    });

    await this.store.saveAdminRole(updated);
    createAdminRoleUpdatedEvent(updated);
    return updated;
  }

  async getFeatureFlag(dto: GetFeatureFlagDto): Promise<FeatureFlag | null> {
    validateFeatureFlagKey(dto.key);
    return this.store.getFeatureFlag(dto.key);
  }

  async updateFeatureFlag(dto: UpdateFeatureFlagDto): Promise<FeatureFlag> {
    validateActorId(dto.actorId);
    validateFeatureFlagKey(dto.key);

    const roles = await this.store.listAdminRoles();
    this.administrationPolicy.assertCanManagePlatform(dto.actorId, roles);

    const maintenance = await this.requireMaintenanceMode();
    const existing =
      (await this.store.getFeatureFlag(dto.key)) ??
      createFeatureFlag({
        key: dto.key,
        enabled: false,
        updatedBy: dto.actorId,
      });

    this.featureFlagPolicy.assertCanUpdateFlag(existing, maintenance, dto.enabled);

    const updated = withFeatureFlagUpdate(existing, {
      enabled: dto.enabled,
      description: dto.description,
      updatedBy: dto.actorId,
    });

    await this.store.saveFeatureFlag(updated);
    createFeatureFlagUpdatedEvent(updated);
    return updated;
  }

  async setMaintenanceMode(dto: SetMaintenanceModeDto): Promise<MaintenanceMode> {
    validateActorId(dto.actorId);
    const roles = await this.store.listAdminRoles();
    this.administrationPolicy.assertCanManagePlatform(dto.actorId, roles);

    await Promise.all([
      this.analytics.getOrderMetrics(),
      this.analytics.getMarketplaceMetrics(),
      this.marketplace.isPublished("platform-health-check"),
      this.moderation.getStatus({
        target: ModerationTarget.Listing,
        targetId: "platform-health-check",
      }),
      this.support.getStatus({ ticketId: "platform-health-check" }),
      this.order.getOrder("platform-health-check"),
      this.payment.getPayment("platform-health-check"),
      this.customer.getCustomer("platform-health-check"),
      this.seller.isSellerApproved("platform-health-check"),
      this.inventory.getAvailableQuantity("platform-health-check"),
      this.pricing.getCurrentPrice("platform-health-check"),
    ]);

    const current = await this.requireMaintenanceMode();
    const updated = withMaintenanceModeUpdate(current, {
      enabled: dto.enabled,
      message: dto.message,
      updatedBy: dto.actorId,
    });

    await this.store.saveMaintenanceMode(updated);
    createMaintenanceModeChangedEvent(updated);
    return updated;
  }

  private async requireSystemSettings(): Promise<SystemSettings> {
    const existing = await this.store.getSystemSettings();
    if (existing) {
      return existing;
    }
    const defaults = createDefaultSystemSettings();
    await this.store.saveSystemSettings(defaults);
    return defaults;
  }

  private async requireMarketplaceConfiguration(): Promise<MarketplaceConfiguration> {
    const existing = await this.store.getMarketplaceConfiguration();
    if (existing) {
      return existing;
    }
    const defaults = createDefaultMarketplaceConfiguration();
    await this.store.saveMarketplaceConfiguration(defaults);
    return defaults;
  }

  private async requireMaintenanceMode(): Promise<MaintenanceMode> {
    const existing = await this.store.getMaintenanceMode();
    if (existing) {
      return existing;
    }
    const defaults = createDefaultMaintenanceMode();
    await this.store.saveMaintenanceMode(defaults);
    return defaults;
  }
}

function validateActorId(actorId: string): void {
  if (!actorId?.trim()) {
    throw new Error("actorId is required");
  }
}

function validateRoleName(name: string): void {
  if (!name?.trim()) {
    throw new Error("Role name is required");
  }
}

function validateRoleId(roleId: string): void {
  if (!roleId?.trim()) {
    throw new Error("roleId is required");
  }
}

function validateFeatureFlagKey(key: string): void {
  if (!key?.trim()) {
    throw new Error("Feature flag key is required");
  }
}
