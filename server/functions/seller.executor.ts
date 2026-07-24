import type {
  CreateSellerProductRequest,
  SellerProductDTO,
  UpdateSellerProductRequest,
} from "@shared/contracts/seller-product";
import { requireSellerFromRequest } from "@server/auth/resolve-user";
import { getServices } from "@server/di/container";
import {
  SellerProductNotFoundError,
  SellerProductValidationError,
} from "@server/domain/seller-product.errors";
import { ProductPublicationDeniedError } from "@server/domain/product-publication/product-publication.errors";
import { ForbiddenError, UnauthorizedError } from "@server/domain/orders.errors";

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
  const { userId } = await requireSellerFromRequest();
  return getServices().sellerProductService.publishProduct(userId, productId);
}

export async function executeHideSellerProduct(productId: string): Promise<SellerProductDTO> {
  const { userId } = await requireSellerFromRequest();
  return getServices().sellerProductService.hideProduct(userId, productId);
}

export function mapSellerError(error: unknown): never {
  if (error instanceof UnauthorizedError) throw error;
  if (error instanceof ForbiddenError) throw error;
  if (error instanceof SellerProductNotFoundError) throw error;
  if (error instanceof SellerProductValidationError) throw error;
  if (error instanceof ProductPublicationDeniedError) throw error;
  throw error;
}
