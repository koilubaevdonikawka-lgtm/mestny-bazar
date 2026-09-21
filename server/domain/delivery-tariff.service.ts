import type { PublicDeliveryTariffDTO } from "@shared/contracts/delivery";
import type { IDeliveryTariffRepository } from "@server/ports/delivery-tariff.repository";
import type { IDeliveryZoneRepository } from "@server/ports/delivery-zone.repository";
import { DEFAULT_PRICE_PER_EXTRA_KG } from "@server/domain/delivery-calculator";

/**
 * Buyer-facing (Задача №214, «Информация» screen) — mirrors DeliveryZoneService's
 * shape (thin read wrapper over ports). Distinct from DeliveryTariffAdminService,
 * which is admin-only and returns every admin field for every tariff.
 */
export class DeliveryTariffService {
  constructor(
    private readonly tariffs: IDeliveryTariffRepository,
    private readonly zones: IDeliveryZoneRepository,
  ) {}

  /**
   * One row per zone — the zone's active STANDARD tariff (the Rule Engine's
   * own fallback, delivery-tariff-policy.service.ts's StandardTariffFallbackRule,
   * for a customer with no corporate/holiday/promotional segment on an
   * ordinary date), since that's what an actual customer is charged on an
   * ordinary order. Corporate/holiday/promotional tariffs are date/segment
   * gated and not meaningful as a static price list. Tariffs with no zoneId
   * (platform-wide default) have no zone name to show and are skipped, as
   * are tariffs whose zone is itself inactive (excluded via zones.listActive()).
   */
  async listActiveForStorefront(): Promise<PublicDeliveryTariffDTO[]> {
    const [tariffs, zones] = await Promise.all([
      this.tariffs.listActive(),
      this.zones.listActive(),
    ]);
    const zoneNameById = new Map(zones.map((zone) => [zone.id, zone.name]));

    const result: PublicDeliveryTariffDTO[] = [];
    for (const tariff of tariffs) {
      if (tariff.tariffType !== "STANDARD" || tariff.zoneId === null) continue;
      const zoneName = zoneNameById.get(tariff.zoneId);
      if (!zoneName) continue;
      result.push({
        zoneId: tariff.zoneId,
        zoneName,
        basePrice: tariff.basePrice,
        weightIncludedKg: tariff.weightIncludedKg,
        pricePerExtraKg: tariff.weightExtraFeePerKg ?? DEFAULT_PRICE_PER_EXTRA_KG,
      });
    }
    return result;
  }
}
