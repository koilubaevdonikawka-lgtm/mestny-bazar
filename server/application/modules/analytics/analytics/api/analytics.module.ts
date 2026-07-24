import type {
  GetCustomerMetricsDto,
  GetMarketplaceMetricsDto,
  GetOrderMetricsDto,
  GetProductMetricsDto,
  GetSalesMetricsDto,
  GetSellerMetricsDto,
  RebuildProjectionDto,
} from "@server/application/modules/analytics/analytics/dto";
import type {
  CustomerMetrics,
  MarketplaceMetrics,
  OrderMetrics,
  ProductMetrics,
  SalesMetrics,
  SellerMetrics,
} from "@server/application/modules/analytics/analytics/models";
import type { AnalyticsService } from "@server/application/modules/analytics/analytics/services";

/** Public entry point for the Analytics business capability module. */
export class AnalyticsModule {
  constructor(private readonly service: AnalyticsService) {}

  getSalesMetrics(dto?: GetSalesMetricsDto): Promise<SalesMetrics> {
    return this.service.getSalesMetrics(dto);
  }

  getOrderMetrics(dto?: GetOrderMetricsDto): Promise<OrderMetrics> {
    return this.service.getOrderMetrics(dto);
  }

  getCustomerMetrics(dto?: GetCustomerMetricsDto): Promise<CustomerMetrics> {
    return this.service.getCustomerMetrics(dto);
  }

  getSellerMetrics(dto?: GetSellerMetricsDto): Promise<SellerMetrics> {
    return this.service.getSellerMetrics(dto);
  }

  getProductMetrics(dto?: GetProductMetricsDto): Promise<ProductMetrics> {
    return this.service.getProductMetrics(dto);
  }

  getMarketplaceMetrics(dto?: GetMarketplaceMetricsDto): Promise<MarketplaceMetrics> {
    return this.service.getMarketplaceMetrics(dto);
  }

  rebuildProjection(dto?: RebuildProjectionDto): Promise<void> {
    return this.service.rebuildProjection(dto);
  }
}
