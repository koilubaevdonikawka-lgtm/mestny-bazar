import { createServerFn } from "@tanstack/react-start";
import type { FinanceOverviewDTO, SellerPayoutDTO } from "@shared/contracts/payout";
import { createPayoutRunRequestSchema, payoutIdSchema } from "@shared/validation/payout.schema";

export const getFinanceOverviewFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<FinanceOverviewDTO> => {
    const { executeGetFinanceOverview } = await import("@server/functions/finance.executor");
    return executeGetFinanceOverview();
  },
);

export const listPayoutsFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<SellerPayoutDTO[]> => {
    const { executeListPayouts } = await import("@server/functions/finance.executor");
    return executeListPayouts();
  },
);

export const listMyPayoutsFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<SellerPayoutDTO[]> => {
    const { executeListMyPayouts } = await import("@server/functions/finance.executor");
    return executeListMyPayouts();
  },
);

export const createPayoutRunFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => createPayoutRunRequestSchema.parse(data))
  .handler(async ({ data }): Promise<SellerPayoutDTO> => {
    const { executeCreatePayoutRun } = await import("@server/functions/finance.executor");
    return executeCreatePayoutRun(data);
  });

export const completePayoutFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => payoutIdSchema.parse(data))
  .handler(async ({ data }): Promise<SellerPayoutDTO> => {
    const { executeCompletePayout } = await import("@server/functions/finance.executor");
    return executeCompletePayout(data.id);
  });
