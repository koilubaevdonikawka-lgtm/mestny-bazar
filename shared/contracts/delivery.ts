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

export interface CalculateDeliveryFeeRequest {
  zoneId: string;
  subtotal: number;
}
