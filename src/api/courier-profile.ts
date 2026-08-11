import type {
  BulkSetCourierProfileStatusRequest,
  CourierProfileDTO,
  CreateCourierProfileRequest,
  UpdateCourierProfileRequest,
} from "@shared/contracts/courier-profile";
import type { OrderListResult } from "@shared/contracts/order";
import {
  blockCourierFn,
  bulkSetCourierStatusFn,
  createCourierFn,
  getCourierProfileFn,
  listCourierOrderHistoryFn,
  unblockCourierFn,
  updateCourierProfileFn,
} from "@/api/courier-profile.functions";

export async function getCourierProfile(userId: string): Promise<CourierProfileDTO> {
  return getCourierProfileFn({ data: { userId } });
}

export async function createCourier(
  request: CreateCourierProfileRequest,
): Promise<CourierProfileDTO> {
  return createCourierFn({ data: request });
}

export async function updateCourierProfile(
  request: UpdateCourierProfileRequest,
): Promise<CourierProfileDTO> {
  return updateCourierProfileFn({ data: request });
}

export async function blockCourier(userId: string): Promise<CourierProfileDTO> {
  return blockCourierFn({ data: { userId } });
}

export async function unblockCourier(userId: string): Promise<CourierProfileDTO> {
  return unblockCourierFn({ data: { userId } });
}

export async function bulkSetCourierStatus(
  request: BulkSetCourierProfileStatusRequest,
): Promise<void> {
  return bulkSetCourierStatusFn({ data: request });
}

export async function listCourierOrderHistory(
  userId: string,
  page?: number,
  pageSize?: number,
): Promise<OrderListResult> {
  return listCourierOrderHistoryFn({ data: { userId, page, pageSize } });
}
