import type {
  CreateDeliveryZoneRequest,
  DeliveryZoneDTO,
  UpdateDeliveryZoneRequest,
} from "@shared/contracts/delivery";
import type { IAdminDeliveryZoneRepository } from "@server/ports/delivery-zone-admin.repository";
import type { IMarketplaceEventBus } from "@server/ports/marketplace-events.port";
import { DeliveryValidationError, DeliveryZoneNotFoundError } from "@server/domain/delivery.errors";

/** Zone CRUD — docs/delivery/delivery-api.md, mirrors CategoryAdminService's shape. */
export class DeliveryZoneAdminService {
  constructor(
    private readonly zones: IAdminDeliveryZoneRepository,
    private readonly events: IMarketplaceEventBus,
  ) {}

  async listZones(): Promise<DeliveryZoneDTO[]> {
    return this.zones.listAll();
  }

  async createZone(data: CreateDeliveryZoneRequest): Promise<DeliveryZoneDTO> {
    this.validateName(data.name);
    const zone = await this.zones.create(data);
    await this.events.publish({ type: "delivery.zone.created", zone });
    return zone;
  }

  async updateZone(data: UpdateDeliveryZoneRequest): Promise<DeliveryZoneDTO> {
    const existing = await this.zones.getById(data.id);
    if (!existing) throw new DeliveryZoneNotFoundError(data.id);
    if (data.name !== undefined) this.validateName(data.name);

    const zone = await this.zones.update(data);
    await this.events.publish({ type: "delivery.zone.updated", zone });
    return zone;
  }

  /** "Удаление" (delivery-api.md) — soft delete, a zone may be referenced by existing orders/tariffs. */
  async deactivateZone(id: string): Promise<DeliveryZoneDTO> {
    const existing = await this.zones.getById(id);
    if (!existing) throw new DeliveryZoneNotFoundError(id);

    const zone = await this.zones.deactivate(id);
    await this.events.publish({ type: "delivery.zone.deactivated", zoneId: zone.id });
    return zone;
  }

  private validateName(name: string): void {
    if (!name?.trim() || name.trim().length < 2) {
      throw new DeliveryValidationError("Name must be at least 2 characters", "name");
    }
  }
}
