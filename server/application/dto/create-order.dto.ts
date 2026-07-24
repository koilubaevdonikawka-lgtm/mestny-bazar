export interface CreateOrderItemDto {
  productId: string;
  sellerId: string;
  catalogId: string;
  name: string;
  priceAmount: number;
  currency: string;
  quantity: number;
}

export interface CreateOrderDto {
  customerId: string;
  address: string;
  phone: string;
  comment?: string | null;
  paymentMethod: string;
  deliveryMethod: string;
  currency?: string;
  deliveryFee?: number;
  discount?: number;
  items?: CreateOrderItemDto[];
}
