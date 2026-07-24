/** Input DTO for starting a checkout session. */
export interface CreateCheckoutDto {
  readonly customerId: string;
  readonly paymentMethod: string;
  readonly deliveryMethod: string;
  readonly comment?: string | null;
}
