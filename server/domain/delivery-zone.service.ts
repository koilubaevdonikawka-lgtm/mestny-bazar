import type { DeliveryZoneDTO } from "@shared/contracts/delivery";
import type { IDeliveryZoneRepository } from "@server/ports/delivery-zone.repository";

/** Buyer-facing — mirrors CatalogService's shape (thin read wrapper over a port). */
export class DeliveryZoneService {
  constructor(private readonly zones: IDeliveryZoneRepository) {}

  async listActive(): Promise<DeliveryZoneDTO[]> {
    return this.zones.listActive();
  }
}
