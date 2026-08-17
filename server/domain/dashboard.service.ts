import type { IOrderRepository } from "@server/ports/order.repository";
import type { StockAdminService } from "@server/domain/stock-admin.service";
import type { DashboardSummaryDTO } from "@shared/contracts/dashboard";
import { OrderStatus } from "@shared/contracts/order";

const DEFAULT_CURRENCY = "KGS";

/**
 * Read-only aggregator (dashboard.md) — no mutations, no rule engine of its
 * own (delegates the low-stock question to StockAdminService/StockPolicyService).
 * Live event-driven widgets ("Заказы в реальном времени", "Активность
 * курьеров") are documented future extensions — dashboard.md itself allows
 * KPI cards to be "при загрузке + периодический опрос" (poll, not push), and
 * Курьеры has no assignment domain yet (Stage 3 gap) — both are honestly
 * omitted here rather than faked.
 */
export class DashboardService {
  constructor(
    private readonly orders: IOrderRepository,
    private readonly stockAdmin: StockAdminService,
  ) {}

  async getSummary(): Promise<DashboardSummaryDTO> {
    const [today, assembling, confirmed, delivery, stockItems] = await Promise.all([
      this.orders.getTodaySummary(),
      this.orders.countByStatuses([OrderStatus.ASSEMBLING]),
      this.orders.countByStatuses([OrderStatus.CONFIRMED]),
      this.orders.countByStatuses([OrderStatus.OUT_FOR_DELIVERY, OrderStatus.ARRIVED]),
      this.stockAdmin.listStock(),
    ]);

    return {
      kpi: {
        newOrdersToday: today.orderCount,
        assembling,
        inDelivery: delivery,
        revenueToday: today.revenue,
        currency: DEFAULT_CURRENCY,
      },
      attention: stockItems.filter((item) => item.status !== "ok"),
      warehouseQueue: {
        confirmed,
        assembling,
      },
    };
  }
}
