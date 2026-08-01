import type { CourierAdminSummaryDTO } from "@shared/contracts/courier-status";
import type { OrderDTO } from "@shared/contracts/order";
import { assignCourierFn, listCouriersFn } from "@/api/courier-admin.functions";

export async function listCouriers(): Promise<CourierAdminSummaryDTO[]> {
  return listCouriersFn();
}

export async function assignCourier(orderId: string): Promise<OrderDTO | null> {
  return assignCourierFn({ data: { id: orderId } });
}
