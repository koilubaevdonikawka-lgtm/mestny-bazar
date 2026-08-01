import type {
  CreateSupplierRequest,
  CreateSupplyRequest,
  SupplierDTO,
  SupplyDTO,
  UpdateSupplierRequest,
} from "@shared/contracts/supplier";
import { requireAdminFromRequest, requireWarehouseFromRequest } from "@server/auth/resolve-user";
import { getServices } from "@server/di/container";

// Supplier directory: Admin-only (suppliers.md — "Управление списком поставщиков ✅ Admin, — Warehouse").
export async function executeListSuppliers(): Promise<SupplierDTO[]> {
  await requireAdminFromRequest();
  return getServices().supplierService.listSuppliers();
}

export async function executeCreateSupplier(data: CreateSupplierRequest): Promise<SupplierDTO> {
  await requireAdminFromRequest();
  return getServices().supplierService.createSupplier(data);
}

export async function executeUpdateSupplier(data: UpdateSupplierRequest): Promise<SupplierDTO> {
  await requireAdminFromRequest();
  return getServices().supplierService.updateSupplier(data);
}

// Supply requests: Warehouse role, same convention as warehouse.executor.ts/
// warehouse-admin.executor.ts — Admin does not automatically inherit Warehouse-scoped
// access today (an existing, documented limitation from Этап 1/2, not new here).
export async function executeListSupplies(): Promise<SupplyDTO[]> {
  await requireWarehouseFromRequest();
  return getServices().supplyService.listSupplies();
}

export async function executeCreateSupply(data: CreateSupplyRequest): Promise<SupplyDTO> {
  await requireWarehouseFromRequest();
  return getServices().supplyService.createSupply(data);
}

export async function executeSendSupply(id: string): Promise<SupplyDTO> {
  await requireWarehouseFromRequest();
  return getServices().supplyService.sendSupply(id);
}

export async function executeConfirmSupply(id: string): Promise<SupplyDTO> {
  await requireWarehouseFromRequest();
  return getServices().supplyService.confirmSupply(id);
}

export async function executeReceiveSupply(id: string): Promise<SupplyDTO> {
  await requireWarehouseFromRequest();
  return getServices().supplyService.receiveSupply(id);
}

export async function executeCancelSupply(id: string): Promise<SupplyDTO> {
  await requireWarehouseFromRequest();
  return getServices().supplyService.cancelSupply(id);
}
