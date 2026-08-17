import type { CourierListItemDTO } from "@shared/contracts/courier-profile";
import type { OrderDTO } from "@shared/contracts/order";
import { requireAdminFromRequest } from "@server/auth/resolve-user";
import { requireModulePermission } from "@server/auth/require-module-permission";
import { getServices } from "@server/di/container";

export async function executeListCouriers(): Promise<CourierListItemDTO[]> {
  const { userId } = await requireAdminFromRequest();
  await requireModulePermission(userId, "couriers", "view");
  return getServices().courierAdminService.listCouriers();
}

/** Manual (re-)trigger — the primary path is automatic, via the buffer-cascade sweep; this covers "nobody was available at cascade time, retry now". */
export async function executeAssignCourier(orderId: string): Promise<OrderDTO | null> {
  const { userId } = await requireAdminFromRequest();
  await requireModulePermission(userId, "couriers", "edit");
  const order = await getServices().adminOrderService.getOrder(orderId);
  return getServices().courierAssignmentService.assignCourier(order);
}
