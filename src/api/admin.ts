import type { OrderDTO, OrderListParams, OrderListResult } from "@shared/contracts/order";
import {
  cancelAdminOrderFn,
  confirmAdminOrderFn,
  getAdminOrderFn,
  listAdminOrdersFn,
} from "@/api/admin.functions";

export async function listAdminOrders(params?: OrderListParams): Promise<OrderListResult> {
  return listAdminOrdersFn({ data: params });
}

export async function getAdminOrder(id: string): Promise<OrderDTO> {
  return getAdminOrderFn({ data: { id } });
}

export async function confirmAdminOrder(id: string): Promise<OrderDTO> {
  return confirmAdminOrderFn({ data: { id } });
}

export async function cancelAdminOrder(id: string): Promise<OrderDTO> {
  return cancelAdminOrderFn({ data: { id } });
}
