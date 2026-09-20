import { afterEach, describe, expect, it, vi } from "vitest";
import { ForbiddenError, UnauthorizedError } from "@server/domain/orders.errors";
import { RateLimitedError } from "@server/domain/rate-limit.errors";

const {
  requireAdminFromRequest,
  requireSellerFromRequest,
  requireModulePermission,
  assertMarketingAccess,
  getServices,
  enforceRateLimit,
} = vi.hoisted(() => ({
  requireAdminFromRequest: vi.fn(),
  requireSellerFromRequest: vi.fn(),
  requireModulePermission: vi.fn(),
  assertMarketingAccess: vi.fn(),
  getServices: vi.fn(),
  // Задача №288 — the edge rate limit is asserted in its own describe below; elsewhere it just passes.
  enforceRateLimit: vi.fn(async () => {}),
}));

vi.mock("@server/auth/resolve-user", () => ({ requireAdminFromRequest, requireSellerFromRequest }));
vi.mock("@server/auth/require-module-permission", () => ({ requireModulePermission }));
vi.mock("@server/auth/assert-marketing-access", () => ({ assertMarketingAccess }));
vi.mock("@server/di/container", () => ({ getServices }));
vi.mock("@server/functions/rate-limit.guard", () => ({ enforceRateLimit }));

const { executeUploadImage } = await import("@server/functions/media-upload.executor");

const fakeInput = {
  context: "category" as const,
  contentType: "image/png",
  size: 1024,
  data: {} as Blob,
};

describe("media-upload.executor", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("category context: requires admin only, no RBAC check", async () => {
    requireAdminFromRequest.mockResolvedValue({ userId: "admin-1", roles: ["admin"] });
    const uploadImage = vi.fn(async () => ({ url: "https://x/a.png" }));
    getServices.mockReturnValue({
      mediaUploadService: { uploadImage },
      permissionPolicy: { assert: vi.fn() },
    });

    await executeUploadImage(fakeInput);

    expect(requireAdminFromRequest).toHaveBeenCalled();
    expect(requireSellerFromRequest).not.toHaveBeenCalled();
    expect(requireModulePermission).not.toHaveBeenCalled();
    expect(uploadImage).toHaveBeenCalledWith(fakeInput);
  });

  it("banner context: requires admin + the real marketing-scope check (Задача №219 — moved off the old 'design' module)", async () => {
    requireAdminFromRequest.mockResolvedValue({ userId: "admin-1", roles: ["admin"] });
    const uploadImage = vi.fn(async () => ({ url: "https://x/b.png" }));
    getServices.mockReturnValue({ mediaUploadService: { uploadImage } });

    await executeUploadImage({ ...fakeInput, context: "banner" });

    expect(assertMarketingAccess).toHaveBeenCalledWith("admin-1", ["admin"]);
    expect(requireModulePermission).not.toHaveBeenCalled();
  });

  it("banner context: denies the upload when the marketing-scope check rejects", async () => {
    requireAdminFromRequest.mockResolvedValue({ userId: "admin-1", roles: ["admin"] });
    assertMarketingAccess.mockRejectedValueOnce(new Error("Access denied"));
    const uploadImage = vi.fn();
    getServices.mockReturnValue({ mediaUploadService: { uploadImage } });

    await expect(executeUploadImage({ ...fakeInput, context: "banner" })).rejects.toThrow(
      "Access denied",
    );
    expect(uploadImage).not.toHaveBeenCalled();
  });

  it("courier context: requires admin + requireModulePermission(couriers, edit)", async () => {
    requireAdminFromRequest.mockResolvedValue({ userId: "admin-1", roles: ["admin"] });
    const uploadImage = vi.fn(async () => ({ url: "https://x/c.png" }));
    getServices.mockReturnValue({
      mediaUploadService: { uploadImage },
      permissionPolicy: { assert: vi.fn() },
    });

    await executeUploadImage({ ...fakeInput, context: "courier" });

    expect(requireModulePermission).toHaveBeenCalledWith("admin-1", "couriers", "edit");
  });

  it("product context: admin alone is sufficient, no seller role needed", async () => {
    requireAdminFromRequest.mockResolvedValue({ userId: "admin-1", roles: ["admin"] });
    const uploadImage = vi.fn(async () => ({ url: "https://x/d.png" }));
    getServices.mockReturnValue({ mediaUploadService: { uploadImage } });

    await executeUploadImage({ ...fakeInput, context: "product" });

    expect(requireAdminFromRequest).toHaveBeenCalled();
    expect(requireSellerFromRequest).not.toHaveBeenCalled();
    expect(uploadImage).toHaveBeenCalledWith({ ...fakeInput, context: "product" });
  });

  it("product context: falls back to seller when the caller has no admin role", async () => {
    requireAdminFromRequest.mockRejectedValue(new ForbiddenError("Admin role required"));
    requireSellerFromRequest.mockResolvedValue({ userId: "seller-1", roles: ["seller"] });
    const uploadImage = vi.fn(async () => ({ url: "https://x/d.png" }));
    getServices.mockReturnValue({ mediaUploadService: { uploadImage } });

    await executeUploadImage({ ...fakeInput, context: "product" });

    expect(requireAdminFromRequest).toHaveBeenCalled();
    expect(requireSellerFromRequest).toHaveBeenCalled();
    expect(uploadImage).toHaveBeenCalledWith({ ...fakeInput, context: "product" });
  });

  it("product context: rejects a caller with neither admin nor seller", async () => {
    requireAdminFromRequest.mockRejectedValue(new ForbiddenError("Admin role required"));
    requireSellerFromRequest.mockRejectedValue(new ForbiddenError("Seller role required"));
    const uploadImage = vi.fn();
    getServices.mockReturnValue({ mediaUploadService: { uploadImage } });

    await expect(executeUploadImage({ ...fakeInput, context: "product" })).rejects.toBeInstanceOf(
      ForbiddenError,
    );
    expect(uploadImage).not.toHaveBeenCalled();
  });

  it("product context: an unauthenticated caller gets 401, never retried as a seller check", async () => {
    requireAdminFromRequest.mockRejectedValue(new UnauthorizedError());
    const uploadImage = vi.fn();
    getServices.mockReturnValue({ mediaUploadService: { uploadImage } });

    await expect(executeUploadImage({ ...fakeInput, context: "product" })).rejects.toBeInstanceOf(
      UnauthorizedError,
    );
    expect(requireSellerFromRequest).not.toHaveBeenCalled();
    expect(uploadImage).not.toHaveBeenCalled();
  });

  it("courier context: denies the upload when requireModulePermission rejects", async () => {
    requireAdminFromRequest.mockResolvedValue({ userId: "admin-1", roles: ["admin"] });
    requireModulePermission.mockRejectedValue(new Error("Permission denied"));
    const uploadImage = vi.fn();
    getServices.mockReturnValue({ mediaUploadService: { uploadImage } });

    await expect(executeUploadImage({ ...fakeInput, context: "courier" })).rejects.toThrow(
      "Permission denied",
    );
    expect(uploadImage).not.toHaveBeenCalled();
  });
  // Задача №288
  describe("edge rate limit", () => {
    it("counts the IP BEFORE auth, then the account (IP not recounted); AI cap only for a product upload that uses AI", async () => {
      const order: string[] = [];
      enforceRateLimit.mockImplementation(async (...args: unknown[]) => {
        const [policy, options] = args as [string, { countIp?: boolean } | undefined];
        order.push(`${policy}${options?.countIp === false ? ":user" : ":ip"}`);
      });
      requireAdminFromRequest.mockImplementation(async () => {
        order.push("auth");
        return { userId: "admin-1", roles: ["admin"] };
      });
      getServices.mockReturnValue({
        mediaUploadService: { uploadImage: vi.fn(async () => ({ url: "u" })) },
      });

      await executeUploadImage({ ...fakeInput, context: "product", skipAiProcessing: false });
      expect(order).toEqual([
        "MEDIA_UPLOAD:ip",
        "auth",
        "MEDIA_UPLOAD:user",
        "MEDIA_UPLOAD_AI:user",
      ]);

      order.length = 0;
      await executeUploadImage({ ...fakeInput, context: "product", skipAiProcessing: true });
      expect(order).toEqual(["MEDIA_UPLOAD:ip", "auth", "MEDIA_UPLOAD:user"]);
      expect(enforceRateLimit).toHaveBeenLastCalledWith("MEDIA_UPLOAD", {
        userId: "admin-1",
        countIp: false,
      });
    });

    it("a rejected IP counter stops the request before auth and before any upload", async () => {
      enforceRateLimit.mockRejectedValueOnce(new RateLimitedError());
      const uploadImage = vi.fn();
      getServices.mockReturnValue({ mediaUploadService: { uploadImage } });

      await expect(executeUploadImage(fakeInput)).rejects.toBeInstanceOf(RateLimitedError);
      expect(requireAdminFromRequest).not.toHaveBeenCalled();
      expect(uploadImage).not.toHaveBeenCalled();
    });
  });
});
