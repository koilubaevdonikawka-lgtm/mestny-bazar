export const CouponDiscountType = {
  PERCENTAGE: "PERCENTAGE",
  FIXED: "FIXED",
} as const;

export type CouponDiscountType = (typeof CouponDiscountType)[keyof typeof CouponDiscountType];

export interface CouponDTO {
  id: string;
  code: string;
  discountType: CouponDiscountType;
  discountValue: number;
  minOrderTotal: number;
  maxUses: number | null;
  usesCount: number;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface CreateCouponRequest {
  code: string;
  discountType: CouponDiscountType;
  discountValue: number;
  minOrderTotal?: number;
  maxUses?: number | null;
  expiresAt?: string | null;
  isActive?: boolean;
}

export interface UpdateCouponRequest {
  id: string;
  discountType?: CouponDiscountType;
  discountValue?: number;
  minOrderTotal?: number;
  maxUses?: number | null;
  expiresAt?: string | null;
  isActive?: boolean;
}

/** Server-computed result of applying a coupon at checkout — never trusted from the client (CD-01). */
export interface CouponApplicationResult {
  coupon: CouponDTO;
  discountAmount: number;
}
