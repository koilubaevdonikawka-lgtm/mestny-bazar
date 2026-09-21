import { describe, expect, it } from "vitest";
import type { DeliveryTariffDTO, DeliveryZoneDTO } from "@shared/contracts/delivery";
import type { IDeliveryTariffRepository } from "@server/ports/delivery-tariff.repository";
import type { IDeliveryZoneRepository } from "@server/ports/delivery-zone.repository";
import { DeliveryTariffService } from "@server/domain/delivery-tariff.service";

function tariff(overrides: Partial<DeliveryTariffDTO> = {}): DeliveryTariffDTO {
  return {
    id: "t1",
    zoneId: "z1",
    name: "Стандартный",
    tariffType: "STANDARD",
    pricingModel: "FIXED",
    basePrice: 100,
    pricePerKm: null,
    minOrderForFreeDelivery: null,
    minOrderAmount: null,
    weightExtraFeePerKg: 3,
    weightIncludedKg: 40,
    etaMinMinutes: null,
    etaMaxMinutes: null,
    validFrom: null,
    validTo: null,
    priority: 90,
    isActive: true,
    ...overrides,
  };
}

function service(tariffs: DeliveryTariffDTO[], zones: Array<Pick<DeliveryZoneDTO, "id" | "name">>) {
  return new DeliveryTariffService(
    { listActive: async () => tariffs } as unknown as IDeliveryTariffRepository,
    { listActive: async () => zones } as unknown as IDeliveryZoneRepository,
  );
}

describe("DeliveryTariffService.listActiveForStorefront", () => {
  it("exposes the active tariff's own base price, weight threshold and per-kg rate", async () => {
    const rows = await service([tariff()], [{ id: "z1", name: "Кант" }]).listActiveForStorefront();
    expect(rows).toEqual([
      { zoneId: "z1", zoneName: "Кант", basePrice: 100, weightIncludedKg: 40, pricePerExtraKg: 3 },
    ]);
  });

  it("keeps null for an unset threshold and resolves an unset per-kg rate to the calculator default", async () => {
    const rows = await service(
      [tariff({ weightIncludedKg: null, weightExtraFeePerKg: null })],
      [{ id: "z1", name: "Кант" }],
    ).listActiveForStorefront();
    expect(rows[0]).toMatchObject({ weightIncludedKg: null, pricePerExtraKg: 1 });
  });

  it("returns nothing when there is no active STANDARD tariff for an active zone", async () => {
    expect(await service([], [{ id: "z1", name: "Кант" }]).listActiveForStorefront()).toEqual([]);
    expect(
      await service(
        [tariff({ tariffType: "HOLIDAY" })],
        [{ id: "z1", name: "Кант" }],
      ).listActiveForStorefront(),
    ).toEqual([]);
    expect(await service([tariff()], []).listActiveForStorefront()).toEqual([]);
  });
});
