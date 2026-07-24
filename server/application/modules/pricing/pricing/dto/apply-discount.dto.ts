export interface ApplyDiscountDto {
  readonly productId: string;
  readonly discountId: string;
  readonly quantity: number;
  readonly currency?: string;
}
