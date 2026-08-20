import { afterEach, describe, expect, it, vi } from "vitest";
import { ForbiddenError, UnauthorizedError } from "@server/domain/orders.errors";
import { SellerProductNotFoundError } from "@server/domain/seller-product.errors";

const { requireAdminFromRequest, requireSellerFromRequest, getServices } = vi.hoisted(() => ({
  requireAdminFromRequest: vi.fn(),
  requireSellerFromRequest: vi.fn(),
  getServices: vi.fn(),
}));

vi.mock("@server/auth/resolve-user", () => ({ requireAdminFromRequest, requireSellerFromRequest }));
vi.mock("@server/di/container", () => ({ getServices }));

const { executeHideSellerProduct, executePublishSellerProduct } =
  await import("@server/functions/seller.executor");

describe("seller.executor — executePublishSellerProduct / executeHideSellerProduct", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("admin (no seller role) publishes via the unscoped admin update path", async () => {
    requireAdminFromRequest.mockResolvedValue({ userId: "admin-1", roles: ["admin"] });
    const publishProduct = vi.fn();
    const updateProduct = vi.fn(async () => ({ id: "product-1", publicationStatus: "PUBLISHED" }));
    getServices.mockReturnValue({ sellerProductService: { publishProduct, updateProduct } });

    await executePublishSellerProduct("product-1");

    expect(requireAdminFromRequest).toHaveBeenCalled();
    expect(requireSellerFromRequest).not.toHaveBeenCalled();
    expect(updateProduct).toHaveBeenCalledWith(null, {
      id: "product-1",
      publicationStatus: "PUBLISHED",
    });
    expect(publishProduct).not.toHaveBeenCalled();
  });

  it("admin (no seller role) hides via the unscoped admin update path", async () => {
    requireAdminFromRequest.mockResolvedValue({ userId: "admin-1", roles: ["admin"] });
    const hideProduct = vi.fn();
    const updateProduct = vi.fn(async () => ({ id: "product-1", publicationStatus: "HIDDEN" }));
    getServices.mockReturnValue({ sellerProductService: { hideProduct, updateProduct } });

    await executeHideSellerProduct("product-1");

    expect(requireAdminFromRequest).toHaveBeenCalled();
    expect(requireSellerFromRequest).not.toHaveBeenCalled();
    expect(updateProduct).toHaveBeenCalledWith(null, {
      id: "product-1",
      publicationStatus: "HIDDEN",
    });
    expect(hideProduct).not.toHaveBeenCalled();
  });

  it("seller (no admin role) still publishes their own product via the existing scoped path", async () => {
    requireAdminFromRequest.mockRejectedValue(new ForbiddenError("Admin role required"));
    requireSellerFromRequest.mockResolvedValue({ userId: "seller-1", roles: ["seller"] });
    const publishProduct = vi.fn(async () => ({ id: "product-1", publicationStatus: "PUBLISHED" }));
    const updateProduct = vi.fn();
    getServices.mockReturnValue({ sellerProductService: { publishProduct, updateProduct } });

    await executePublishSellerProduct("product-1");

    expect(publishProduct).toHaveBeenCalledWith("seller-1", "product-1");
    expect(updateProduct).not.toHaveBeenCalled();
  });

  it("seller (no admin role) still hides their own product via the existing scoped path", async () => {
    requireAdminFromRequest.mockRejectedValue(new ForbiddenError("Admin role required"));
    requireSellerFromRequest.mockResolvedValue({ userId: "seller-1", roles: ["seller"] });
    const hideProduct = vi.fn(async () => ({ id: "product-1", publicationStatus: "HIDDEN" }));
    const updateProduct = vi.fn();
    getServices.mockReturnValue({ sellerProductService: { hideProduct, updateProduct } });

    await executeHideSellerProduct("product-1");

    expect(hideProduct).toHaveBeenCalledWith("seller-1", "product-1");
    expect(updateProduct).not.toHaveBeenCalled();
  });

  it("a seller cannot publish another seller's product — the existing ownership scoping is untouched", async () => {
    requireAdminFromRequest.mockRejectedValue(new ForbiddenError("Admin role required"));
    requireSellerFromRequest.mockResolvedValue({ userId: "seller-1", roles: ["seller"] });
    const publishProduct = vi.fn(async () => {
      throw new SellerProductNotFoundError();
    });
    getServices.mockReturnValue({ sellerProductService: { publishProduct } });

    await expect(executePublishSellerProduct("someone-elses-product")).rejects.toBeInstanceOf(
      SellerProductNotFoundError,
    );
    expect(publishProduct).toHaveBeenCalledWith("seller-1", "someone-elses-product");
  });

  it("a caller with neither admin nor seller role is rejected", async () => {
    requireAdminFromRequest.mockRejectedValue(new ForbiddenError("Admin role required"));
    requireSellerFromRequest.mockRejectedValue(new ForbiddenError("Seller role required"));
    const publishProduct = vi.fn();
    const updateProduct = vi.fn();
    getServices.mockReturnValue({ sellerProductService: { publishProduct, updateProduct } });

    await expect(executePublishSellerProduct("product-1")).rejects.toBeInstanceOf(ForbiddenError);
    expect(publishProduct).not.toHaveBeenCalled();
    expect(updateProduct).not.toHaveBeenCalled();
  });

  it("an unauthenticated caller gets 401, never retried as a seller check", async () => {
    requireAdminFromRequest.mockRejectedValue(new UnauthorizedError());
    const publishProduct = vi.fn();
    const updateProduct = vi.fn();
    getServices.mockReturnValue({ sellerProductService: { publishProduct, updateProduct } });

    await expect(executePublishSellerProduct("product-1")).rejects.toBeInstanceOf(
      UnauthorizedError,
    );
    expect(requireSellerFromRequest).not.toHaveBeenCalled();
    expect(publishProduct).not.toHaveBeenCalled();
  });
});
