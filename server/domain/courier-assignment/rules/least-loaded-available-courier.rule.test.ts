import { describe, expect, it } from "vitest";
import { LeastLoadedAvailableCourierRule } from "@server/domain/courier-assignment/rules/least-loaded-available-courier.rule";
import type { CourierAssignmentContext } from "@server/ports/courier-assignment.port";
import type { OrderDTO } from "@shared/contracts/order";

function makeOrder(): OrderDTO {
  return {
    id: "order-1",
    orderNumber: 1,
    status: "CONFIRMED",
    paymentStatus: "paid",
    paymentMethod: "CASH",
    subtotal: 100,
    deliveryFee: 0,
    discountAmount: 0,
    couponCode: null,
    total: 100,
    currency: "KGS",
    customerName: "Buyer",
    customerPhone: "996700000000",
    addressSnapshot: "addr",
    notes: null,
    paymentUrl: null,
    items: [],
    createdAt: new Date().toISOString(),
    paidAt: null,
    assignedCourierId: null,
    zoneId: null,
    deliveryTariffId: null,
    deliveryEtaMinMinutes: null,
    deliveryEtaMaxMinutes: null,
  };
}

function ctx(candidates: CourierAssignmentContext["candidates"]): CourierAssignmentContext {
  return { order: makeOrder(), candidates };
}

describe("LeastLoadedAvailableCourierRule", () => {
  const rule = new LeastLoadedAvailableCourierRule();

  it("applies to every context", () => {
    expect(rule.applies(ctx([]))).toBe(true);
  });

  it("returns null when there are no candidates", () => {
    expect(rule.evaluate(ctx([]))).toEqual({ courierId: null });
  });

  it("picks the single candidate when only one is available", () => {
    expect(rule.evaluate(ctx([{ courierId: "c1", activeDeliveries: 3 }]))).toEqual({
      courierId: "c1",
    });
  });

  it("picks the candidate with the fewest active deliveries", () => {
    const result = rule.evaluate(
      ctx([
        { courierId: "c1", activeDeliveries: 2 },
        { courierId: "c2", activeDeliveries: 0 },
        { courierId: "c3", activeDeliveries: 5 },
      ]),
    );
    expect(result).toEqual({ courierId: "c2" });
  });

  it("tie-breaks by courierId for determinism", () => {
    const result = rule.evaluate(
      ctx([
        { courierId: "courier-b", activeDeliveries: 1 },
        { courierId: "courier-a", activeDeliveries: 1 },
      ]),
    );
    expect(result).toEqual({ courierId: "courier-a" });
  });
});
