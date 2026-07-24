import type { OrderDTO } from "@shared/contracts/order";
import {
  completeWarehouseAssemblyFn,
  getWarehouseOrderFn,
  listWarehouseOrdersFn,
  startWarehouseAssemblyFn,
} from "@/api/warehouse.functions";

export async function listWarehouseOrders(): Promise<OrderDTO[]> {
  return listWarehouseOrdersFn();
}

export async function getWarehouseOrder(id: string): Promise<OrderDTO> {
  return getWarehouseOrderFn({ data: { id } });
}

export async function startWarehouseAssembly(id: string): Promise<OrderDTO> {
  return startWarehouseAssemblyFn({ data: { id } });
}

export async function completeWarehouseAssembly(id: string): Promise<OrderDTO> {
  return completeWarehouseAssemblyFn({ data: { id } });
}
