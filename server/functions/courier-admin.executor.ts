import type { CourierAdminSummaryDTO } from "@shared/contracts/courier-status";
import type { OrderDTO } from "@shared/contracts/order";
import { requireAdminFromRequest } from "@server/auth/resolve-user";
import { getServices } from "@server/di/container";

export async function executeListCouriers(): Promise<CourierAdminSummaryDTO[]> {
  await requireAdminFromRequest();
  return getServices().courierAdminService.listCouriers();
}

/** Manual (re-)trigger — the primary path is automatic, via the buffer-cascade sweep; this covers "nobody was available at cascade time, retry now". */
export async function executeAssignCourier(orderId: string): Promise<OrderDTO | null> {
  await requireAdminFromRequest();
  const order = await getServices().adminOrderService.getOrder(orderId);
  return getServices().courierAssignmentService.assignCourier(order);
}
