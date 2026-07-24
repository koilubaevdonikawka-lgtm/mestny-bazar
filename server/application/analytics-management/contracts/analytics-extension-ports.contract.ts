/**
 * Future integration ports for Analytics Management.
 * Not implemented — reserved for external analytics engines.
 */

import type { DashboardAnalytics } from "./analytics-aggregator.contract";

/** BI Engine — advanced reporting and dashboards. */
export interface IBiEngine {
  generateReport(reportType: string, filters?: Record<string, string>): Promise<unknown>;
  exportDashboard(format: "csv" | "pdf" | "xlsx"): Promise<string>;
}

/** Data Warehouse — long-term analytics storage. */
export interface IDataWarehouse {
  ingestEvent(stream: string, payload: unknown): Promise<void>;
  query(sql: string): Promise<readonly Record<string, unknown>[]>;
}

/** Forecast Engine — demand and revenue forecasting. */
export interface IForecastEngine {
  forecastSales(days: number): Promise<readonly { date: string; value: number }[]>;
  forecastOrders(days: number): Promise<readonly { date: string; value: number }[]>;
}

/** Recommendation Engine — product and seller recommendations. */
export interface IRecommendationEngine {
  recommendProducts(customerId: string, limit?: number): Promise<readonly string[]>;
  recommendSellers(categoryId?: string): Promise<readonly string[]>;
}

/** Machine Learning — predictive analytics models. */
export interface IMachineLearning {
  predictChurn(customerId: string): Promise<{ score: number; risk: string }>;
  predictLifetimeValue(customerId: string): Promise<number>;
}

/** Real-time Analytics — streaming metrics. */
export interface IRealTimeAnalytics {
  subscribeMetrics(callback: (metrics: DashboardAnalytics) => void): Promise<void>;
  getLiveCounters(): Promise<Readonly<Record<string, number>>>;
}
