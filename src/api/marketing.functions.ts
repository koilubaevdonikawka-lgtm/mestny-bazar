import { createServerFn } from "@tanstack/react-start";
import type { CouponDTO } from "@shared/contracts/coupon";
import {
  createCouponRequestSchema,
  updateCouponRequestSchema,
} from "@shared/validation/coupon.schema";

export const listCouponsFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<CouponDTO[]> => {
    const { executeListCoupons } = await import("@server/functions/marketing.executor");
    return executeListCoupons();
  },
);

export const createCouponFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => createCouponRequestSchema.parse(data))
  .handler(async ({ data }): Promise<CouponDTO> => {
    const { executeCreateCoupon } = await import("@server/functions/marketing.executor");
    return executeCreateCoupon(data);
  });

export const updateCouponFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => updateCouponRequestSchema.parse(data))
  .handler(async ({ data }): Promise<CouponDTO> => {
    const { executeUpdateCoupon } = await import("@server/functions/marketing.executor");
    return executeUpdateCoupon(data);
  });
