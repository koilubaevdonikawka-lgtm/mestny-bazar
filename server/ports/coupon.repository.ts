import type { CouponDTO, CreateCouponRequest, UpdateCouponRequest } from "@shared/contracts/coupon";

export interface ICouponRepository {
  listAll(): Promise<CouponDTO[]>;
  getById(id: string): Promise<CouponDTO | null>;
  getByCode(code: string): Promise<CouponDTO | null>;
  create(data: CreateCouponRequest): Promise<CouponDTO>;
  update(data: UpdateCouponRequest): Promise<CouponDTO>;
  /** Atomic — CheckoutService increments this at the moment a coupon is actually redeemed, not merely validated. */
  incrementUsesCount(id: string): Promise<void>;
}
