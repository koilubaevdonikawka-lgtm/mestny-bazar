export interface UpdateCustomerAddressDto {
  readonly addressId: string;
  readonly label?: string;
  readonly fullAddress?: string;
  readonly city?: string | null;
  readonly district?: string | null;
  readonly isDefault?: boolean;
}
