import type { CouponDTO, CreateCouponRequest, UpdateCouponRequest } from "@shared/contracts/coupon";
import { createCouponFn, listCouponsFn, updateCouponFn } from "@/api/marketing.functions";

export async function listCoupons(): Promise<CouponDTO[]> {
  return listCouponsFn();
}

export async function createCoupon(request: CreateCouponRequest): Promise<CouponDTO> {
  return createCouponFn({ data: request });
}

export async function updateCoupon(request: UpdateCouponRequest): Promise<CouponDTO> {
  return updateCouponFn({ data: request });
}
