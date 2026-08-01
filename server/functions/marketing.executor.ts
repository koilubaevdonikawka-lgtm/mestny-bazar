import type { CouponDTO, CreateCouponRequest, UpdateCouponRequest } from "@shared/contracts/coupon";
import { requireAdminFromRequest } from "@server/auth/resolve-user";
import { getServices } from "@server/di/container";

const MODULE = "marketing";

export async function executeListCoupons(): Promise<CouponDTO[]> {
  const { userId, roles } = await requireAdminFromRequest();
  getServices().permissionPolicy.assert({ actor: { id: userId, roles }, module: MODULE });
  return getServices().couponService.listCoupons();
}

export async function executeCreateCoupon(data: CreateCouponRequest): Promise<CouponDTO> {
  const { userId, roles } = await requireAdminFromRequest();
  getServices().permissionPolicy.assert({ actor: { id: userId, roles }, module: MODULE });
  return getServices().couponService.createCoupon(data);
}

export async function executeUpdateCoupon(data: UpdateCouponRequest): Promise<CouponDTO> {
  const { userId, roles } = await requireAdminFromRequest();
  getServices().permissionPolicy.assert({ actor: { id: userId, roles }, module: MODULE });
  return getServices().couponService.updateCoupon(data);
}
