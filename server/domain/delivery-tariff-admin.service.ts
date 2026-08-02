import type {
  CreateDeliveryTariffRequest,
  DeliveryTariffDTO,
  UpdateDeliveryTariffRequest,
} from "@shared/contracts/delivery";
import type { IDeliveryTariffRepository } from "@server/ports/delivery-tariff.repository";
import type { IMarketplaceEventBus } from "@server/ports/marketplace-events.port";
import {
  DeliveryTariffNotFoundError,
  DeliveryValidationError,
} from "@server/domain/delivery.errors";

/** Tariff CRUD — docs/delivery/delivery-api.md. Several tariffs may target the same zone (multiple tariff grids). */
export class DeliveryTariffAdminService {
  constructor(
    private readonly tariffs: IDeliveryTariffRepository,
    private readonly events: IMarketplaceEventBus,
  ) {}

  async listTariffs(): Promise<DeliveryTariffDTO[]> {
    return this.tariffs.listAll();
  }

  async createTariff(data: CreateDeliveryTariffRequest): Promise<DeliveryTariffDTO> {
    this.validate(data);
    const tariff = await this.tariffs.create(data);
    await this.events.publish({ type: "delivery.tariff.created", tariff });
    return tariff;
  }

  async updateTariff(data: UpdateDeliveryTariffRequest): Promise<DeliveryTariffDTO> {
    const existing = await this.tariffs.getById(data.id);
    if (!existing) throw new DeliveryTariffNotFoundError(data.id);
    this.validate(data);

    const tariff = await this.tariffs.update(data);
    await this.events.publish({ type: "delivery.tariff.updated", tariff });
    return tariff;
  }

  private validate(data: Partial<CreateDeliveryTariffRequest>): void {
    if (data.name !== undefined && (!data.name.trim() || data.name.trim().length < 2)) {
      throw new DeliveryValidationError("Name must be at least 2 characters", "name");
    }
    if (data.basePrice !== undefined && data.basePrice < 0) {
      throw new DeliveryValidationError("Base price must not be negative", "basePrice");
    }
  }
}
