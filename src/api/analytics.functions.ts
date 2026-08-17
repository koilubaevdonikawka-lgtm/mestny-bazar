import { createServerFn } from "@tanstack/react-start";
import type { SalesAnalyticsDTO } from "@shared/contracts/analytics";
import { salesAnalyticsParamsSchema } from "@shared/validation/analytics.schema";

export const getSalesAnalyticsFn = createServerFn({ method: "GET" })
  .validator((data: unknown) => salesAnalyticsParamsSchema.parse(data))
  .handler(async ({ data }): Promise<SalesAnalyticsDTO> => {
    const { executeGetSalesAnalytics } = await import("@server/functions/analytics.executor");
    return executeGetSalesAnalytics(data);
  });
