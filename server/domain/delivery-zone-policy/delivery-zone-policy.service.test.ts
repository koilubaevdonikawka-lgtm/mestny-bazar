import { describe, expect, it } from "vitest";
import { DeliveryZonePolicyService } from "@server/domain/delivery-zone-policy/delivery-zone-policy.service";
import { ZoneActiveRule } from "@server/domain/delivery-zone-policy/rules/zone-active.rule";
import { MinOrderAmountRule } from "@server/domain/delivery-zone-policy/rules/min-order-amount.rule";
import { AllowRule } from "@server/domain/delivery-zone-policy/rules/allow.rule";
import { DeliveryNotAllowedError } from "@server/domain/delivery.errors";
import type { DeliveryZonePolicyContext } from "@server/ports/delivery-zone-policy.port";

function buildEngine(): DeliveryZonePolicyService {
  return new DeliveryZonePolicyService([
    new ZoneActiveRule(),
    new MinOrderAmountRule(),
    new AllowRule(),
  ]);
}

function makeContext(
  overrides: Partial<DeliveryZonePolicyContext> = {},
): DeliveryZonePolicyContext {
  return {
    zoneId: "zone-1",
    subtotal: 500,
    minOrderAmount: null,
    isZoneActive: true,
    ...overrides,
  };
}

describe("DeliveryZonePolicyService", () => {
  it("allows by default when the zone is active and no minimum order applies", () => {
    expect(buildEngine().can(makeContext())).toEqual({ allowed: true });
  });

  it("denies with ZONE_INACTIVE when the zone is inactive", () => {
    const result = buildEngine().can(makeContext({ isZoneActive: false }));
    expect(result.allowed).toBe(false);
    expect(result.denialCode).toBe("ZONE_INACTIVE");
  });

  it("denies with MIN_ORDER_AMOUNT_NOT_MET when subtotal is below the tariff's minimum", () => {
    const result = buildEngine().can(makeContext({ subtotal: 100, minOrderAmount: 300 }));
    expect(result.allowed).toBe(false);
    expect(result.denialCode).toBe("MIN_ORDER_AMOUNT_NOT_MET");
  });

  it("allows when subtotal meets the minimum exactly", () => {
    const result = buildEngine().can(makeContext({ subtotal: 300, minOrderAmount: 300 }));
    expect(result.allowed).toBe(true);
  });

  it("checks zone-active before min-order — an inactive zone denies even with subtotal high enough", () => {
    const result = buildEngine().can(
      makeContext({ isZoneActive: false, subtotal: 10_000, minOrderAmount: 300 }),
    );
    expect(result.denialCode).toBe("ZONE_INACTIVE");
  });

  it("assert() throws DeliveryNotAllowedError when denied", () => {
    expect(() => buildEngine().assert(makeContext({ isZoneActive: false }))).toThrow(
      DeliveryNotAllowedError,
    );
  });

  it("assert() does not throw when allowed", () => {
    expect(() => buildEngine().assert(makeContext())).not.toThrow();
  });
});
