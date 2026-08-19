import { describe, expect, it } from "vitest";
import { DeliveryTariffPolicyService } from "@server/domain/delivery-tariff-policy/delivery-tariff-policy.service";
import { CorporateTariffRule } from "@server/domain/delivery-tariff-policy/rules/corporate-tariff.rule";
import { HolidayTariffRule } from "@server/domain/delivery-tariff-policy/rules/holiday-tariff.rule";
import { PromotionalTariffRule } from "@server/domain/delivery-tariff-policy/rules/promotional-tariff.rule";
import { StandardTariffFallbackRule } from "@server/domain/delivery-tariff-policy/rules/standard-tariff-fallback.rule";
import type { DeliveryTariffDTO } from "@shared/contracts/delivery";

function makeTariff(overrides: Partial<DeliveryTariffDTO> = {}): DeliveryTariffDTO {
  return {
    id: "tariff-1",
    zoneId: "zone-1",
    name: "Standard",
    tariffType: "STANDARD",
    pricingModel: "FIXED",
    basePrice: 100,
    pricePerKm: null,
    minOrderForFreeDelivery: null,
    minOrderAmount: null,
    weightExtraFeePerKg: null,
    etaMinMinutes: 30,
    etaMaxMinutes: 60,
    validFrom: null,
    validTo: null,
    priority: 90,
    isActive: true,
    ...overrides,
  };
}

function buildEngine(): DeliveryTariffPolicyService {
  return new DeliveryTariffPolicyService([
    new CorporateTariffRule(),
    new HolidayTariffRule(),
    new PromotionalTariffRule(),
    new StandardTariffFallbackRule(),
  ]);
}

describe("DeliveryTariffPolicyService", () => {
  it("falls back to the zone's own STANDARD tariff when nothing more specific applies", () => {
    const standard = makeTariff();
    const result = buildEngine().evaluate({
      zoneId: "zone-1",
      candidates: [standard],
      orderDate: "2026-06-01T00:00:00.000Z",
    });
    expect(result).toEqual({ allowed: true, tariff: standard });
  });

  it("falls back to a platform-wide default STANDARD tariff (zoneId null) when the zone has none of its own", () => {
    const platformDefault = makeTariff({ id: "tariff-default", zoneId: null });
    const result = buildEngine().evaluate({
      zoneId: "zone-1",
      candidates: [platformDefault],
      orderDate: "2026-06-01T00:00:00.000Z",
    });
    expect(result.tariff?.id).toBe("tariff-default");
  });

  it("denies with NO_STANDARD_TARIFF when there is no STANDARD tariff at all", () => {
    const result = buildEngine().evaluate({
      zoneId: "zone-1",
      candidates: [],
      orderDate: "2026-06-01T00:00:00.000Z",
    });
    expect(result).toEqual({ allowed: false, denialCode: "NO_STANDARD_TARIFF" });
  });

  it("prefers CORPORATE over STANDARD for a corporate customer segment", () => {
    const standard = makeTariff();
    const corporate = makeTariff({ id: "tariff-corp", tariffType: "CORPORATE", basePrice: 50 });
    const result = buildEngine().evaluate({
      zoneId: "zone-1",
      candidates: [standard, corporate],
      orderDate: "2026-06-01T00:00:00.000Z",
      customerSegment: "CORPORATE",
    });
    expect(result.tariff?.id).toBe("tariff-corp");
  });

  it("does not select CORPORATE for a retail (non-corporate) customer even if a CORPORATE tariff exists", () => {
    const standard = makeTariff();
    const corporate = makeTariff({ id: "tariff-corp", tariffType: "CORPORATE" });
    const result = buildEngine().evaluate({
      zoneId: "zone-1",
      candidates: [standard, corporate],
      orderDate: "2026-06-01T00:00:00.000Z",
      customerSegment: "RETAIL",
    });
    expect(result.tariff?.id).toBe("tariff-1");
  });

  it("prefers HOLIDAY over STANDARD when the order date falls inside the holiday window", () => {
    const standard = makeTariff();
    const holiday = makeTariff({
      id: "tariff-holiday",
      tariffType: "HOLIDAY",
      validFrom: "2026-12-30T00:00:00.000Z",
      validTo: "2027-01-02T00:00:00.000Z",
    });
    const result = buildEngine().evaluate({
      zoneId: "zone-1",
      candidates: [standard, holiday],
      orderDate: "2026-12-31T12:00:00.000Z",
    });
    expect(result.tariff?.id).toBe("tariff-holiday");
  });

  it("ignores a HOLIDAY tariff outside its validity window", () => {
    const standard = makeTariff();
    const holiday = makeTariff({
      id: "tariff-holiday",
      tariffType: "HOLIDAY",
      validFrom: "2026-12-30T00:00:00.000Z",
      validTo: "2027-01-02T00:00:00.000Z",
    });
    const result = buildEngine().evaluate({
      zoneId: "zone-1",
      candidates: [standard, holiday],
      orderDate: "2026-06-01T00:00:00.000Z",
    });
    expect(result.tariff?.id).toBe("tariff-1");
  });

  it("prefers PROMOTIONAL over STANDARD but CORPORATE and HOLIDAY still outrank it", () => {
    const standard = makeTariff();
    const promo = makeTariff({ id: "tariff-promo", tariffType: "PROMOTIONAL" });
    const holiday = makeTariff({
      id: "tariff-holiday",
      tariffType: "HOLIDAY",
      validFrom: "2026-01-01T00:00:00.000Z",
      validTo: "2026-12-31T00:00:00.000Z",
    });

    expect(
      buildEngine().evaluate({
        zoneId: "zone-1",
        candidates: [standard, promo],
        orderDate: "2026-06-01T00:00:00.000Z",
      }).tariff?.id,
    ).toBe("tariff-promo");

    expect(
      buildEngine().evaluate({
        zoneId: "zone-1",
        candidates: [standard, promo, holiday],
        orderDate: "2026-06-01T00:00:00.000Z",
      }).tariff?.id,
    ).toBe("tariff-holiday");
  });
});
