import type {
  BulkSetCourierProfileStatusRequest,
  CourierProfileDTO,
  CreateCourierProfileRequest,
  UpdateCourierProfileRequest,
} from "@shared/contracts/courier-profile";
import type { OrderListParams, OrderListResult } from "@shared/contracts/order";
import { requireAdminFromRequest } from "@server/auth/resolve-user";
import { requireModulePermission } from "@server/auth/require-module-permission";
import { getServices } from "@server/di/container";

export async function executeGetCourierProfile(userId: string): Promise<CourierProfileDTO> {
  const { userId: actorId } = await requireAdminFromRequest();
  await requireModulePermission(actorId, "couriers", "view");
  return getServices().courierProfileService.getProfile(userId);
}

export async function executeCreateCourier(
  data: CreateCourierProfileRequest,
): Promise<CourierProfileDTO> {
  const { userId: actorId } = await requireAdminFromRequest();
  await requireModulePermission(actorId, "couriers", "create");
  return getServices().courierProfileService.createCourier(data, actorId);
}

export async function executeUpdateCourierProfile(
  data: UpdateCourierProfileRequest,
): Promise<CourierProfileDTO> {
  const { userId: actorId } = await requireAdminFromRequest();
  await requireModulePermission(actorId, "couriers", "edit");
  return getServices().courierProfileService.updateProfile(data);
}

export async function executeBlockCourier(userId: string): Promise<CourierProfileDTO> {
  const { userId: actorId } = await requireAdminFromRequest();
  await requireModulePermission(actorId, "couriers", "edit");
  return getServices().courierProfileService.blockCourier(userId);
}

export async function executeUnblockCourier(userId: string): Promise<CourierProfileDTO> {
  const { userId: actorId } = await requireAdminFromRequest();
  await requireModulePermission(actorId, "couriers", "edit");
  return getServices().courierProfileService.unblockCourier(userId);
}

export async function executeBulkSetCourierStatus(
  data: BulkSetCourierProfileStatusRequest,
): Promise<void> {
  const { userId: actorId } = await requireAdminFromRequest();
  await requireModulePermission(actorId, "couriers", "edit");
  return getServices().courierProfileService.bulkSetStatus(data);
}

export async function executeListCourierOrderHistory(
  userId: string,
  params?: OrderListParams,
): Promise<OrderListResult> {
  const { userId: actorId } = await requireAdminFromRequest();
  await requireModulePermission(actorId, "couriers", "view");
  return getServices().adminOrderService.listOrdersByCourier(userId, params);
}
