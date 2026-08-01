import type {
  CreateSupplierRequest,
  CreateSupplyRequest,
  SupplierDTO,
  SupplyDTO,
  UpdateSupplierRequest,
} from "@shared/contracts/supplier";
import {
  cancelSupplyFn,
  confirmSupplyFn,
  createSupplierFn,
  createSupplyFn,
  listSuppliersFn,
  listSuppliesFn,
  receiveSupplyFn,
  sendSupplyFn,
  updateSupplierFn,
} from "@/api/supplier.functions";

export async function listSuppliers(): Promise<SupplierDTO[]> {
  return listSuppliersFn();
}

export async function createSupplier(request: CreateSupplierRequest): Promise<SupplierDTO> {
  return createSupplierFn({ data: request });
}

export async function updateSupplier(request: UpdateSupplierRequest): Promise<SupplierDTO> {
  return updateSupplierFn({ data: request });
}

export async function listSupplies(): Promise<SupplyDTO[]> {
  return listSuppliesFn();
}

export async function createSupply(request: CreateSupplyRequest): Promise<SupplyDTO> {
  return createSupplyFn({ data: request });
}

export async function sendSupply(id: string): Promise<SupplyDTO> {
  return sendSupplyFn({ data: { id } });
}

export async function confirmSupply(id: string): Promise<SupplyDTO> {
  return confirmSupplyFn({ data: { id } });
}

export async function receiveSupply(id: string): Promise<SupplyDTO> {
  return receiveSupplyFn({ data: { id } });
}

export async function cancelSupply(id: string): Promise<SupplyDTO> {
  return cancelSupplyFn({ data: { id } });
}
