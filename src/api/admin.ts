import type { OrderDTO } from "@shared/contracts/order";
import {
  cancelAdminOrderFn,
  confirmAdminOrderFn,
  getAdminOrderFn,
  listAdminOrdersFn,
} from "@/api/admin.functions";

export async function listAdminOrders(): Promise<OrderDTO[]> {
  return listAdminOrdersFn();
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
