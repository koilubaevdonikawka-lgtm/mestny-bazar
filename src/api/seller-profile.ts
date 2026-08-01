import type {
  SellerProfileDTO,
  UpsertSellerProfileRequest,
} from "@shared/contracts/seller-profile";
import {
  getMySellerProfileFn,
  getSellerProfileFn,
  listSellersFn,
  rejectSellerFn,
  upsertMySellerProfileFn,
  verifySellerFn,
} from "@/api/seller-profile.functions";

export async function listSellers(): Promise<SellerProfileDTO[]> {
  return listSellersFn();
}

export async function getSellerProfile(userId: string): Promise<SellerProfileDTO> {
  return getSellerProfileFn({ data: { userId } });
}

export async function getMySellerProfile(): Promise<SellerProfileDTO | null> {
  return getMySellerProfileFn();
}

export async function upsertMySellerProfile(
  request: UpsertSellerProfileRequest,
): Promise<SellerProfileDTO> {
  return upsertMySellerProfileFn({ data: request });
}

export async function verifySeller(userId: string): Promise<SellerProfileDTO> {
  return verifySellerFn({ data: { userId } });
}

export async function rejectSeller(userId: string): Promise<SellerProfileDTO> {
  return rejectSellerFn({ data: { userId } });
}
