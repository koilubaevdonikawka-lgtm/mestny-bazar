import type {
  CreateSellerProductRequest,
  SellerProductDTO,
  UpdateSellerProductRequest,
} from "@shared/contracts/seller-product";
import { ProductPublicationStatus } from "@shared/contracts/seller-product";
import { requireAdminFromRequest, requireSellerFromRequest } from "@server/auth/resolve-user";
import { getServices } from "@server/di/container";
import { ForbiddenError } from "@server/domain/orders.errors";

/**
 * Admin OR seller (Промпт №106 — same pattern as media-upload.executor.ts's
 * PRODUCT context, Промпт №105): while the marketplace is run by a single
 * seller who is also the admin, publish/hide shouldn't require a separate
 * seller role. Returns `null` for admin — the existing "admin acting with
 * full authority" signal already used throughout product-admin.executor.ts/
 * SellerProductService (sellerId === null) — rather than the seller's own
 * userId, since publishProduct/hideProduct are hard-scoped by sellerId (both
 * the ownership read and the status write filter by it) and a product this
 * admin didn't personally create as a seller has no sellerId that would
 * match. Callers must branch on the null case and route through
 * SellerProductService.updateProduct(null, ...) instead — the same
 * already-existing, unscoped admin path product-admin.executor.ts uses.
 */
async function resolveSellerIdOrAdmin(): Promise<string | null> {
  try {
    await requireAdminFromRequest();
    return null;
  } catch (error) {
    if (!(error instanceof ForbiddenError)) throw error;
    const { userId } = await requireSellerFromRequest();
    return userId;
  }
}

export async function executeListSellerProducts(): Promise<SellerProductDTO[]> {
  const { userId } = await requireSellerFromRequest();
  return getServices().sellerProductService.listProducts(userId);
}

export async function executeGetSellerProduct(productId: string): Promise<SellerProductDTO> {
  const { userId } = await requireSellerFromRequest();
  return getServices().sellerProductService.getProduct(productId, userId);
}

export async function executeCreateSellerProduct(
  data: CreateSellerProductRequest,
): Promise<SellerProductDTO> {
  const { userId } = await requireSellerFromRequest();
  return getServices().sellerProductService.createProduct(userId, data);
}

export async function executeUpdateSellerProduct(
  data: UpdateSellerProductRequest,
): Promise<SellerProductDTO> {
  const { userId } = await requireSellerFromRequest();
  return getServices().sellerProductService.updateProduct(userId, data);
}

export async function executePublishSellerProduct(productId: string): Promise<SellerProductDTO> {
  const sellerId = await resolveSellerIdOrAdmin();
  if (sellerId === null) {
    return getServices().sellerProductService.updateProduct(null, {
      id: productId,
      publicationStatus: ProductPublicationStatus.PUBLISHED,
    });
  }
  return getServices().sellerProductService.publishProduct(sellerId, productId);
}

export async function executeHideSellerProduct(productId: string): Promise<SellerProductDTO> {
  const sellerId = await resolveSellerIdOrAdmin();
  if (sellerId === null) {
    return getServices().sellerProductService.updateProduct(null, {
      id: productId,
      publicationStatus: ProductPublicationStatus.HIDDEN,
    });
  }
  return getServices().sellerProductService.hideProduct(sellerId, productId);
}
