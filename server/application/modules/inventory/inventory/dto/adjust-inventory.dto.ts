export interface AdjustInventoryDto {
  readonly productId: string;
  readonly quantityDelta: number;
  readonly referenceId?: string | null;
}
