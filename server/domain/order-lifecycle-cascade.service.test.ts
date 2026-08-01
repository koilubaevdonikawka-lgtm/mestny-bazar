import { describe, expect, it, vi } from "vitest";
import { OrderLifecycleCascadeService } from "@server/domain/order-lifecycle-cascade.service";
import type { IOrderCascadeRepository } from "@server/ports/order-cascade.repository";
import type { IMarketplaceEventBus, MarketplaceEvent } from "@server/ports/marketplace-events.port";
import type { OrderDTO } from "@shared/contracts/order";
import { OrderStatus } from "@shared/contracts/order";
import { CUSTOMER_CANCELLATION_WINDOW_MS } from "@shared/lib/order-cancellation";

function makeOrder(overrides: Partial<OrderDTO> = {}): OrderDTO {
  return {
    id: "order-1",
    orderNumber: 1,
    status: OrderStatus.CREATED,
    paymentStatus: "unpaid",
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
    ...overrides,
  };
}

function fakeCascadeRepo(
  overrides: Partial<IOrderCascadeRepository> = {},
): IOrderCascadeRepository {
  return { claim: vi.fn(async () => true), ...overrides };
}

function fakeEventBus(overrides: Partial<IMarketplaceEventBus> = {}): IMarketplaceEventBus {
  return {
    publish: vi.fn(async (_event: MarketplaceEvent) => {}),
    subscribe: vi.fn(),
    ...overrides,
  };
}

const EXPIRED_CREATED_AT = new Date(
  Date.now() - CUSTOMER_CANCELLATION_WINDOW_MS - 1000,
).toISOString();
const FRESH_CREATED_AT = new Date().toISOString();

describe("OrderLifecycleCascadeService.checkAndTrigger", () => {
  it("does nothing while the order is still within its cancellation buffer", async () => {
    const cascadeRepo = fakeCascadeRepo();
    const events = fakeEventBus();
    const service = new OrderLifecycleCascadeService(cascadeRepo, events);

    await service.checkAndTrigger(makeOrder({ createdAt: FRESH_CREATED_AT }));

    expect(cascadeRepo.claim).not.toHaveBeenCalled();
    expect(events.publish).not.toHaveBeenCalled();
  });

  it("does nothing for an order whose status is no longer CREATED/PAID", async () => {
    const cascadeRepo = fakeCascadeRepo();
    const events = fakeEventBus();
    const service = new OrderLifecycleCascadeService(cascadeRepo, events);

    await service.checkAndTrigger(
      makeOrder({ createdAt: EXPIRED_CREATED_AT, status: OrderStatus.CONFIRMED }),
    );

    expect(cascadeRepo.claim).not.toHaveBeenCalled();
    expect(events.publish).not.toHaveBeenCalled();
  });

  it("claims and publishes order.operational_cascade_started once the buffer has expired", async () => {
    const cascadeRepo = fakeCascadeRepo();
    const events = fakeEventBus();
    const service = new OrderLifecycleCascadeService(cascadeRepo, events);
    const order = makeOrder({ createdAt: EXPIRED_CREATED_AT });

    await service.checkAndTrigger(order);

    expect(cascadeRepo.claim).toHaveBeenCalledWith(order.id);
    expect(events.publish).toHaveBeenCalledWith({
      type: "order.operational_cascade_started",
      order,
    });
  });

  it("does not publish when another caller already claimed the cascade", async () => {
    const cascadeRepo = fakeCascadeRepo({ claim: vi.fn(async () => false) });
    const events = fakeEventBus();
    const service = new OrderLifecycleCascadeService(cascadeRepo, events);

    await service.checkAndTrigger(makeOrder({ createdAt: EXPIRED_CREATED_AT }));

    expect(events.publish).not.toHaveBeenCalled();
  });
});

describe("OrderLifecycleCascadeService.sweep", () => {
  it("checks every order in the batch, isolating individual failures", async () => {
    const cascadeRepo = fakeCascadeRepo();
    const events = fakeEventBus();
    const service = new OrderLifecycleCascadeService(cascadeRepo, events);
    const orders = [
      makeOrder({ id: "a", createdAt: EXPIRED_CREATED_AT }),
      makeOrder({ id: "b", createdAt: FRESH_CREATED_AT }),
    ];

    await service.sweep(orders);

    expect(cascadeRepo.claim).toHaveBeenCalledTimes(1);
    expect(cascadeRepo.claim).toHaveBeenCalledWith("a");
  });

  it("does not reject when an individual order's claim throws", async () => {
    const cascadeRepo = fakeCascadeRepo({
      claim: vi.fn(async () => {
        throw new Error("db down");
      }),
    });
    const service = new OrderLifecycleCascadeService(cascadeRepo, fakeEventBus());

    await expect(
      service.sweep([makeOrder({ createdAt: EXPIRED_CREATED_AT })]),
    ).resolves.toBeUndefined();
  });
});
