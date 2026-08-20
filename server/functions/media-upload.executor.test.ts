import { afterEach, describe, expect, it, vi } from "vitest";
import { ForbiddenError, UnauthorizedError } from "@server/domain/orders.errors";

const { requireAdminFromRequest, requireSellerFromRequest, requireModulePermission, getServices } =
  vi.hoisted(() => ({
    requireAdminFromRequest: vi.fn(),
    requireSellerFromRequest: vi.fn(),
    requireModulePermission: vi.fn(),
    getServices: vi.fn(),
  }));

vi.mock("@server/auth/resolve-user", () => ({ requireAdminFromRequest, requireSellerFromRequest }));
vi.mock("@server/auth/require-module-permission", () => ({ requireModulePermission }));
vi.mock("@server/di/container", () => ({ getServices }));

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

  it("banner context: requires admin + existing permissionPolicy design-module assert", async () => {
    requireAdminFromRequest.mockResolvedValue({ userId: "admin-1", roles: ["admin"] });
    const assert = vi.fn();
    const uploadImage = vi.fn(async () => ({ url: "https://x/b.png" }));
    getServices.mockReturnValue({
      mediaUploadService: { uploadImage },
      permissionPolicy: { assert },
    });

    await executeUploadImage({ ...fakeInput, context: "banner" });

    expect(assert).toHaveBeenCalledWith(
      expect.objectContaining({ module: "design", actor: { id: "admin-1", roles: ["admin"] } }),
    );
    expect(requireModulePermission).not.toHaveBeenCalled();
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
});
