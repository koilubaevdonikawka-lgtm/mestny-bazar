import type { CouponDTO, CreateCouponRequest, UpdateCouponRequest } from "@shared/contracts/coupon";
import type { ICouponRepository } from "@server/ports/coupon.repository";
import { supabaseAdmin } from "@server/adapters/supabase/client";

interface CouponRow {
  id: string;
  code: string;
  discount_type: CouponDTO["discountType"];
  discount_value: number;
  min_order_total: number;
  max_uses: number | null;
  uses_count: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

export function mapCouponRow(row: CouponRow): CouponDTO {
  return {
    id: row.id,
    code: row.code,
    discountType: row.discount_type,
    discountValue: Number(row.discount_value),
    minOrderTotal: Number(row.min_order_total),
    maxUses: row.max_uses,
    usesCount: row.uses_count,
    expiresAt: row.expires_at,
    isActive: row.is_active,
    createdAt: row.created_at,
  };
}

const COUPON_SELECT =
  "id, code, discount_type, discount_value, min_order_total, max_uses, uses_count, expires_at, is_active, created_at";

export class SupabaseCouponRepository implements ICouponRepository {
  async listAll(): Promise<CouponDTO[]> {
    const { data, error } = await supabaseAdmin
      .from("coupons")
      .select(COUPON_SELECT)
      .order("created_at", { ascending: false });

    if (error) throw new Error(`Failed to list coupons: ${error.message}`);
    return (data ?? []).map(mapCouponRow);
  }

  async getById(id: string): Promise<CouponDTO | null> {
    const { data, error } = await supabaseAdmin
      .from("coupons")
      .select(COUPON_SELECT)
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error(`Failed to fetch coupon: ${error.message}`);
    return data ? mapCouponRow(data) : null;
  }

  async getByCode(code: string): Promise<CouponDTO | null> {
    const { data, error } = await supabaseAdmin
      .from("coupons")
      .select(COUPON_SELECT)
      .eq("code", code)
      .maybeSingle();

    if (error) throw new Error(`Failed to fetch coupon by code: ${error.message}`);
    return data ? mapCouponRow(data) : null;
  }

  async create(data: CreateCouponRequest): Promise<CouponDTO> {
    const { data: row, error } = await supabaseAdmin
      .from("coupons")
      .insert({
        code: data.code,
        discount_type: data.discountType,
        discount_value: data.discountValue,
        min_order_total: data.minOrderTotal ?? 0,
        max_uses: data.maxUses ?? null,
        expires_at: data.expiresAt ?? null,
        is_active: data.isActive ?? true,
      })
      .select(COUPON_SELECT)
      .single();

    if (error || !row) throw new Error(`Failed to create coupon: ${error?.message ?? "unknown"}`);
    return mapCouponRow(row);
  }

  async update(data: UpdateCouponRequest): Promise<CouponDTO> {
    const patch: {
      discount_type?: CouponDTO["discountType"];
      discount_value?: number;
      min_order_total?: number;
      max_uses?: number | null;
      expires_at?: string | null;
      is_active?: boolean;
    } = {};
    if (data.discountType !== undefined) patch.discount_type = data.discountType;
    if (data.discountValue !== undefined) patch.discount_value = data.discountValue;
    if (data.minOrderTotal !== undefined) patch.min_order_total = data.minOrderTotal;
    if (data.maxUses !== undefined) patch.max_uses = data.maxUses;
    if (data.expiresAt !== undefined) patch.expires_at = data.expiresAt;
    if (data.isActive !== undefined) patch.is_active = data.isActive;

    const { data: row, error } = await supabaseAdmin
      .from("coupons")
      .update(patch)
      .eq("id", data.id)
      .select(COUPON_SELECT)
      .single();

    if (error || !row) throw new Error(`Failed to update coupon: ${error?.message ?? "unknown"}`);
    return mapCouponRow(row);
  }

  async incrementUsesCount(id: string): Promise<void> {
    const { error } = await supabaseAdmin.rpc("increment_coupon_uses", { p_coupon_id: id });
    if (error) throw new Error(`Failed to increment coupon uses: ${error.message}`);
  }
}
