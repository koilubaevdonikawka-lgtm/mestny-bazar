/** Input DTO for adding a product to a customer cart. */
export interface AddCartItemDto {
  readonly customerId: string;
  readonly productId: string;
  readonly quantity?: number;
  readonly catalogId?: string;
}
