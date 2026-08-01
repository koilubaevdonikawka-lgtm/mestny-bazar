import { describe, expect, it } from "vitest";
import { CourierAssignmentPolicyService } from "@server/domain/courier-assignment/courier-assignment.service";
import type {
  CourierAssignmentContext,
  CourierAssignmentResult,
} from "@server/ports/courier-assignment.port";
import type { CourierAssignmentRule } from "@server/domain/courier-assignment/courier-assignment.rule";
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
  };
}

function ctx(): CourierAssignmentContext {
  return { order: makeOrder(), candidates: [] };
}

function fakeRule(overrides: Partial<CourierAssignmentRule> = {}): CourierAssignmentRule {
  return {
    order: 10,
    applies: () => true,
    evaluate: (): CourierAssignmentResult => ({ courierId: null }),
    ...overrides,
  };
}

describe("CourierAssignmentPolicyService", () => {
  it("runs rules in ascending order", () => {
    const calls: string[] = [];
    const second = fakeRule({
      order: 20,
      evaluate: () => {
        calls.push("second");
        return { courierId: "c2" };
      },
    });
    const first = fakeRule({
      order: 10,
      evaluate: () => {
        calls.push("first");
        return { courierId: "c1" };
      },
    });
    const service = new CourierAssignmentPolicyService([second, first]);

    expect(service.selectCourier(ctx())).toEqual({ courierId: "c1" });
    expect(calls).toEqual(["first"]);
  });

  it("skips a rule whose applies() returns false", () => {
    const skipped = fakeRule({
      order: 10,
      applies: () => false,
      evaluate: () => ({ courierId: "wrong" }),
    });
    const matching = fakeRule({ order: 20, evaluate: () => ({ courierId: "right" }) });
    const service = new CourierAssignmentPolicyService([skipped, matching]);

    expect(service.selectCourier(ctx())).toEqual({ courierId: "right" });
  });

  it("continues to the next rule when a rule returns a null pick", () => {
    const first = fakeRule({ order: 10, evaluate: () => ({ courierId: null }) });
    const second = fakeRule({ order: 20, evaluate: () => ({ courierId: "c2" }) });
    const service = new CourierAssignmentPolicyService([first, second]);

    expect(service.selectCourier(ctx())).toEqual({ courierId: "c2" });
  });

  it("returns a null pick when no rule matches or every rule picks null", () => {
    const service = new CourierAssignmentPolicyService([fakeRule({ applies: () => false })]);
    expect(service.selectCourier(ctx())).toEqual({ courierId: null });
  });
});
