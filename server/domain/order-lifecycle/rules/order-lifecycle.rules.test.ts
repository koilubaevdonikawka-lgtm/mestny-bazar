import { describe, expect, it } from "vitest";
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
  const applyCtx = { reason: "customer_cancel", targetStatus: OrderStatus.CANCELLED };

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

  it("allows cancelling before assembly starts", () => {
    for (const status of [OrderStatus.CREATED, OrderStatus.PAID, OrderStatus.CONFIRMED]) {
      const result = rule.evaluate(
        ctx({ ...applyCtx, actor: { id: "u1" }, currentStatus: status }),
      );
      expect(result.allowed).toBe(true);
    }
  });

  it("denies cancelling once assembly has started", () => {
    for (const status of [
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
});

describe("WarehouseStartAssemblyRule", () => {
  const rule = new WarehouseStartAssemblyRule();
  const warehouse = { id: "w1", roles: ["warehouse" as const] };
  const applyCtx = { reason: "warehouse_start_assembly", targetStatus: OrderStatus.ASSEMBLING };

  it("requires warehouse role", () => {
    const result = rule.evaluate(ctx({ ...applyCtx, actor: { id: "u1" } }));
    expect(result).toMatchObject({ allowed: false, denialCode: "WAREHOUSE_ROLE_REQUIRED" });
  });

  it("allows from CONFIRMED or PAID", () => {
    expect(
      rule.evaluate(ctx({ ...applyCtx, actor: warehouse, currentStatus: OrderStatus.CONFIRMED }))
        .allowed,
    ).toBe(true);
    expect(
      rule.evaluate(ctx({ ...applyCtx, actor: warehouse, currentStatus: OrderStatus.PAID }))
        .allowed,
    ).toBe(true);
  });

  it("denies from CREATED", () => {
    const result = rule.evaluate(
      ctx({ ...applyCtx, actor: warehouse, currentStatus: OrderStatus.CREATED }),
    );
    expect(result).toMatchObject({
      allowed: false,
      denialCode: "INVALID_START_ASSEMBLY_TRANSITION",
    });
  });
});

describe("WarehouseCompleteAssemblyRule", () => {
  const rule = new WarehouseCompleteAssemblyRule();
  const warehouse = { id: "w1", roles: ["warehouse" as const] };
  const applyCtx = {
    reason: "warehouse_complete_assembly",
    targetStatus: OrderStatus.READY_FOR_DELIVERY,
  };

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

  it("requires courier role", () => {
    const result = rule.evaluate(ctx({ ...applyCtx, actor: { id: "u1" } }));
    expect(result).toMatchObject({ allowed: false, denialCode: "COURIER_ROLE_REQUIRED" });
  });

  it("allows from READY_FOR_DELIVERY or ASSEMBLING", () => {
    expect(
      rule.evaluate(
        ctx({ ...applyCtx, actor: courier, currentStatus: OrderStatus.READY_FOR_DELIVERY }),
      ).allowed,
    ).toBe(true);
    expect(
      rule.evaluate(ctx({ ...applyCtx, actor: courier, currentStatus: OrderStatus.ASSEMBLING }))
        .allowed,
    ).toBe(true);
  });

  it("denies from CREATED", () => {
    const result = rule.evaluate(
      ctx({ ...applyCtx, actor: courier, currentStatus: OrderStatus.CREATED }),
    );
    expect(result).toMatchObject({ allowed: false, denialCode: "INVALID_ACCEPT_TRANSITION" });
  });
});

describe("CourierStartDeliveryRule", () => {
  const rule = new CourierStartDeliveryRule();
  const courier = { id: "c1", roles: ["courier" as const] };
  const applyCtx = { reason: "courier_start_delivery", targetStatus: OrderStatus.OUT_FOR_DELIVERY };

  it("requires courier role", () => {
    const result = rule.evaluate(ctx({ ...applyCtx, actor: { id: "u1" } }));
    expect(result).toMatchObject({ allowed: false, denialCode: "COURIER_ROLE_REQUIRED" });
  });

  it("allows from READY_FOR_DELIVERY or ASSEMBLING", () => {
    expect(
      rule.evaluate(
        ctx({ ...applyCtx, actor: courier, currentStatus: OrderStatus.READY_FOR_DELIVERY }),
      ).allowed,
    ).toBe(true);
    expect(
      rule.evaluate(ctx({ ...applyCtx, actor: courier, currentStatus: OrderStatus.ASSEMBLING }))
        .allowed,
    ).toBe(true);
  });

  it("denies from ARRIVED", () => {
    const result = rule.evaluate(
      ctx({ ...applyCtx, actor: courier, currentStatus: OrderStatus.ARRIVED }),
    );
    expect(result).toMatchObject({
      allowed: false,
      denialCode: "INVALID_START_DELIVERY_TRANSITION",
    });
  });
});

describe("CourierArriveRule", () => {
  const rule = new CourierArriveRule();
  const courier = { id: "c1", roles: ["courier" as const] };
  const applyCtx = { reason: "courier_arrive", targetStatus: OrderStatus.ARRIVED };

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
