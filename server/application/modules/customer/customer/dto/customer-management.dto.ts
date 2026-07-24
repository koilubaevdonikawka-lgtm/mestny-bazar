export interface VerifyPhoneDto {
  readonly customerId: string;
  readonly code: string;
}

export interface CreateCustomerProfileDto {
  readonly customerId: string;
  readonly displayName: string;
  readonly email?: string | null;
  readonly preferences?: Readonly<Record<string, string>>;
}

export interface UpdateNotificationSettingsDto {
  readonly customerId: string;
  readonly orderUpdates?: boolean;
  readonly promotions?: boolean;
  readonly smsEnabled?: boolean;
  readonly emailEnabled?: boolean;
}

export interface DeactivateCustomerDto {
  readonly customerId: string;
  readonly reason?: string | null;
}

export interface SetDefaultAddressDto {
  readonly customerId: string;
  readonly addressId: string;
}

export interface DeleteCustomerAddressDto {
  readonly customerId: string;
  readonly addressId: string;
}
