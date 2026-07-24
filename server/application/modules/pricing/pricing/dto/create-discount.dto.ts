export interface CreateDiscountDto {
  readonly code: string;
  readonly productId?: string | null;
  readonly percentage?: number | null;
  readonly fixedAmount?: number | null;
  readonly currency: string;
}
