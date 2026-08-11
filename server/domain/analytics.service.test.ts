import { describe, expect, it, vi } from "vitest";
import { AnalyticsService } from "@server/domain/analytics.service";
import type { IOrderRepository } from "@server/ports/order.repository";
import type { OrderDTO } from "@shared/contracts/order";

function makeOrder(overrides: Partial<OrderDTO> = {}): OrderDTO {
  return {
    id: "order-1",
    orderNumber: 1,
    status: "DELIVERED",
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
    ...overrides,
  };
}

function fakeOrderRepository(overrides: Partial<IOrderRepository> = {}): IOrderRepository {
  return {
    create: vi.fn(),
    getById: vi.fn(async () => null),
    getByIdempotencyKey: vi.fn(async () => null),
    listByUser: vi.fn(async () => []),
    listAll: vi.fn(async () => ({ items: [], total: 0, page: 1, pageSize: 50, hasMore: false })),
    listByStatuses: vi.fn(async () => []),
    updateStatus: vi.fn(),
    updatePaymentStatus: vi.fn(),
    countByStatuses: vi.fn(async () => 0),
    getTodaySummary: vi.fn(async () => ({ orderCount: 0, revenue: 0 })),
    assignCourier: vi.fn(),
    countActiveDeliveriesByCourier: vi.fn(async () => 0),
    listByStatusesForCourier: vi.fn(async () => []),
    listInPeriod: vi.fn(async () => []),
    ...overrides,
  } as IOrderRepository;
}

describe("AnalyticsService.getSalesAnalytics", () => {
  it("aggregates order count, revenue and average order value, excluding cancelled orders", async () => {
    const orders = fakeOrderRepository({
      listInPeriod: vi.fn(async () => [
        makeOrder({ id: "o1", total: 100 }),
        makeOrder({ id: "o2", total: 200 }),
        makeOrder({ id: "o3", total: 999, status: "CANCELLED" }),
      ]),
    });
    const service = new AnalyticsService(orders);

    const result = await service.getSalesAnalytics();

    expect(result.orderCount).toBe(2);
    expect(result.revenue).toBe(300);
    expect(result.averageOrderValue).toBe(150);
  });

  it("returns zero average order value when there are no orders in the period", async () => {
    const orders = fakeOrderRepository({ listInPeriod: vi.fn(async () => []) });
    const service = new AnalyticsService(orders);

    const result = await service.getSalesAnalytics();

    expect(result.orderCount).toBe(0);
    expect(result.averageOrderValue).toBe(0);
  });

  it("aggregates top products by revenue across orders, skipping line items with no productId", async () => {
    const orders = fakeOrderRepository({
      listInPeriod: vi.fn(async () => [
        makeOrder({
          id: "o1",
          items: [
            {
              id: "i1",
              productId: "p1",
              variantId: null,
              productName: "Apples",
              productImageUrl: null,
              quantity: 2,
              unitPrice: 50,
              lineTotal: 100,
            },
            {
              id: "i2",
              productId: null,
              variantId: null,
              productName: "Custom",
              productImageUrl: null,
              quantity: 1,
              unitPrice: 10,
              lineTotal: 10,
            },
          ],
        }),
        makeOrder({
          id: "o2",
          items: [
            {
              id: "i3",
              productId: "p1",
              variantId: null,
              productName: "Apples",
              productImageUrl: null,
              quantity: 1,
              unitPrice: 50,
              lineTotal: 50,
            },
          ],
        }),
      ]),
    });
    const service = new AnalyticsService(orders);

    const result = await service.getSalesAnalytics();

    expect(result.topProducts).toEqual([
      { productId: "p1", productName: "Apples", quantitySold: 3, revenue: 150 },
    ]);
  });

  it("passes an explicit period through to the repository unchanged", async () => {
    const listInPeriod = vi.fn(async () => []);
    const orders = fakeOrderRepository({ listInPeriod });
    const service = new AnalyticsService(orders);

    await service.getSalesAnalytics({
      periodStart: "2026-01-01T00:00:00.000Z",
      periodEnd: "2026-01-31T00:00:00.000Z",
    });

    expect(listInPeriod).toHaveBeenCalledWith(
      "2026-01-01T00:00:00.000Z",
      "2026-01-31T00:00:00.000Z",
    );
  });
});
