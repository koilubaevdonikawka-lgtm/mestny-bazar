import { afterEach, describe, expect, it, vi } from "vitest";

const { requireAdminFromRequest, assertMarketingAccess, getServices } = vi.hoisted(() => ({
  requireAdminFromRequest: vi.fn(),
  assertMarketingAccess: vi.fn(),
  getServices: vi.fn(),
}));

vi.mock("@server/auth/resolve-user", () => ({ requireAdminFromRequest }));
vi.mock("@server/auth/assert-marketing-access", () => ({ assertMarketingAccess }));
vi.mock("@server/di/container", () => ({ getServices }));

const { executeCreateBanner, executeListBanners, executeUpdateBanner } = await import(
  "@server/functions/banner.executor"
);

describe("banner.executor", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("executeListBanners: requires admin, checks the real marketing scope (not the old 'design' module), then lists every banner", async () => {
    requireAdminFromRequest.mockResolvedValue({ userId: "admin-1", roles: ["admin"] });
    const listAllBanners = vi.fn(async () => []);
    getServices.mockReturnValue({ bannerService: { listAllBanners } });

    await executeListBanners();

    expect(assertMarketingAccess).toHaveBeenCalledWith("admin-1", ["admin"]);
    expect(listAllBanners).toHaveBeenCalled();
  });

  it("executeCreateBanner: denies before touching the service when the scope check rejects", async () => {
    requireAdminFromRequest.mockResolvedValue({ userId: "admin-2", roles: ["admin"] });
    assertMarketingAccess.mockRejectedValueOnce(new Error("Access denied"));
    const createBanner = vi.fn();
    getServices.mockReturnValue({ bannerService: { createBanner } });

    await expect(executeCreateBanner({ title: "Sale" })).rejects.toThrow("Access denied");
    expect(createBanner).not.toHaveBeenCalled();
  });

  it("executeUpdateBanner: checks scope then updates with every field (subtitle/sortOrder/startsAt/endsAt included)", async () => {
    requireAdminFromRequest.mockResolvedValue({ userId: "admin-1", roles: ["admin"] });
    const updateBanner = vi.fn(async (data) => data);
    getServices.mockReturnValue({ bannerService: { updateBanner } });
    const payload = {
      id: "banner-1",
      title: "Sale",
      subtitle: "This weekend only",
      sortOrder: 3,
      startsAt: "2026-09-01T00:00:00.000Z",
      endsAt: "2026-09-07T00:00:00.000Z",
    };

    await executeUpdateBanner(payload);

    expect(assertMarketingAccess).toHaveBeenCalledWith("admin-1", ["admin"]);
    expect(updateBanner).toHaveBeenCalledWith(payload);
  });
});
