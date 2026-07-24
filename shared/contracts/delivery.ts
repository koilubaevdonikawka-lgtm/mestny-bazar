export interface DeliveryZoneDTO {
  id: string;
  name: string;
  price: number;
  freeFrom: number | null;
  sortOrder: number;
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

export interface DeliveryFeeQuote {
  zoneId: string;
  zoneName: string;
  fee: number;
  freeFrom: number | null;
  subtotal: number;
  isFree: boolean;
}
