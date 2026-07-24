export interface UpdatePriceDto {
  readonly productId: string;
  readonly amount: number;
  readonly currency: string;
}
