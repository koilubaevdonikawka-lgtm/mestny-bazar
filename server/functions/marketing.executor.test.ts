import { afterEach, describe, expect, it, vi } from "vitest";

const { requireAdminFromRequest, assertMarketingAccess, getServices } = vi.hoisted(() => ({
  requireAdminFromRequest: vi.fn(),
  assertMarketingAccess: vi.fn(),
  getServices: vi.fn(),
}));

vi.mock("@server/auth/resolve-user", () => ({ requireAdminFromRequest }));
vi.mock("@server/auth/assert-marketing-access", () => ({ assertMarketingAccess }));
vi.mock("@server/di/container", () => ({ getServices }));

const { executeCreateCoupon, executeListCoupons, executeUpdateCoupon } =
  await import("@server/functions/marketing.executor");

describe("marketing.executor (coupons)", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("executeListCoupons: requires admin, checks the real marketing scope, then lists", async () => {
    requireAdminFromRequest.mockResolvedValue({ userId: "admin-1", roles: ["admin"] });
    const listCoupons = vi.fn(async () => []);
    getServices.mockReturnValue({ couponService: { listCoupons } });

    await executeListCoupons();

    expect(assertMarketingAccess).toHaveBeenCalledWith("admin-1", ["admin"]);
    expect(listCoupons).toHaveBeenCalled();
  });

  it("executeCreateCoupon: denies before touching the service when the scope check rejects", async () => {
    requireAdminFromRequest.mockResolvedValue({ userId: "admin-2", roles: ["admin"] });
    assertMarketingAccess.mockRejectedValueOnce(new Error("Access denied"));
    const createCoupon = vi.fn();
    getServices.mockReturnValue({ couponService: { createCoupon } });

    await expect(
      executeCreateCoupon({ code: "X", discountType: "PERCENTAGE", discountValue: 10 }),
    ).rejects.toThrow("Access denied");
    expect(createCoupon).not.toHaveBeenCalled();
  });

  it("executeUpdateCoupon: checks scope then updates", async () => {
    requireAdminFromRequest.mockResolvedValue({ userId: "admin-1", roles: ["admin"] });
    const updateCoupon = vi.fn(async (data) => data);
    getServices.mockReturnValue({ couponService: { updateCoupon } });

    await executeUpdateCoupon({ id: "coupon-1", isActive: false });

    expect(assertMarketingAccess).toHaveBeenCalledWith("admin-1", ["admin"]);
    expect(updateCoupon).toHaveBeenCalledWith({ id: "coupon-1", isActive: false });
  });
});
