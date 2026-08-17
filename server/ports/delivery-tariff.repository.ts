import type {
  CreateDeliveryTariffRequest,
  DeliveryTariffDTO,
  UpdateDeliveryTariffRequest,
} from "@shared/contracts/delivery";

export interface IDeliveryTariffRepository {
  /** Admin-facing full list, active and inactive. */
  listAll(): Promise<DeliveryTariffDTO[]>;
  /**
   * Active tariffs applicable to a zone right now — the zone's own tariffs
   * plus platform-wide default tariffs (zoneId null). Consumed by
   * DeliveryTariffPolicyService (delivery-rule-engine.md), never filtered
   * further in the domain layer — that is the Rule Engine's job.
   */
  listActiveForZone(zoneId: string): Promise<DeliveryTariffDTO[]>;
  getById(id: string): Promise<DeliveryTariffDTO | null>;
  create(data: CreateDeliveryTariffRequest): Promise<DeliveryTariffDTO>;
  update(data: UpdateDeliveryTariffRequest): Promise<DeliveryTariffDTO>;
}
