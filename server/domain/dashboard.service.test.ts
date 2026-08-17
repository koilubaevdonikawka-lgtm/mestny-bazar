import { describe, expect, it, vi } from "vitest";
import { DashboardService } from "@server/domain/dashboard.service";
import type { StockAdminService } from "@server/domain/stock-admin.service";
import type { IOrderRepository } from "@server/ports/order.repository";
import type { StockItemDTO } from "@shared/contracts/stock";
import { OrderStatus } from "@shared/contracts/order";

function fakeOrderRepo(overrides: Partial<IOrderRepository> = {}): IOrderRepository {
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
    ...overrides,
  } as IOrderRepository;
}

function fakeStockAdmin(items: StockItemDTO[] = []): StockAdminService {
  return { listStock: vi.fn(async () => items) } as unknown as StockAdminService;
}

describe("DashboardService.getSummary", () => {
  it("aggregates KPI counts per status and today's order summary", async () => {
    const orders = fakeOrderRepo({
      getTodaySummary: vi.fn(async () => ({ orderCount: 4, revenue: 4000 })),
      countByStatuses: vi.fn(async (statuses) => {
        if (statuses.includes(OrderStatus.ASSEMBLING) && statuses.length === 1) return 2;
        if (statuses.includes(OrderStatus.CONFIRMED)) return 3;
        if (statuses.includes(OrderStatus.OUT_FOR_DELIVERY)) return 5;
        return 0;
      }),
    });
    const service = new DashboardService(orders, fakeStockAdmin());

    const summary = await service.getSummary();

    expect(summary.kpi).toEqual({
      newOrdersToday: 4,
      assembling: 2,
      inDelivery: 5,
      revenueToday: 4000,
      currency: "KGS",
    });
    expect(summary.warehouseQueue).toEqual({ confirmed: 3, assembling: 2 });
  });

  it("filters the attention list to only non-ok stock items", async () => {
    const items: StockItemDTO[] = [
      {
        productId: "p1",
        name: "OK product",
        stock: 50,
        lowStockThreshold: null,
        effectiveThreshold: 5,
        status: "ok",
        unit: null,
      },
      {
        productId: "p2",
        name: "Low product",
        stock: 2,
        lowStockThreshold: null,
        effectiveThreshold: 5,
        status: "low",
        unit: null,
      },
    ];
    const service = new DashboardService(fakeOrderRepo(), fakeStockAdmin(items));

    const summary = await service.getSummary();
    expect(summary.attention).toEqual([items[1]]);
  });
});
