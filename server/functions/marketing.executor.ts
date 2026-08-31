import type { CouponDTO, CreateCouponRequest, UpdateCouponRequest } from "@shared/contracts/coupon";
import { requireAdminFromRequest } from "@server/auth/resolve-user";
import { assertMarketingAccess } from "@server/auth/assert-marketing-access";
import { getServices } from "@server/di/container";

export async function executeListCoupons(): Promise<CouponDTO[]> {
  const { userId, roles } = await requireAdminFromRequest();
  await assertMarketingAccess(userId, roles);
  return getServices().couponService.listCoupons();
}

export async function executeCreateCoupon(data: CreateCouponRequest): Promise<CouponDTO> {
  const { userId, roles } = await requireAdminFromRequest();
  await assertMarketingAccess(userId, roles);
  return getServices().couponService.createCoupon(data);
}

export async function executeUpdateCoupon(data: UpdateCouponRequest): Promise<CouponDTO> {
  const { userId, roles } = await requireAdminFromRequest();
  await assertMarketingAccess(userId, roles);
  return getServices().couponService.updateCoupon(data);
}
