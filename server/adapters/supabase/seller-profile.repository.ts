import type { ISellerProfileRepository } from "@server/ports/seller-profile.repository";
import type {
  SellerProfileDTO,
  SellerVerificationStatus,
  UpsertSellerProfileRequest,
} from "@shared/contracts/seller-profile";
import { supabaseAdmin } from "@server/adapters/supabase/client";

interface SellerProfileRow {
  user_id: string;
  store_name: string;
  contact_phone: string | null;
  verification_status: SellerVerificationStatus;
  payout_details: string | null;
  created_at: string;
}

export function mapSellerProfileRow(row: SellerProfileRow): SellerProfileDTO {
  return {
    userId: row.user_id,
    storeName: row.store_name,
    contactPhone: row.contact_phone,
    verificationStatus: row.verification_status,
    payoutDetails: row.payout_details,
    createdAt: row.created_at,
  };
}

const SELLER_PROFILE_SELECT =
  "user_id, store_name, contact_phone, verification_status, payout_details, created_at";

export class SupabaseSellerProfileRepository implements ISellerProfileRepository {
  async listAll(): Promise<SellerProfileDTO[]> {
    const { data, error } = await supabaseAdmin
      .from("seller_profiles")
      .select(SELLER_PROFILE_SELECT)
      .order("created_at", { ascending: false });

    if (error) throw new Error(`Failed to list seller profiles: ${error.message}`);
    return (data ?? []).map(mapSellerProfileRow);
  }

  async getByUserId(userId: string): Promise<SellerProfileDTO | null> {
    const { data, error } = await supabaseAdmin
      .from("seller_profiles")
      .select(SELLER_PROFILE_SELECT)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw new Error(`Failed to fetch seller profile: ${error.message}`);
    return data ? mapSellerProfileRow(data) : null;
  }

  async upsert(userId: string, data: UpsertSellerProfileRequest): Promise<SellerProfileDTO> {
    const { data: row, error } = await supabaseAdmin
      .from("seller_profiles")
      .upsert(
        {
          user_id: userId,
          store_name: data.storeName,
          contact_phone: data.contactPhone ?? null,
          payout_details: data.payoutDetails ?? null,
        },
        { onConflict: "user_id" },
      )
      .select(SELLER_PROFILE_SELECT)
      .single();

    if (error || !row) {
      throw new Error(`Failed to save seller profile: ${error?.message ?? "unknown"}`);
    }
    return mapSellerProfileRow(row);
  }

  async setVerificationStatus(
    userId: string,
    status: SellerVerificationStatus,
  ): Promise<SellerProfileDTO> {
    const { data: row, error } = await supabaseAdmin
      .from("seller_profiles")
      .update({ verification_status: status })
      .eq("user_id", userId)
      .select(SELLER_PROFILE_SELECT)
      .single();

    if (error || !row) {
      throw new Error(
        `Failed to update seller verification status: ${error?.message ?? "unknown"}`,
      );
    }
    return mapSellerProfileRow(row);
  }
}
