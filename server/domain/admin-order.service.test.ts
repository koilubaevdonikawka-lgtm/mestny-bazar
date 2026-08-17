import { describe, expect, it, vi } from "vitest";
import { AdminOrderService } from "@server/domain/admin-order.service";
import { OrderLifecycleCascadeService } from "@server/domain/order-lifecycle-cascade.service";
import { CourierAssignmentService } from "@server/domain/courier-assignment.service";
import { InventoryService } from "@server/domain/inventory.service";
import { VariantStockService } from "@server/domain/variant-stock.service";
import { OrderNotFoundError } from "@server/domain/orders.errors";
import type { IOrderRepository } from "@server/ports/order.repository";
import type { IOrderLifecyclePolicy } from "@server/ports/order-lifecycle.port";
import type { IOrderCascadeRepository } from "@server/ports/order-cascade.repository";
import type { ICourierStatusRepository } from "@server/ports/courier-status.repository";
import type { ICourierProfileRepository } from "@server/ports/courier-profile.repository";
import type { IMarketplaceEventBus, MarketplaceEvent } from "@server/ports/marketplace-events.port";
import type { IProductRepository, StockReservationItem } from "@server/ports/product.repository";
import type { IProductVariantRepository } from "@server/ports/product-variant.repository";
import type { IVariantStockRepository } from "@server/ports/variant-stock.repository";
import type { IStockPolicy, StockPolicyResult } from "@server/ports/stock-policy.port";
import type { ProductVariantDTO } from "@shared/contracts/product-variant";
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
    // Buffer already expired by default, so cascade sweeps in these tests are
    // no-ops unless a test explicitly overrides createdAt.
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    paidAt: null,
    assignedCourierId: null,
    zoneId: null,
    deliveryTariffId: null,
    deliveryEtaMinMinutes: null,
    deliveryEtaMaxMinutes: null,
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
    updateStatus: vi.fn(async (_id, _from, status) => makeOrder({ status })),
    updatePaymentStatus: vi.fn(async () => makeOrder()),
    countByStatuses: vi.fn(async () => 0),
    getTodaySummary: vi.fn(async () => ({ orderCount: 0, revenue: 0 })),

    assignCourier: vi.fn(async (_id, courierId) => makeOrder({ assignedCourierId: courierId })),

    countActiveDeliveriesByCourier: vi.fn(async () => 0),

    listByStatusesForCourier: vi.fn(async () => []),
    listByCourier: vi.fn(async () => ({
      items: [],
      total: 0,
      page: 1,
      pageSize: 50,
      hasMore: false,
    })),
    listInPeriod: vi.fn(async () => []),
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

function fakeCascadeRepo(
  overrides: Partial<IOrderCascadeRepository> = {},
): IOrderCascadeRepository {
  return {
    claim: vi.fn(async () => true),
    ...overrides,
  };
}

function fakeEventBus(overrides: Partial<IMarketplaceEventBus> = {}): IMarketplaceEventBus {
  return {
    publish: vi.fn(async (_event: MarketplaceEvent) => {}),
    subscribe: vi.fn(),
    ...overrides,
  };
}

function fakeCourierProfileRepo(
  overrides: Partial<ICourierProfileRepository> = {},
): ICourierProfileRepository {
  return {
    list: vi.fn(async () => []),
    getByUserId: vi.fn(async () => null),
    create: vi.fn(),
    update: vi.fn(),
    setStatus: vi.fn(),
    bulkSetStatus: vi.fn(),
    listBlockedCourierIds: vi.fn(async () => []),
    ...overrides,
  } as ICourierProfileRepository;
}

function fakeCourierStatusRepo(
  overrides: Partial<ICourierStatusRepository> = {},
): ICourierStatusRepository {
  return {
    listAvailable: vi.fn(async () => []),
    listAll: vi.fn(async () => []),
    get: vi.fn(async () => null),
    setAvailability: vi.fn(),
    touch: vi.fn(),
    ...overrides,
  };
}

function fakeProductRepository(overrides: Partial<IProductRepository> = {}): IProductRepository {
  return {
    list: vi.fn(async () => ({ items: [], total: 0, page: 1, pageSize: 50, hasMore: false })),
    getBySlug: vi.fn(async () => null),
    getById: vi.fn(async () => null),
    getManyByIds: vi.fn(async () => []),
    getManyBySlugs: vi.fn(async () => []),
    checkStock: vi.fn(async () => true),
    reserveStock: vi.fn(async (_items: StockReservationItem[]) => {}),
    releaseStock: vi.fn(async (_items: StockReservationItem[]) => {}),
    increaseStock: vi.fn(async (_items: StockReservationItem[]) => {}),
    ...overrides,
  };
}

function fakeProductVariantRepository(
  overrides: Partial<IProductVariantRepository> = {},
): IProductVariantRepository {
  return {
    listForProduct: vi.fn(async () => []),
    getById: vi.fn(async (id: string): Promise<ProductVariantDTO | null> => ({
      id,
      productId: "product-1",
      sku: "SKU-1",
      price: null,
      imageUrl: null,
      publicationStatus: "PUBLISHED",
      sortOrder: 0,
    })),
    create: vi.fn(),
    update: vi.fn(),
    skuExists: vi.fn(async () => false),
    ...overrides,
  };
}

function fakeVariantStockRepository(
  overrides: Partial<IVariantStockRepository> = {},
): IVariantStockRepository {
  return {
    listForProduct: vi.fn(async () => []),
    getByVariantId: vi.fn(async () => null),
    create: vi.fn(async (variantId: string, stock: number, lowStockThreshold: number | null) => ({
      variantId,
      stock,
      lowStockThreshold,
    })),
    adjustStock: vi.fn(async (variantId: string, stock: number) => ({
      variantId,
      stock,
      lowStockThreshold: null,
    })),
    setLowStockThreshold: vi.fn(async (variantId: string, threshold: number | null) => ({
      variantId,
      stock: 0,
      lowStockThreshold: threshold,
    })),
    reserveStock: vi.fn(async () => {}),
    releaseStock: vi.fn(async () => {}),
    ...overrides,
  };
}

function fakeStockPolicy(overrides: Partial<IStockPolicy> = {}): IStockPolicy {
  const evaluateStock = vi.fn((): StockPolicyResult => ({ allowed: true, effectiveThreshold: 5 }));
  return { evaluateStock, assertStockOk: vi.fn(), ...overrides };
}

const admin = { id: "admin-1", roles: ["admin" as const] };

function buildService(deps: {
  repo?: IOrderRepository;
  lifecycle?: IOrderLifecyclePolicy;
  cascadeRepo?: IOrderCascadeRepository;
  events?: IMarketplaceEventBus;
  productRepo?: IProductRepository;
  variantStockRepo?: IVariantStockRepository;
}) {
  const repo = deps.repo ?? fakeRepo();
  const lifecycle = deps.lifecycle ?? fakeLifecycle();
  const events = deps.events ?? fakeEventBus();
  const courierAssignment = new CourierAssignmentService(
    fakeCourierStatusRepo(),
    repo,
    { selectCourier: vi.fn(() => ({ courierId: null })) },
    events,
    fakeCourierProfileRepo(),
  );
  const cascade = new OrderLifecycleCascadeService(
    deps.cascadeRepo ?? fakeCascadeRepo(),
    events,
    courierAssignment,
  );
  const inventory = new InventoryService(deps.productRepo ?? fakeProductRepository());
  const variantStockRepo = deps.variantStockRepo ?? fakeVariantStockRepository();
  const variantStock = new VariantStockService(
    variantStockRepo,
    fakeProductVariantRepository(),
    fakeStockPolicy(),
  );
  return new AdminOrderService(repo, lifecycle, cascade, inventory, events, variantStock);
}

describe("AdminOrderService", () => {
  it("getOrder throws OrderNotFoundError when the repository returns null", async () => {
    const repo = fakeRepo({ getById: vi.fn(async () => null) });
    const service = buildService({ repo });

    await expect(service.getOrder("missing")).rejects.toBeInstanceOf(OrderNotFoundError);
  });

  it("confirmOrder asserts admin_confirm -> CONFIRMED before updating status and publishes order.confirmed", async () => {
    const repo = fakeRepo({ getById: vi.fn(async () => makeOrder({ status: OrderStatus.PAID })) });
    const lifecycle = fakeLifecycle();
    const events = fakeEventBus();
    const service = buildService({ repo, lifecycle, events });

    await service.confirmOrder("order-1", admin);

    expect(lifecycle.assertCanTransition).toHaveBeenCalledWith(
      expect.objectContaining({
        currentStatus: OrderStatus.PAID,
        targetStatus: OrderStatus.CONFIRMED,
        reason: "admin_confirm",
        actor: { id: admin.id, roles: admin.roles },
      }),
    );
    expect(repo.updateStatus).toHaveBeenCalledWith(
      "order-1",
      OrderStatus.PAID,
      OrderStatus.CONFIRMED,
    );
    expect(events.publish).toHaveBeenCalledWith(
      expect.objectContaining({ type: "order.confirmed" }),
    );
  });

  it("cancelOrder does not update status when the lifecycle policy denies it", async () => {
    const repo = fakeRepo();
    const lifecycle = fakeLifecycle({
      assertCanTransition: vi.fn(() => {
        throw new Error("denied");
      }),
    });
    const service = buildService({ repo, lifecycle });

    await expect(service.cancelOrder("order-1", admin)).rejects.toThrow("denied");
    expect(repo.updateStatus).not.toHaveBeenCalled();
  });

  it("cancelOrder releases reserved stock and publishes order.cancelled with reason admin_cancel", async () => {
    const cancelledOrder = makeOrder({
      status: OrderStatus.CANCELLED,
      items: [
        {
          id: "item-1",
          productId: "product-1",
          variantId: null,
          productName: "Молоко",
          productImageUrl: null,
          quantity: 2,
          unitPrice: 100,
          lineTotal: 200,
        },
      ],
    });
    const repo = fakeRepo({ updateStatus: vi.fn(async () => cancelledOrder) });
    const events = fakeEventBus();
    const productRepo = fakeProductRepository();
    const service = buildService({ repo, events, productRepo });

    await service.cancelOrder("order-1", admin);

    expect(productRepo.releaseStock).toHaveBeenCalledWith([
      { productId: "product-1", quantity: 2 },
    ]);
    expect(events.publish).toHaveBeenCalledWith({
      type: "order.cancelled",
      order: cancelledOrder,
      reason: "admin_cancel",
    });
  });

  it("cancelOrder releases reserved variant stock alongside product stock (Stage 21)", async () => {
    const cancelledOrder = makeOrder({
      status: OrderStatus.CANCELLED,
      items: [
        {
          id: "item-1",
          productId: "product-1",
          variantId: "variant-1",
          productName: "Молоко (вариант)",
          productImageUrl: null,
          quantity: 3,
          unitPrice: 100,
          lineTotal: 300,
        },
      ],
    });
    const repo = fakeRepo({ updateStatus: vi.fn(async () => cancelledOrder) });
    const productRepo = fakeProductRepository();
    const variantStockRepo = fakeVariantStockRepository();
    const service = buildService({ repo, productRepo, variantStockRepo });

    await service.cancelOrder("order-1", admin);

    expect(productRepo.releaseStock).toHaveBeenCalledWith([
      { productId: "product-1", quantity: 3 },
    ]);
    expect(variantStockRepo.releaseStock).toHaveBeenCalledWith([
      { variantId: "variant-1", quantity: 3 },
    ]);
  });

  it("cancelOrder never calls variantStock.releaseStock when no item has a variantId — full backward compatibility", async () => {
    const cancelledOrder = makeOrder({
      status: OrderStatus.CANCELLED,
      items: [
        {
          id: "item-1",
          productId: "product-1",
          variantId: null,
          productName: "Молоко",
          productImageUrl: null,
          quantity: 2,
          unitPrice: 100,
          lineTotal: 200,
        },
      ],
    });
    const repo = fakeRepo({ updateStatus: vi.fn(async () => cancelledOrder) });
    const variantStockRepo = fakeVariantStockRepository();
    const service = buildService({ repo, variantStockRepo });

    await service.cancelOrder("order-1", admin);

    expect(variantStockRepo.releaseStock).not.toHaveBeenCalled();
  });

  it("cancelOrder releases variant stock only for line items that have a variantId, in a mixed order", async () => {
    const cancelledOrder = makeOrder({
      status: OrderStatus.CANCELLED,
      items: [
        {
          id: "item-1",
          productId: "product-1",
          variantId: "variant-1",
          productName: "Товар с вариантом",
          productImageUrl: null,
          quantity: 1,
          unitPrice: 100,
          lineTotal: 100,
        },
        {
          id: "item-2",
          productId: "product-2",
          variantId: null,
          productName: "Обычный товар",
          productImageUrl: null,
          quantity: 5,
          unitPrice: 50,
          lineTotal: 250,
        },
      ],
    });
    const repo = fakeRepo({ updateStatus: vi.fn(async () => cancelledOrder) });
    const productRepo = fakeProductRepository();
    const variantStockRepo = fakeVariantStockRepository();
    const service = buildService({ repo, productRepo, variantStockRepo });

    await service.cancelOrder("order-1", admin);

    expect(productRepo.releaseStock).toHaveBeenCalledWith([
      { productId: "product-1", quantity: 1 },
      { productId: "product-2", quantity: 5 },
    ]);
    expect(variantStockRepo.releaseStock).toHaveBeenCalledWith([
      { variantId: "variant-1", quantity: 1 },
    ]);
  });

  it("listOrders delegates to the repository with pagination params", async () => {
    const repo = fakeRepo();
    const service = buildService({ repo });

    await service.listOrders({ page: 2, pageSize: 10 });
    expect(repo.listAll).toHaveBeenCalledWith({ page: 2, pageSize: 10 });
  });

  it("listOrders sweeps the cascade for orders whose buffer has expired", async () => {
    const expiredOrder = makeOrder({ status: OrderStatus.CREATED });
    const repo = fakeRepo({
      listAll: vi.fn(async () => ({
        items: [expiredOrder],
        total: 1,
        page: 1,
        pageSize: 50,
        hasMore: false,
      })),
    });
    const cascadeRepo = fakeCascadeRepo();
    const events = fakeEventBus();
    const service = buildService({ repo, cascadeRepo, events });

    await service.listOrders();

    expect(cascadeRepo.claim).toHaveBeenCalledWith(expiredOrder.id);
    expect(events.publish).toHaveBeenCalledWith({
      type: "order.operational_cascade_started",
      order: expiredOrder,
    });
  });

  it("listOrders does not trigger the cascade for an order still within its buffer", async () => {
    const freshOrder = makeOrder({
      status: OrderStatus.CREATED,
      createdAt: new Date().toISOString(),
    });
    const repo = fakeRepo({
      listAll: vi.fn(async () => ({
        items: [freshOrder],
        total: 1,
        page: 1,
        pageSize: 50,
        hasMore: false,
      })),
    });
    const cascadeRepo = fakeCascadeRepo();
    const service = buildService({ repo, cascadeRepo });

    await service.listOrders();

    expect(cascadeRepo.claim).not.toHaveBeenCalled();
  });
});
