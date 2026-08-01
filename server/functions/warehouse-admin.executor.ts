import type {
  AdjustStockRequest,
  SetStockThresholdRequest,
  StockItemDTO,
} from "@shared/contracts/stock";
import { requireAdminFromRequest, requireWarehouseFromRequest } from "@server/auth/resolve-user";
import { getServices } from "@server/di/container";

// listStock/adjustStock: Warehouse role, same convention as warehouse.executor.ts
// (requireWarehouseFromRequest() only — Admin does not automatically inherit
// Warehouse-scoped access today; this mirrors the existing, already-shipped
// Warehouse module rather than introducing a new combined-role check).
export async function executeListStock(): Promise<StockItemDTO[]> {
  await requireWarehouseFromRequest();
  return getServices().stockAdminService.listStock();
}

export async function executeAdjustStock(data: AdjustStockRequest): Promise<StockItemDTO> {
  await requireWarehouseFromRequest();
  return getServices().stockAdminService.adjustStock(data);
}

// setStockThreshold: Admin only (warehouse.md — "Настройка порогов предупреждения").
export async function executeSetStockThreshold(
  data: SetStockThresholdRequest,
): Promise<StockItemDTO> {
  await requireAdminFromRequest();
  return getServices().stockAdminService.setThreshold(data);
}
