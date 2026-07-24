import type { AnalyticsManagementApplicationService } from "@server/application/analytics-management/services/analytics-management-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import { createJsonResponse } from "@server/api/modules/routing/module-controller.helpers";

/** Analytics management HTTP controller — read-only analytics only. */
export class AnalyticsManagementController {
  constructor(private readonly analytics: AnalyticsManagementApplicationService) {}

  async dashboard(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.analytics.getDashboard();
    return createJsonResponse(context, result.value);
  }

  async sales(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.analytics.getSales();
    return createJsonResponse(context, result.value);
  }

  async orders(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.analytics.getOrders();
    return createJsonResponse(context, result.value);
  }

  async products(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.analytics.getProducts();
    return createJsonResponse(context, result.value);
  }

  async customers(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.analytics.getCustomers();
    return createJsonResponse(context, result.value);
  }

  async sellers(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.analytics.getSellers();
    return createJsonResponse(context, result.value);
  }

  async deliveries(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.analytics.getDeliveries();
    return createJsonResponse(context, result.value);
  }

  async payments(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.analytics.getPayments();
    return createJsonResponse(context, result.value);
  }
}
