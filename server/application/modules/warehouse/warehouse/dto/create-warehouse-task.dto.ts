export interface CreateWarehouseTaskItemDto {
  readonly productId: string;
  readonly sellerId: string;
  readonly name: string;
  readonly quantity: number;
}

export interface CreateWarehouseTaskDto {
  readonly orderId: string;
  readonly items: readonly CreateWarehouseTaskItemDto[];
}
