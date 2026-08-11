import type { CreateStoreRequest, StoreDTO, UpdateStoreRequest } from "@shared/contracts/delivery";
import type { IStoreRepository } from "@server/ports/store.repository";
import type { IMarketplaceEventBus } from "@server/ports/marketplace-events.port";
import { DeliveryValidationError, StoreNotFoundError } from "@server/domain/delivery.errors";

/**
 * Store CRUD — Подэтап 0 (delivery-future-roadmap.md): closes the missing
 * origin-point blocker for BY_DISTANCE. Mirrors DeliveryZoneAdminService's
 * shape exactly. Not wired into DeliveryPricingEngine/geocoding — that is a
 * separate, later sub-stage, explicitly out of scope here.
 */
export class StoreService {
  constructor(
    private readonly stores: IStoreRepository,
    private readonly events: IMarketplaceEventBus,
  ) {}

  async listStores(): Promise<StoreDTO[]> {
    return this.stores.listAll();
  }

  async createStore(data: CreateStoreRequest): Promise<StoreDTO> {
    this.validateName(data.name);
    this.validateAddress(data.address);

    const store = await this.stores.create(data);
    await this.events.publish({ type: "delivery.store.created", store });
    return store;
  }

  async updateStore(data: UpdateStoreRequest): Promise<StoreDTO> {
    const existing = await this.stores.getById(data.id);
    if (!existing) throw new StoreNotFoundError(data.id);

    if (data.name !== undefined) this.validateName(data.name);
    if (data.address !== undefined) this.validateAddress(data.address);

    const store = await this.stores.update(data);
    await this.events.publish({ type: "delivery.store.updated", store });
    return store;
  }

  private validateName(name: string): void {
    if (!name?.trim() || name.trim().length < 2) {
      throw new DeliveryValidationError("Name must be at least 2 characters", "name");
    }
  }

  private validateAddress(address: string): void {
    if (!address?.trim()) {
      throw new DeliveryValidationError("Address is required", "address");
    }
  }
}
