import type { StockItemDTO } from "@shared/contracts/stock";

export interface DashboardKpiDTO {
  newOrdersToday: number;
  assembling: number;
  inDelivery: number;
  revenueToday: number;
  currency: string;
}

export interface DashboardSummaryDTO {
  kpi: DashboardKpiDTO;
  /** Low-stock/depleted products — the "Требует внимания" widget (dashboard.md). */
  attention: StockItemDTO[];
  warehouseQueue: {
    confirmed: number;
    assembling: number;
  };
}
