import type { DeliveryZoneDTO } from "@shared/contracts/delivery";

/** Buyer-facing — active zones only. Admin CRUD is IAdminDeliveryZoneRepository. */
export interface IDeliveryZoneRepository {
  listActive(): Promise<DeliveryZoneDTO[]>;
  getById(id: string): Promise<DeliveryZoneDTO | null>;
}
