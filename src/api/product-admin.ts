import type {
  CreateSellerProductRequest,
  SellerProductDTO,
  SellerProductListParams,
  SellerProductListResult,
  UpdateSellerProductRequest,
} from "@shared/contracts/seller-product";
import {
  createAdminProductFn,
  listAdminProductsFn,
  updateAdminProductFn,
} from "@/api/product-admin.functions";

export async function listAdminProducts(
  params: SellerProductListParams = {},
): Promise<SellerProductListResult> {
  return listAdminProductsFn({ data: params });
}

export async function createAdminProduct(
  request: CreateSellerProductRequest & { categoryId: string },
): Promise<SellerProductDTO> {
  return createAdminProductFn({ data: request });
}

export async function updateAdminProduct(
  request: UpdateSellerProductRequest,
): Promise<SellerProductDTO> {
  return updateAdminProductFn({ data: request });
}
