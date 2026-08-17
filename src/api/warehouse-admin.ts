import type {
  AdjustStockRequest,
  RecordStockReceiptRequest,
  RecordStockReturnRequest,
  SetStockThresholdRequest,
  StockItemDTO,
} from "@shared/contracts/stock";
import {
  adjustStockFn,
  listStockFn,
  recordStockReceiptFn,
  recordStockReturnFn,
  setStockThresholdFn,
} from "@/api/warehouse-admin.functions";

export async function listStock(): Promise<StockItemDTO[]> {
  return listStockFn();
}

export async function adjustStock(request: AdjustStockRequest): Promise<StockItemDTO> {
  return adjustStockFn({ data: request });
}

export async function setStockThreshold(request: SetStockThresholdRequest): Promise<StockItemDTO> {
  return setStockThresholdFn({ data: request });
}

export async function recordStockReceipt(
  request: RecordStockReceiptRequest,
): Promise<StockItemDTO> {
  return recordStockReceiptFn({ data: request });
}

export async function recordStockReturn(request: RecordStockReturnRequest): Promise<StockItemDTO> {
  return recordStockReturnFn({ data: request });
}
