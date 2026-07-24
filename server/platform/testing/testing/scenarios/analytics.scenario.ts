import { BootstrapTokens } from "@server/bootstrap/tokens";
import type { AnalyticsModule } from "@server/application/modules/analytics/analytics/api/analytics.module";
import type { ITestScenario } from "@server/platform/testing/testing/contracts";
import type { TestExecutionContext } from "@server/platform/testing/testing/runners/test-execution.context";

export const AnalyticsScenarioId = "analytics";

/** Analytics metrics read scenario. */
export class AnalyticsScenario implements ITestScenario {
  readonly id = AnalyticsScenarioId;
  readonly name = "Analytics Metrics Flow";
  readonly category = "analytics";

  async run(context: TestExecutionContext): Promise<void> {
    const { assertions } = context;
    const analyticsModule = context.resolveModule<AnalyticsModule>(BootstrapTokens.AnalyticsModule);

    const sales = await analyticsModule.getSalesMetrics();
    const orders = await analyticsModule.getOrderMetrics();
    const marketplace = await analyticsModule.getMarketplaceMetrics();

    assertions.assertSuccess(sales, "Sales metrics must be available");
    assertions.assertSuccess(orders, "Order metrics must be available");
    assertions.assertSuccess(marketplace, "Marketplace metrics must be available");
  }
}
