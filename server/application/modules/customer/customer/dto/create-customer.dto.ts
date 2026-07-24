export interface CreateCustomerDto {
  readonly displayName: string;
  readonly phone: string;
  readonly email?: string | null;
  readonly defaultAddress?: {
    readonly label: string;
    readonly fullAddress: string;
    readonly city?: string | null;
    readonly district?: string | null;
  };
}
