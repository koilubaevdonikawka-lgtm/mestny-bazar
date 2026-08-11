import type {
  CreateSellerProductRequest,
  SellerProductDTO,
  SellerProductListParams,
  SellerProductListResult,
  UpdateSellerProductRequest,
} from "@shared/contracts/seller-product";
import { requireAdminFromRequest } from "@server/auth/resolve-user";
import { getServices } from "@server/di/container";

/**
 * Промпт №103 — pure transport, zero business logic: every call delegates to
 * SellerProductService (the one product lifecycle), passing sellerId: null to
 * signal "admin acting with full authority," exactly like requireSellerFromRequest's
 * userId does for the seller-facing seller.executor.ts.
 */
export async function executeListAdminProducts(
  params: SellerProductListParams,
): Promise<SellerProductListResult> {
  await requireAdminFromRequest();
  return getServices().sellerProductService.listAllProducts(params);
}

export async function executeCreateAdminProduct(
  data: CreateSellerProductRequest,
): Promise<SellerProductDTO> {
  await requireAdminFromRequest();
  return getServices().sellerProductService.createProduct(null, data);
}

export async function executeUpdateAdminProduct(
  data: UpdateSellerProductRequest,
): Promise<SellerProductDTO> {
  await requireAdminFromRequest();
  return getServices().sellerProductService.updateProduct(null, data);
}
