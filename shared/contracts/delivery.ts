export interface CityDTO {
  id: string;
  name: string;
  slug: string;
  timezone: string;
  sortOrder: number;
  isActive: boolean;
}

export type DeliveryZoneDTO = {
  id: string;
  cityId: string;
  storeId: string | null;
  name: string;
  sortOrder: number;
  isActive: boolean;
};

/**
 * Подэтап 0 (delivery-future-roadmap.md) — origin point for BY_DISTANCE.
 * lat/lng nullable: coordinates aren't required to create a Store record,
 * only to use it as a distance-calculation origin later (geocoding provider
 * ADR, not part of this sub-stage).
 */
export interface StoreDTO {
  id: string;
  cityId: string;
  name: string;
  address: string;
  lat: number | null;
  lng: number | null;
  isActive: boolean;
}

export interface CreateStoreRequest {
  cityId: string;
  name: string;
  address: string;
  lat?: number | null;
  lng?: number | null;
  isActive?: boolean;
}

export interface UpdateStoreRequest extends Partial<CreateStoreRequest> {
  id: string;
}

export interface AddressDTO {
  id: string;
  label: string | null;
  fullAddress: string;
  city: string | null;
  district: string | null;
  notes: string | null;
  zoneId: string | null;
  isDefault: boolean;
}

export interface CreateAddressRequest {
  label?: string;
  fullAddress: string;
  city?: string;
  district?: string;
  notes?: string;
  zoneId?: string;
  isDefault?: boolean;
}

export interface UpdateAddressRequest extends Partial<CreateAddressRequest> {
  id: string;
}

export const DeliveryTariffType = {
  STANDARD: "STANDARD",
  HOLIDAY: "HOLIDAY",
  CORPORATE: "CORPORATE",
  PROMOTIONAL: "PROMOTIONAL",
} as const;
export type DeliveryTariffType = (typeof DeliveryTariffType)[keyof typeof DeliveryTariffType];

export const DeliveryPricingModel = {
  FIXED: "FIXED",
  BY_ZONE: "BY_ZONE",
  BY_DISTANCE: "BY_DISTANCE",
} as const;
export type DeliveryPricingModel = (typeof DeliveryPricingModel)[keyof typeof DeliveryPricingModel];

/** docs/delivery/delivery-pricing.md — a Zone may have several Tariffs; Rule Engine picks one per calculation. */
export interface DeliveryTariffDTO {
  id: string;
  /** null = platform-wide default tariff (no zone of its own). */
  zoneId: string | null;
  name: string;
  tariffType: DeliveryTariffType;
  pricingModel: DeliveryPricingModel;
  basePrice: number;
  pricePerKm: number | null;
  minOrderForFreeDelivery: number | null;
  minOrderAmount: number | null;
  etaMinMinutes: number | null;
  etaMaxMinutes: number | null;
  validFrom: string | null;
  validTo: string | null;
  priority: number;
  isActive: boolean;
}

export interface CreateDeliveryZoneRequest {
  cityId: string;
  storeId?: string | null;
  name: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateDeliveryZoneRequest extends Partial<CreateDeliveryZoneRequest> {
  id: string;
}

export interface CreateDeliveryTariffRequest {
  zoneId?: string | null;
  name: string;
  tariffType?: DeliveryTariffType;
  pricingModel?: DeliveryPricingModel;
  basePrice: number;
  pricePerKm?: number | null;
  minOrderForFreeDelivery?: number | null;
  minOrderAmount?: number | null;
  etaMinMinutes?: number | null;
  etaMaxMinutes?: number | null;
  validFrom?: string | null;
  validTo?: string | null;
  priority?: number;
  isActive?: boolean;
}

export interface UpdateDeliveryTariffRequest extends Partial<CreateDeliveryTariffRequest> {
  id: string;
}

export interface DeliveryEtaEstimate {
  minMinutes: number | null;
  maxMinutes: number | null;
}

/** Result of DeliveryPricingEngine.calculate() — docs/delivery/delivery-pricing.md, "Delivery Calculator". */
export interface DeliveryFeeQuote {
  zoneId: string;
  zoneName: string;
  tariffId: string;
  tariffName: string;
  fee: number;
  freeFrom: number | null;
  subtotal: number;
  isFree: boolean;
  eta: DeliveryEtaEstimate;
}

export interface DeliveryFeeItemRequest {
  productId?: string;
  productSlug?: string;
  quantity: number;
}

export interface CalculateDeliveryFeeRequest {
  zoneId: string;
  subtotal: number;
  /**
   * Cart composition — the server resolves each product's real weightKg
   * from the DB itself (never trusts a client-computed weight, CD-01) to
   * compute the order's total weight for the weight-based delivery fee
   * formula (docs/delivery/delivery-pricing.md). Optional so the existing
   * admin delivery-fee preview tool (/admin/delivery, no cart context)
   * keeps working unchanged — an omitted/empty list is treated as 0 kg.
   */
  items?: DeliveryFeeItemRequest[];
}
