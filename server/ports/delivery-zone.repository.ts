import type { DeliveryFeeQuote, DeliveryZoneDTO } from "@shared/contracts/delivery";

export interface IDeliveryZoneRepository {
  listActive(): Promise<DeliveryZoneDTO[]>;
  getById(id: string): Promise<DeliveryZoneDTO | null>;
  calculateFee(zoneId: string, subtotal: number): Promise<DeliveryFeeQuote>;
}
