import type {
  SellerProfileDTO,
  UpsertSellerProfileRequest,
} from "@shared/contracts/seller-profile";
import { requireAdminFromRequest, requireSellerFromRequest } from "@server/auth/resolve-user";
import { getServices } from "@server/di/container";
import { SellerProfileNotFoundError } from "@server/domain/seller-profile.errors";

export async function executeListSellers(): Promise<SellerProfileDTO[]> {
  await requireAdminFromRequest();
  return getServices().sellerProfileService.listSellers();
}

export async function executeGetSellerProfile(userId: string): Promise<SellerProfileDTO> {
  await requireAdminFromRequest();
  return getServices().sellerProfileService.getProfile(userId);
}

export async function executeGetMySellerProfile(): Promise<SellerProfileDTO | null> {
  const { userId } = await requireSellerFromRequest();
  try {
    return await getServices().sellerProfileService.getProfile(userId);
  } catch (error) {
    if (error instanceof SellerProfileNotFoundError) return null;
    throw error;
  }
}

export async function executeUpsertMySellerProfile(
  data: UpsertSellerProfileRequest,
): Promise<SellerProfileDTO> {
  const { userId } = await requireSellerFromRequest();
  return getServices().sellerProfileService.upsertOwnProfile(userId, data);
}

export async function executeVerifySeller(userId: string): Promise<SellerProfileDTO> {
  await requireAdminFromRequest();
  return getServices().sellerProfileService.verifySeller(userId);
}

export async function executeRejectSeller(userId: string): Promise<SellerProfileDTO> {
  await requireAdminFromRequest();
  return getServices().sellerProfileService.rejectSeller(userId);
}
