export interface UpdateCustomerProfileDto {
  readonly customerId: string;
  readonly displayName: string;
  readonly phone: string;
  readonly email?: string | null;
}
