export const SellerVerificationStatus = {
  PENDING: "PENDING",
  VERIFIED: "VERIFIED",
  REJECTED: "REJECTED",
} as const;

export type SellerVerificationStatus =
  (typeof SellerVerificationStatus)[keyof typeof SellerVerificationStatus];

export interface SellerProfileDTO {
  userId: string;
  storeName: string;
  contactPhone: string | null;
  verificationStatus: SellerVerificationStatus;
  payoutDetails: string | null;
  createdAt: string;
}

/** Seller-facing self-service upsert — create-or-update their own store profile. */
export interface UpsertSellerProfileRequest {
  storeName: string;
  contactPhone?: string | null;
  payoutDetails?: string | null;
}
