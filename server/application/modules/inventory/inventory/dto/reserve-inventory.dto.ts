export interface ReserveInventoryDto {
  readonly productId: string;
  readonly quantity: number;
  readonly referenceId?: string | null;
}
