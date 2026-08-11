import type {
  CreateCourierProfileInput,
  ICourierProfileRepository,
} from "@server/ports/courier-profile.repository";
import type {
  CourierProfileDTO,
  CourierProfileStatus,
  CourierVehicleType,
  UpdateCourierProfileRequest,
} from "@shared/contracts/courier-profile";
import { supabaseAdmin } from "@server/adapters/supabase/client";

interface CourierProfileRow {
  user_id: string;
  last_name: string;
  first_name: string;
  middle_name: string | null;
  phone: string;
  vehicle_type: CourierVehicleType;
  plate_number: string | null;
  service_zone_id: string | null;
  status: CourierProfileStatus;
  hired_at: string | null;
  admin_comment: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export function mapCourierProfileRow(row: CourierProfileRow): CourierProfileDTO {
  return {
    userId: row.user_id,
    lastName: row.last_name,
    firstName: row.first_name,
    middleName: row.middle_name,
    phone: row.phone,
    vehicleType: row.vehicle_type,
    plateNumber: row.plate_number,
    serviceZoneId: row.service_zone_id,
    status: row.status,
    hiredAt: row.hired_at,
    adminComment: row.admin_comment,
    photoUrl: row.photo_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const COURIER_PROFILE_SELECT =
  "user_id, last_name, first_name, middle_name, phone, vehicle_type, plate_number, " +
  "service_zone_id, status, hired_at, admin_comment, photo_url, created_at, updated_at";

interface CourierProfilePatch {
  last_name?: string;
  first_name?: string;
  middle_name?: string | null;
  phone?: string;
  vehicle_type?: CourierVehicleType;
  plate_number?: string | null;
  service_zone_id?: string | null;
  hired_at?: string | null;
  admin_comment?: string | null;
  photo_url?: string | null;
}

export class SupabaseCourierProfileRepository implements ICourierProfileRepository {
  async list(): Promise<CourierProfileDTO[]> {
    const { data, error } = await supabaseAdmin
      .from("courier_profiles")
      .select(COURIER_PROFILE_SELECT)
      .order("created_at", { ascending: false });

    if (error) throw new Error(`Failed to list courier profiles: ${error.message}`);
    return ((data ?? []) as unknown as CourierProfileRow[]).map(mapCourierProfileRow);
  }

  async getByUserId(userId: string): Promise<CourierProfileDTO | null> {
    const { data, error } = await supabaseAdmin
      .from("courier_profiles")
      .select(COURIER_PROFILE_SELECT)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw new Error(`Failed to fetch courier profile: ${error.message}`);
    return data ? mapCourierProfileRow(data as unknown as CourierProfileRow) : null;
  }

  async create(input: CreateCourierProfileInput): Promise<CourierProfileDTO> {
    const { data, error } = await supabaseAdmin
      .from("courier_profiles")
      .insert({
        user_id: input.userId,
        last_name: input.lastName,
        first_name: input.firstName,
        middle_name: input.middleName ?? null,
        phone: input.phone,
        vehicle_type: input.vehicleType,
        plate_number: input.plateNumber ?? null,
        service_zone_id: input.serviceZoneId ?? null,
        hired_at: input.hiredAt ?? null,
        admin_comment: input.adminComment ?? null,
        photo_url: input.photoUrl ?? null,
        created_by: input.createdBy,
      })
      .select(COURIER_PROFILE_SELECT)
      .single();

    if (error || !data) {
      throw new Error(`Failed to create courier profile: ${error?.message ?? "unknown"}`);
    }
    return mapCourierProfileRow(data as unknown as CourierProfileRow);
  }

  async update(input: UpdateCourierProfileRequest): Promise<CourierProfileDTO> {
    const patch: CourierProfilePatch = {};
    if (input.lastName !== undefined) patch.last_name = input.lastName;
    if (input.firstName !== undefined) patch.first_name = input.firstName;
    if (input.middleName !== undefined) patch.middle_name = input.middleName;
    if (input.phone !== undefined) patch.phone = input.phone;
    if (input.vehicleType !== undefined) patch.vehicle_type = input.vehicleType;
    if (input.plateNumber !== undefined) patch.plate_number = input.plateNumber;
    if (input.serviceZoneId !== undefined) patch.service_zone_id = input.serviceZoneId;
    if (input.hiredAt !== undefined) patch.hired_at = input.hiredAt;
    if (input.adminComment !== undefined) patch.admin_comment = input.adminComment;
    if (input.photoUrl !== undefined) patch.photo_url = input.photoUrl;

    const { data, error } = await supabaseAdmin
      .from("courier_profiles")
      .update(patch)
      .eq("user_id", input.userId)
      .select(COURIER_PROFILE_SELECT)
      .single();

    if (error || !data) {
      throw new Error(`Failed to update courier profile: ${error?.message ?? "unknown"}`);
    }
    return mapCourierProfileRow(data as unknown as CourierProfileRow);
  }

  async setStatus(userId: string, status: CourierProfileStatus): Promise<CourierProfileDTO> {
    const { data, error } = await supabaseAdmin
      .from("courier_profiles")
      .update({ status })
      .eq("user_id", userId)
      .select(COURIER_PROFILE_SELECT)
      .single();

    if (error || !data) {
      throw new Error(`Failed to update courier status: ${error?.message ?? "unknown"}`);
    }
    return mapCourierProfileRow(data as unknown as CourierProfileRow);
  }

  async bulkSetStatus(userIds: string[], status: CourierProfileStatus): Promise<void> {
    if (userIds.length === 0) return;
    const { error } = await supabaseAdmin
      .from("courier_profiles")
      .update({ status })
      .in("user_id", userIds);

    if (error) throw new Error(`Failed to bulk-update courier status: ${error.message}`);
  }

  async listBlockedCourierIds(): Promise<string[]> {
    const { data, error } = await supabaseAdmin
      .from("courier_profiles")
      .select("user_id")
      .eq("status", "BLOCKED");

    if (error) throw new Error(`Failed to list blocked couriers: ${error.message}`);
    return (data ?? []).map((row) => row.user_id);
  }
}
