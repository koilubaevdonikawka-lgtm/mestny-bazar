import type {
  CreateDeliveryTariffRequest,
  DeliveryTariffDTO,
  UpdateDeliveryTariffRequest,
} from "@shared/contracts/delivery";
import { DeliveryPricingModel, DeliveryTariffType } from "@shared/contracts/delivery";
import type { IDeliveryTariffRepository } from "@server/ports/delivery-tariff.repository";
import { supabaseAdmin } from "@server/adapters/supabase/client";
import { DeliveryTariffNotFoundError } from "@server/domain/delivery.errors";

interface TariffRow {
  id: string;
  zone_id: string | null;
  name: string;
  tariff_type: DeliveryTariffType;
  pricing_model: DeliveryPricingModel;
  base_price: number;
  price_per_km: number | null;
  min_order_for_free_delivery: number | null;
  min_order_amount: number | null;
  weight_extra_fee_per_kg: number | null;
  eta_min_minutes: number | null;
  eta_max_minutes: number | null;
  valid_from: string | null;
  valid_to: string | null;
  priority: number;
  is_active: boolean;
}

function mapTariffRow(row: TariffRow): DeliveryTariffDTO {
  return {
    id: row.id,
    zoneId: row.zone_id,
    name: row.name,
    tariffType: row.tariff_type,
    pricingModel: row.pricing_model,
    basePrice: Number(row.base_price),
    pricePerKm: row.price_per_km != null ? Number(row.price_per_km) : null,
    minOrderForFreeDelivery:
      row.min_order_for_free_delivery != null ? Number(row.min_order_for_free_delivery) : null,
    minOrderAmount: row.min_order_amount != null ? Number(row.min_order_amount) : null,
    weightExtraFeePerKg:
      row.weight_extra_fee_per_kg != null ? Number(row.weight_extra_fee_per_kg) : null,
    etaMinMinutes: row.eta_min_minutes,
    etaMaxMinutes: row.eta_max_minutes,
    validFrom: row.valid_from,
    validTo: row.valid_to,
    priority: row.priority,
    isActive: row.is_active,
  };
}

const TARIFF_SELECT =
  "id, zone_id, name, tariff_type, pricing_model, base_price, price_per_km, min_order_for_free_delivery, min_order_amount, weight_extra_fee_per_kg, eta_min_minutes, eta_max_minutes, valid_from, valid_to, priority, is_active";

export class SupabaseDeliveryTariffRepository implements IDeliveryTariffRepository {
  async listAll(): Promise<DeliveryTariffDTO[]> {
    const { data, error } = await supabaseAdmin
      .from("delivery_tariffs")
      .select(TARIFF_SELECT)
      .order("priority", { ascending: true });

    if (error) throw new Error(`Failed to list delivery tariffs: ${error.message}`);
    return (data ?? []).map(mapTariffRow);
  }

  /** Zone-owned tariffs OR platform-wide defaults (zone_id null) — both are candidates for the Rule Engine. */
  async listActiveForZone(zoneId: string): Promise<DeliveryTariffDTO[]> {
    const { data, error } = await supabaseAdmin
      .from("delivery_tariffs")
      .select(TARIFF_SELECT)
      .eq("is_active", true)
      .or(`zone_id.eq.${zoneId},zone_id.is.null`);

    if (error) throw new Error(`Failed to list delivery tariffs for zone: ${error.message}`);
    return (data ?? []).map(mapTariffRow);
  }

  async getById(id: string): Promise<DeliveryTariffDTO | null> {
    const { data, error } = await supabaseAdmin
      .from("delivery_tariffs")
      .select(TARIFF_SELECT)
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error(`Failed to fetch delivery tariff: ${error.message}`);
    return data ? mapTariffRow(data) : null;
  }

  async create(data: CreateDeliveryTariffRequest): Promise<DeliveryTariffDTO> {
    const { data: row, error } = await supabaseAdmin
      .from("delivery_tariffs")
      .insert({
        zone_id: data.zoneId ?? null,
        name: data.name,
        tariff_type: data.tariffType ?? DeliveryTariffType.STANDARD,
        pricing_model: data.pricingModel ?? DeliveryPricingModel.FIXED,
        base_price: data.basePrice,
        price_per_km: data.pricePerKm ?? null,
        min_order_for_free_delivery: data.minOrderForFreeDelivery ?? null,
        min_order_amount: data.minOrderAmount ?? null,
        weight_extra_fee_per_kg: data.weightExtraFeePerKg ?? null,
        eta_min_minutes: data.etaMinMinutes ?? null,
        eta_max_minutes: data.etaMaxMinutes ?? null,
        valid_from: data.validFrom ?? null,
        valid_to: data.validTo ?? null,
        priority: data.priority ?? 90,
        is_active: data.isActive ?? true,
      })
      .select(TARIFF_SELECT)
      .single();

    if (error || !row)
      throw new Error(`Failed to create delivery tariff: ${error?.message ?? "unknown"}`);
    return mapTariffRow(row);
  }

  async update(data: UpdateDeliveryTariffRequest): Promise<DeliveryTariffDTO> {
    const patch: {
      zone_id?: string | null;
      name?: string;
      tariff_type?: DeliveryTariffType;
      pricing_model?: DeliveryPricingModel;
      base_price?: number;
      price_per_km?: number | null;
      min_order_for_free_delivery?: number | null;
      min_order_amount?: number | null;
      weight_extra_fee_per_kg?: number | null;
      eta_min_minutes?: number | null;
      eta_max_minutes?: number | null;
      valid_from?: string | null;
      valid_to?: string | null;
      priority?: number;
      is_active?: boolean;
    } = {};
    if (data.zoneId !== undefined) patch.zone_id = data.zoneId;
    if (data.name !== undefined) patch.name = data.name;
    if (data.tariffType !== undefined) patch.tariff_type = data.tariffType;
    if (data.pricingModel !== undefined) patch.pricing_model = data.pricingModel;
    if (data.basePrice !== undefined) patch.base_price = data.basePrice;
    if (data.pricePerKm !== undefined) patch.price_per_km = data.pricePerKm;
    if (data.minOrderForFreeDelivery !== undefined)
      patch.min_order_for_free_delivery = data.minOrderForFreeDelivery;
    if (data.minOrderAmount !== undefined) patch.min_order_amount = data.minOrderAmount;
    if (data.weightExtraFeePerKg !== undefined)
      patch.weight_extra_fee_per_kg = data.weightExtraFeePerKg;
    if (data.etaMinMinutes !== undefined) patch.eta_min_minutes = data.etaMinMinutes;
    if (data.etaMaxMinutes !== undefined) patch.eta_max_minutes = data.etaMaxMinutes;
    if (data.validFrom !== undefined) patch.valid_from = data.validFrom;
    if (data.validTo !== undefined) patch.valid_to = data.validTo;
    if (data.priority !== undefined) patch.priority = data.priority;
    if (data.isActive !== undefined) patch.is_active = data.isActive;

    const { data: row, error } = await supabaseAdmin
      .from("delivery_tariffs")
      .update(patch)
      .eq("id", data.id)
      .select(TARIFF_SELECT)
      .single();

    if (error || !row) throw new DeliveryTariffNotFoundError(data.id);
    return mapTariffRow(row);
  }
}
