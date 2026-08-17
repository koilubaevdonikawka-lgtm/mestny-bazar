import { createServerFn } from "@tanstack/react-start";
import type { StockItemDTO } from "@shared/contracts/stock";
import {
  adjustStockRequestSchema,
  recordStockReceiptRequestSchema,
  recordStockReturnRequestSchema,
  setStockThresholdRequestSchema,
} from "@shared/validation/stock.schema";

export const listStockFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<StockItemDTO[]> => {
    const { executeListStock } = await import("@server/functions/warehouse-admin.executor");
    return executeListStock();
  },
);

export const adjustStockFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => adjustStockRequestSchema.parse(data))
  .handler(async ({ data }): Promise<StockItemDTO> => {
    const { executeAdjustStock } = await import("@server/functions/warehouse-admin.executor");
    return executeAdjustStock(data);
  });

export const setStockThresholdFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => setStockThresholdRequestSchema.parse(data))
  .handler(async ({ data }): Promise<StockItemDTO> => {
    const { executeSetStockThreshold } = await import("@server/functions/warehouse-admin.executor");
    return executeSetStockThreshold(data);
  });

export const recordStockReceiptFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => recordStockReceiptRequestSchema.parse(data))
  .handler(async ({ data }): Promise<StockItemDTO> => {
    const { executeRecordStockReceipt } =
      await import("@server/functions/warehouse-admin.executor");
    return executeRecordStockReceipt(data);
  });

export const recordStockReturnFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => recordStockReturnRequestSchema.parse(data))
  .handler(async ({ data }): Promise<StockItemDTO> => {
    const { executeRecordStockReturn } = await import("@server/functions/warehouse-admin.executor");
    return executeRecordStockReturn(data);
  });
