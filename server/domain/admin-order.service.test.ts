import { describe, expect, it, vi } from "vitest";
import { AdminOrderService } from "@server/domain/admin-order.service";
import { OrderNotFoundError } from "@server/domain/orders.errors";
import type { IOrderRepository } from "@server/ports/order.repository";
import type { IOrderLifecyclePolicy } from "@server/ports/order-lifecycle.port";
import type { OrderDTO } from "@shared/contracts/order";
import { OrderStatus } from "@shared/contracts/order";

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

function fakeRepo(overrides: Partial<IOrderRepository> = {}): IOrderRepository {
  return {
    create: vi.fn(async () => makeOrder()),
    getById: vi.fn(async () => makeOrder()),
    getByIdempotencyKey: vi.fn(async () => null),
    listByUser: vi.fn(async () => []),
    listAll: vi.fn(async () => ({ items: [], total: 0, page: 1, pageSize: 50, hasMore: false })),
    listByStatuses: vi.fn(async () => []),
    updateStatus: vi.fn(async (_id, status) => makeOrder({ status })),
    updatePaymentStatus: vi.fn(async () => makeOrder()),
    ...overrides,
  };
}

function fakeLifecycle(overrides: Partial<IOrderLifecyclePolicy> = {}): IOrderLifecyclePolicy {
  return {
    canTransition: vi.fn(() => ({ allowed: true })),
    assertCanTransition: vi.fn(() => {}),
    ...overrides,
  };
}

const admin = { id: "admin-1", roles: ["admin" as const] };

describe("AdminOrderService", () => {
  it("getOrder throws OrderNotFoundError when the repository returns null", async () => {
    const repo = fakeRepo({ getById: vi.fn(async () => null) });
    const service = new AdminOrderService(repo, fakeLifecycle());

    await expect(service.getOrder("missing")).rejects.toBeInstanceOf(OrderNotFoundError);
  });

  it("confirmOrder asserts admin_confirm -> CONFIRMED before updating status", async () => {
    const repo = fakeRepo({ getById: vi.fn(async () => makeOrder({ status: OrderStatus.PAID })) });
    const lifecycle = fakeLifecycle();
    const service = new AdminOrderService(repo, lifecycle);

    await service.confirmOrder("order-1", admin);

    expect(lifecycle.assertCanTransition).toHaveBeenCalledWith(
      expect.objectContaining({
        currentStatus: OrderStatus.PAID,
        targetStatus: OrderStatus.CONFIRMED,
        reason: "admin_confirm",
        actor: { id: admin.id, roles: admin.roles },
      }),
    );
    expect(repo.updateStatus).toHaveBeenCalledWith("order-1", OrderStatus.CONFIRMED);
  });

  it("cancelOrder does not update status when the lifecycle policy denies it", async () => {
    const repo = fakeRepo();
    const lifecycle = fakeLifecycle({
      assertCanTransition: vi.fn(() => {
        throw new Error("denied");
      }),
    });
    const service = new AdminOrderService(repo, lifecycle);

    await expect(service.cancelOrder("order-1", admin)).rejects.toThrow("denied");
    expect(repo.updateStatus).not.toHaveBeenCalled();
  });

  it("listOrders delegates to the repository with pagination params", async () => {
    const repo = fakeRepo();
    const service = new AdminOrderService(repo, fakeLifecycle());

    await service.listOrders({ page: 2, pageSize: 10 });
    expect(repo.listAll).toHaveBeenCalledWith({ page: 2, pageSize: 10 });
  });
});
