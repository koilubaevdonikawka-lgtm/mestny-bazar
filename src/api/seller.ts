import type {
  CreateSellerProductRequest,
  SellerProductDTO,
  UpdateSellerProductRequest,
} from "@shared/contracts/seller-product";
import {
  createSellerProductFn,
  getSellerProductFn,
  hideSellerProductFn,
  listSellerProductsFn,
  publishSellerProductFn,
  updateSellerProductFn,
} from "@/api/seller.functions";

export async function listSellerProducts(): Promise<SellerProductDTO[]> {
  return listSellerProductsFn();
}

export async function getSellerProduct(id: string): Promise<SellerProductDTO> {
  return getSellerProductFn({ data: { id } });
}

export async function createSellerProduct(
  data: CreateSellerProductRequest,
): Promise<SellerProductDTO> {
  return createSellerProductFn({ data });
}

export async function updateSellerProduct(
  data: UpdateSellerProductRequest,
): Promise<SellerProductDTO> {
  return updateSellerProductFn({ data });
}

export async function publishSellerProduct(id: string): Promise<SellerProductDTO> {
  return publishSellerProductFn({ data: { id } });
}

export async function hideSellerProduct(id: string): Promise<SellerProductDTO> {
  return hideSellerProductFn({ data: { id } });
}
