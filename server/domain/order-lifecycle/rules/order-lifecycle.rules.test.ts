import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { OrderLifecycleContext } from "@server/ports/order-lifecycle.port";
import { OrderStatus } from "@shared/contracts/order";

import { TerminalStateGuardRule } from "@server/domain/order-lifecycle/rules/terminal-state-guard.rule";
import { BootstrapCreatedRule } from "@server/domain/order-lifecycle/rules/bootstrap-created.rule";
import { AdminConfirmOrderRule } from "@server/domain/order-lifecycle/rules/admin-confirm-order.rule";
import { AdminCancelOrderRule } from "@server/domain/order-lifecycle/rules/admin-cancel-order.rule";
import { CustomerCancelOrderRule } from "@server/domain/order-lifecycle/rules/customer-cancel-order.rule";
import { WarehouseStartAssemblyRule } from "@server/domain/order-lifecycle/rules/warehouse-start-assembly.rule";
import { WarehouseCompleteAssemblyRule } from "@server/domain/order-lifecycle/rules/warehouse-complete-assembly.rule";
import { CourierAcceptOrderRule } from "@server/domain/order-lifecycle/rules/courier-accept-order.rule";
import { CourierStartDeliveryRule } from "@server/domain/order-lifecycle/rules/courier-start-delivery.rule";
import { CourierArriveRule } from "@server/domain/order-lifecycle/rules/courier-arrive.rule";
import { CourierCompleteDeliveryRule } from "@server/domain/order-lifecycle/rules/courier-complete-delivery.rule";

function ctx(overrides: Partial<OrderLifecycleContext>): OrderLifecycleContext {
  return {
    orderId: "order-1",
    currentStatus: OrderStatus.CREATED,
    targetStatus: OrderStatus.CREATED,
    actor: { id: "actor-1" },
    ...overrides,
  };
}

describe("TerminalStateGuardRule", () => {
  const rule = new TerminalStateGuardRule();

  it("does not apply to checkout_create", () => {
    expect(rule.applies(ctx({ reason: "checkout_create" }))).toBe(false);
  });

  it("applies to every other reason and denies from CANCELLED/DELIVERED", () => {
    expect(rule.applies(ctx({ reason: "admin_cancel" }))).toBe(true);
    expect(rule.evaluate(ctx({ currentStatus: OrderStatus.CANCELLED })).allowed).toBe(false);
    expect(rule.evaluate(ctx({ currentStatus: OrderStatus.DELIVERED })).allowed).toBe(false);
    expect(rule.evaluate(ctx({ currentStatus: OrderStatus.CREATED })).allowed).toBe(true);
  });

  it("is a non-terminal guard", () => {
    expect(rule.terminal).toBe(false);
  });
});

describe("BootstrapCreatedRule", () => {
  const rule = new BootstrapCreatedRule();

  it("applies only to checkout_create -> CREATED", () => {
    expect(
      rule.applies(ctx({ reason: "checkout_create", targetStatus: OrderStatus.CREATED })),
    ).toBe(true);
    expect(rule.applies(ctx({ reason: "admin_confirm" }))).toBe(false);
  });

  it("always allows", () => {
    expect(rule.evaluate(ctx({})).allowed).toBe(true);
  });
});

describe("AdminConfirmOrderRule", () => {
  const rule = new AdminConfirmOrderRule();
  const applyCtx = ctx({ reason: "admin_confirm", targetStatus: OrderStatus.CONFIRMED });

  it("applies only to admin_confirm -> CONFIRMED", () => {
    expect(rule.applies(applyCtx)).toBe(true);
    expect(rule.applies(ctx({ reason: "admin_cancel", targetStatus: OrderStatus.CONFIRMED }))).toBe(
      false,
    );
    expect(
      rule.applies(ctx({ reason: "admin_confirm", targetStatus: OrderStatus.CANCELLED })),
    ).toBe(false);
  });

  it("requires admin role", () => {
    const result = rule.evaluate({ ...applyCtx, actor: { id: "u1" } });
    expect(result).toMatchObject({ allowed: false, denialCode: "ADMIN_ROLE_REQUIRED" });
  });

  it("allows from CREATED or PAID for an admin", () => {
    const admin = { id: "a1", roles: ["admin" as const] };
    expect(
      rule.evaluate({ ...applyCtx, actor: admin, currentStatus: OrderStatus.CREATED }).allowed,
    ).toBe(true);
    expect(
      rule.evaluate({ ...applyCtx, actor: admin, currentStatus: OrderStatus.PAID }).allowed,
    ).toBe(true);
  });

  it("denies from any other status even for an admin", () => {
    const admin = { id: "a1", roles: ["admin" as const] };
    const result = rule.evaluate({
      ...applyCtx,
      actor: admin,
      currentStatus: OrderStatus.ASSEMBLING,
    });
    expect(result).toMatchObject({ allowed: false, denialCode: "INVALID_CONFIRM_TRANSITION" });
  });
});

describe("AdminCancelOrderRule", () => {
  const rule = new AdminCancelOrderRule();
  const admin = { id: "a1", roles: ["admin" as const] };

  it("applies only to admin_cancel -> CANCELLED", () => {
    expect(rule.applies(ctx({ reason: "admin_cancel", targetStatus: OrderStatus.CANCELLED }))).toBe(
      true,
    );
    expect(
      rule.applies(ctx({ reason: "customer_cancel", targetStatus: OrderStatus.CANCELLED })),
    ).toBe(false);
    expect(rule.applies(ctx({ reason: "admin_cancel", targetStatus: OrderStatus.CONFIRMED }))).toBe(
      false,
    );
  });

  it("requires admin role", () => {
    const result = rule.evaluate(
      ctx({ reason: "admin_cancel", targetStatus: OrderStatus.CANCELLED, actor: { id: "u1" } }),
    );
    expect(result).toMatchObject({ allowed: false, denialCode: "ADMIN_ROLE_REQUIRED" });
  });

  it("allows cancelling from any active status", () => {
    for (const status of [
      OrderStatus.CREATED,
      OrderStatus.PAID,
      OrderStatus.CONFIRMED,
      OrderStatus.ASSEMBLING,
      OrderStatus.OUT_FOR_DELIVERY,
    ]) {
      const result = rule.evaluate(
        ctx({
          reason: "admin_cancel",
          targetStatus: OrderStatus.CANCELLED,
          actor: admin,
          currentStatus: status,
        }),
      );
      expect(result.allowed).toBe(true);
    }
  });

  it("denies cancelling an already terminal order", () => {
    const result = rule.evaluate(
      ctx({
        reason: "admin_cancel",
        targetStatus: OrderStatus.CANCELLED,
        actor: admin,
        currentStatus: OrderStatus.DELIVERED,
      }),
    );
    expect(result).toMatchObject({ allowed: false, denialCode: "INVALID_CANCEL_TRANSITION" });
  });
});

describe("CustomerCancelOrderRule", () => {
  const rule = new CustomerCancelOrderRule();
  const FROZEN_NOW = Date.parse("2026-01-01T00:02:00.000Z");

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FROZEN_NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // Order created 1 minute before the frozen "now" — well within the 2-minute window.
  const applyCtx = {
    reason: "customer_cancel",
    targetStatus: OrderStatus.CANCELLED,
    orderCreatedAt: new Date(FROZEN_NOW - 60_000).toISOString(),
  };

  it("applies only to customer_cancel -> CANCELLED", () => {
    expect(rule.applies(ctx(applyCtx))).toBe(true);
    expect(rule.applies(ctx({ reason: "admin_cancel", targetStatus: OrderStatus.CANCELLED }))).toBe(
      false,
    );
  });

  it("requires an authenticated actor", () => {
    const result = rule.evaluate(ctx({ ...applyCtx, actor: { id: null } }));
    expect(result).toMatchObject({ allowed: false, denialCode: "AUTHENTICATION_REQUIRED" });
  });

  it("allows cancelling from CREATED or PAID, within the window", () => {
    for (const status of [OrderStatus.CREATED, OrderStatus.PAID]) {
      const result = rule.evaluate(
        ctx({ ...applyCtx, actor: { id: "u1" }, currentStatus: status }),
      );
      expect(result.allowed).toBe(true);
    }
  });

  it("denies once the order has been accepted (CONFIRMED) or gone further", () => {
    for (const status of [
      OrderStatus.CONFIRMED,
      OrderStatus.ASSEMBLING,
      OrderStatus.READY_FOR_DELIVERY,
      OrderStatus.OUT_FOR_DELIVERY,
      OrderStatus.ARRIVED,
    ]) {
      const result = rule.evaluate(
        ctx({ ...applyCtx, actor: { id: "u1" }, currentStatus: status }),
      );
      expect(result).toMatchObject({ allowed: false, denialCode: "ORDER_ALREADY_IN_PROGRESS" });
    }
  });

  describe("the 2-minute cancellation window", () => {
    it("allows right at creation (0 elapsed)", () => {
      const result = rule.evaluate(
        ctx({
          ...applyCtx,
          actor: { id: "u1" },
          orderCreatedAt: new Date(FROZEN_NOW).toISOString(),
        }),
      );
      expect(result.allowed).toBe(true);
    });

    it("allows at just under 2 minutes elapsed", () => {
      const result = rule.evaluate(
        ctx({
          ...applyCtx,
          actor: { id: "u1" },
          orderCreatedAt: new Date(FROZEN_NOW - (2 * 60 * 1000 - 1)).toISOString(),
        }),
      );
      expect(result.allowed).toBe(true);
    });

    it("denies exactly at the 2-minute boundary", () => {
      const result = rule.evaluate(
        ctx({
          ...applyCtx,
          actor: { id: "u1" },
          orderCreatedAt: new Date(FROZEN_NOW - 2 * 60 * 1000).toISOString(),
        }),
      );
      expect(result).toMatchObject({ allowed: false, denialCode: "CANCELLATION_WINDOW_EXPIRED" });
    });

    it("denies once more than 2 minutes have elapsed since order.createdAt", () => {
      const result = rule.evaluate(
        ctx({
          ...applyCtx,
          actor: { id: "u1" },
          orderCreatedAt: new Date(FROZEN_NOW - 3 * 60 * 1000).toISOString(),
        }),
      );
      expect(result).toMatchObject({ allowed: false, denialCode: "CANCELLATION_WINDOW_EXPIRED" });
    });

    it("denies when orderCreatedAt is missing entirely (never trust an absent server timestamp)", () => {
      const result = rule.evaluate(
        ctx({
          reason: "customer_cancel",
          targetStatus: OrderStatus.CANCELLED,
          actor: { id: "u1" },
          orderCreatedAt: undefined,
        }),
      );
      expect(result).toMatchObject({ allowed: false, denialCode: "CANCELLATION_WINDOW_UNKNOWN" });
    });
  });
});

describe("WarehouseStartAssemblyRule", () => {
  const rule = new WarehouseStartAssemblyRule();
  const warehouse = { id: "w1", roles: ["warehouse" as const] };
  const applyCtx = { reason: "warehouse_start_assembly", targetStatus: OrderStatus.ASSEMBLING };

  it("applies only to warehouse_start_assembly -> ASSEMBLING", () => {
    expect(rule.applies(ctx(applyCtx))).toBe(true);
    expect(
      rule.applies(
        ctx({ reason: "warehouse_complete_assembly", targetStatus: OrderStatus.ASSEMBLING }),
      ),
    ).toBe(false);
  });

  it("requires warehouse role", () => {
    const result = rule.evaluate(ctx({ ...applyCtx, actor: { id: "u1" } }));
    expect(result).toMatchObject({ allowed: false, denialCode: "WAREHOUSE_ROLE_REQUIRED" });
  });

  it("allows from CONFIRMED", () => {
    expect(
      rule.evaluate(ctx({ ...applyCtx, actor: warehouse, currentStatus: OrderStatus.CONFIRMED }))
        .allowed,
    ).toBe(true);
  });

  it("denies from CREATED or PAID (must be admin-confirmed first)", () => {
    for (const status of [OrderStatus.CREATED, OrderStatus.PAID]) {
      const result = rule.evaluate(ctx({ ...applyCtx, actor: warehouse, currentStatus: status }));
      expect(result).toMatchObject({
        allowed: false,
        denialCode: "INVALID_START_ASSEMBLY_TRANSITION",
      });
    }
  });
});

describe("WarehouseCompleteAssemblyRule", () => {
  const rule = new WarehouseCompleteAssemblyRule();
  const warehouse = { id: "w1", roles: ["warehouse" as const] };
  const applyCtx = {
    reason: "warehouse_complete_assembly",
    targetStatus: OrderStatus.READY_FOR_DELIVERY,
  };

  it("applies only to warehouse_complete_assembly -> READY_FOR_DELIVERY", () => {
    expect(rule.applies(ctx(applyCtx))).toBe(true);
    expect(
      rule.applies(
        ctx({ reason: "warehouse_start_assembly", targetStatus: OrderStatus.READY_FOR_DELIVERY }),
      ),
    ).toBe(false);
  });

  it("requires warehouse role", () => {
    const result = rule.evaluate(
      ctx({ ...applyCtx, actor: { id: "u1" }, currentStatus: OrderStatus.ASSEMBLING }),
    );
    expect(result).toMatchObject({ allowed: false, denialCode: "WAREHOUSE_ROLE_REQUIRED" });
  });

  it("allows only from ASSEMBLING", () => {
    expect(
      rule.evaluate(ctx({ ...applyCtx, actor: warehouse, currentStatus: OrderStatus.ASSEMBLING }))
        .allowed,
    ).toBe(true);
    const denied = rule.evaluate(
      ctx({ ...applyCtx, actor: warehouse, currentStatus: OrderStatus.CONFIRMED }),
    );
    expect(denied).toMatchObject({
      allowed: false,
      denialCode: "INVALID_COMPLETE_ASSEMBLY_TRANSITION",
    });
  });
});

describe("CourierAcceptOrderRule", () => {
  const rule = new CourierAcceptOrderRule();
  const courier = { id: "c1", roles: ["courier" as const] };
  const applyCtx = { reason: "courier_accept", targetStatus: OrderStatus.READY_FOR_DELIVERY };

  it("applies only to courier_accept -> READY_FOR_DELIVERY", () => {
    expect(rule.applies(ctx(applyCtx))).toBe(true);
    expect(
      rule.applies(
        ctx({ reason: "courier_start_delivery", targetStatus: OrderStatus.READY_FOR_DELIVERY }),
      ),
    ).toBe(false);
  });

  it("requires courier role", () => {
    const result = rule.evaluate(ctx({ ...applyCtx, actor: { id: "u1" } }));
    expect(result).toMatchObject({ allowed: false, denialCode: "COURIER_ROLE_REQUIRED" });
  });

  it("allows from READY_FOR_DELIVERY", () => {
    expect(
      rule.evaluate(
        ctx({ ...applyCtx, actor: courier, currentStatus: OrderStatus.READY_FOR_DELIVERY }),
      ).allowed,
    ).toBe(true);
  });

  it("denies from CREATED or ASSEMBLING (warehouse must finish first)", () => {
    for (const status of [OrderStatus.CREATED, OrderStatus.ASSEMBLING]) {
      const result = rule.evaluate(ctx({ ...applyCtx, actor: courier, currentStatus: status }));
      expect(result).toMatchObject({ allowed: false, denialCode: "INVALID_ACCEPT_TRANSITION" });
    }
  });
});

describe("CourierStartDeliveryRule", () => {
  const rule = new CourierStartDeliveryRule();
  const courier = { id: "c1", roles: ["courier" as const] };
  const applyCtx = { reason: "courier_start_delivery", targetStatus: OrderStatus.OUT_FOR_DELIVERY };

  it("applies only to courier_start_delivery -> OUT_FOR_DELIVERY", () => {
    expect(rule.applies(ctx(applyCtx))).toBe(true);
    expect(
      rule.applies(ctx({ reason: "courier_arrive", targetStatus: OrderStatus.OUT_FOR_DELIVERY })),
    ).toBe(false);
  });

  it("requires courier role", () => {
    const result = rule.evaluate(ctx({ ...applyCtx, actor: { id: "u1" } }));
    expect(result).toMatchObject({ allowed: false, denialCode: "COURIER_ROLE_REQUIRED" });
  });

  it("allows from READY_FOR_DELIVERY", () => {
    expect(
      rule.evaluate(
        ctx({ ...applyCtx, actor: courier, currentStatus: OrderStatus.READY_FOR_DELIVERY }),
      ).allowed,
    ).toBe(true);
  });

  it("denies from ASSEMBLING or ARRIVED", () => {
    for (const status of [OrderStatus.ASSEMBLING, OrderStatus.ARRIVED]) {
      const result = rule.evaluate(ctx({ ...applyCtx, actor: courier, currentStatus: status }));
      expect(result).toMatchObject({
        allowed: false,
        denialCode: "INVALID_START_DELIVERY_TRANSITION",
      });
    }
  });
});

describe("CourierArriveRule", () => {
  const rule = new CourierArriveRule();
  const courier = { id: "c1", roles: ["courier" as const] };
  const applyCtx = { reason: "courier_arrive", targetStatus: OrderStatus.ARRIVED };

  it("applies only to courier_arrive -> ARRIVED", () => {
    expect(rule.applies(ctx(applyCtx))).toBe(true);
    expect(
      rule.applies(ctx({ reason: "courier_complete_delivery", targetStatus: OrderStatus.ARRIVED })),
    ).toBe(false);
  });

  it("requires courier role", () => {
    const result = rule.evaluate(
      ctx({ ...applyCtx, actor: { id: "u1" }, currentStatus: OrderStatus.OUT_FOR_DELIVERY }),
    );
    expect(result).toMatchObject({ allowed: false, denialCode: "COURIER_ROLE_REQUIRED" });
  });

  it("allows only from OUT_FOR_DELIVERY", () => {
    expect(
      rule.evaluate(
        ctx({ ...applyCtx, actor: courier, currentStatus: OrderStatus.OUT_FOR_DELIVERY }),
      ).allowed,
    ).toBe(true);
    const denied = rule.evaluate(
      ctx({ ...applyCtx, actor: courier, currentStatus: OrderStatus.READY_FOR_DELIVERY }),
    );
    expect(denied).toMatchObject({ allowed: false, denialCode: "INVALID_ARRIVE_TRANSITION" });
  });
});

describe("CourierCompleteDeliveryRule", () => {
  const rule = new CourierCompleteDeliveryRule();
  const courier = { id: "c1", roles: ["courier" as const] };
  const applyCtx = { reason: "courier_complete_delivery", targetStatus: OrderStatus.DELIVERED };

  it("applies only to courier_complete_delivery -> DELIVERED", () => {
    expect(rule.applies(ctx(applyCtx))).toBe(true);
    expect(
      rule.applies(ctx({ reason: "courier_arrive", targetStatus: OrderStatus.DELIVERED })),
    ).toBe(false);
  });

  it("requires courier role", () => {
    const result = rule.evaluate(
      ctx({ ...applyCtx, actor: { id: "u1" }, currentStatus: OrderStatus.ARRIVED }),
    );
    expect(result).toMatchObject({ allowed: false, denialCode: "COURIER_ROLE_REQUIRED" });
  });

  it("allows from ARRIVED or OUT_FOR_DELIVERY", () => {
    expect(
      rule.evaluate(ctx({ ...applyCtx, actor: courier, currentStatus: OrderStatus.ARRIVED }))
        .allowed,
    ).toBe(true);
    expect(
      rule.evaluate(
        ctx({ ...applyCtx, actor: courier, currentStatus: OrderStatus.OUT_FOR_DELIVERY }),
      ).allowed,
    ).toBe(true);
  });

  it("denies from READY_FOR_DELIVERY", () => {
    const result = rule.evaluate(
      ctx({ ...applyCtx, actor: courier, currentStatus: OrderStatus.READY_FOR_DELIVERY }),
    );
    expect(result).toMatchObject({
      allowed: false,
      denialCode: "INVALID_COMPLETE_DELIVERY_TRANSITION",
    });
  });
});
