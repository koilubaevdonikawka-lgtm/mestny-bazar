/** Customer delivery address owned by the Customer capability module. */
export interface CustomerAddress {
  readonly id: string;
  readonly customerId: string;
  readonly label: string;
  readonly fullAddress: string;
  readonly city: string | null;
  readonly district: string | null;
  readonly isDefault: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export function createCustomerAddress(input: {
  id: string;
  customerId: string;
  label: string;
  fullAddress: string;
  city?: string | null;
  district?: string | null;
  isDefault?: boolean;
}): CustomerAddress {
  const timestamp = new Date().toISOString();

  return Object.freeze({
    id: input.id.trim(),
    customerId: input.customerId.trim(),
    label: input.label.trim(),
    fullAddress: input.fullAddress.trim(),
    city: input.city?.trim() || null,
    district: input.district?.trim() || null,
    isDefault: input.isDefault ?? false,
    createdAt: timestamp,
    updatedAt: timestamp,
  });
}

export function updateCustomerAddress(
  address: CustomerAddress,
  input: {
    label?: string;
    fullAddress?: string;
    city?: string | null;
    district?: string | null;
    isDefault?: boolean;
  },
): CustomerAddress {
  return Object.freeze({
    ...address,
    label: input.label?.trim() ?? address.label,
    fullAddress: input.fullAddress?.trim() ?? address.fullAddress,
    city: input.city === undefined ? address.city : input.city?.trim() || null,
    district: input.district === undefined ? address.district : input.district?.trim() || null,
    isDefault: input.isDefault ?? address.isDefault,
    updatedAt: new Date().toISOString(),
  });
}

export function withCustomerAddressDefault(
  address: CustomerAddress,
  isDefault: boolean,
): CustomerAddress {
  return Object.freeze({
    ...address,
    isDefault,
    updatedAt: new Date().toISOString(),
  });
}
