import type {
  SellerProfileDTO,
  SellerVerificationStatus,
  UpsertSellerProfileRequest,
} from "@shared/contracts/seller-profile";

export interface ISellerProfileRepository {
  listAll(): Promise<SellerProfileDTO[]>;
  getByUserId(userId: string): Promise<SellerProfileDTO | null>;
  upsert(userId: string, data: UpsertSellerProfileRequest): Promise<SellerProfileDTO>;
  setVerificationStatus(
    userId: string,
    status: SellerVerificationStatus,
  ): Promise<SellerProfileDTO>;
}
