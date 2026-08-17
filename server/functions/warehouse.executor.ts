import type { OrderDTO } from "@shared/contracts/order";
import { requireWarehouseFromRequest } from "@server/auth/resolve-user";
import { getServices } from "@server/di/container";

export async function executeListWarehouseOrders(): Promise<OrderDTO[]> {
  await requireWarehouseFromRequest();
  return getServices().warehouseOrderService.listAssemblyOrders();
}

export async function executeGetWarehouseOrder(orderId: string): Promise<OrderDTO> {
  await requireWarehouseFromRequest();
  return getServices().warehouseOrderService.getOrder(orderId);
}

export async function executeStartWarehouseAssembly(orderId: string): Promise<OrderDTO> {
  const { userId, roles } = await requireWarehouseFromRequest();
  return getServices().warehouseOrderService.startAssembly(orderId, { id: userId, roles });
}

export async function executeCompleteWarehouseAssembly(orderId: string): Promise<OrderDTO> {
  const { userId, roles } = await requireWarehouseFromRequest();
  return getServices().warehouseOrderService.completeAssembly(orderId, { id: userId, roles });
}
