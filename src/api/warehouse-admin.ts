import type {
  AdjustStockRequest,
  SetStockThresholdRequest,
  StockItemDTO,
} from "@shared/contracts/stock";
import { adjustStockFn, listStockFn, setStockThresholdFn } from "@/api/warehouse-admin.functions";

export async function listStock(): Promise<StockItemDTO[]> {
  return listStockFn();
}

export async function adjustStock(request: AdjustStockRequest): Promise<StockItemDTO> {
  return adjustStockFn({ data: request });
}

export async function setStockThreshold(request: SetStockThresholdRequest): Promise<StockItemDTO> {
  return setStockThresholdFn({ data: request });
}
