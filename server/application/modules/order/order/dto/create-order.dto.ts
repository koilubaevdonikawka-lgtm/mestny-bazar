import type { CheckoutCartLine } from "@server/application/modules/checkout/checkout/models";

export interface OrderPricingLineSnapshotDto {
  readonly productId: string;
  readonly quantity: number;
  readonly unitPriceAmount: number;
  readonly currency: string;
  readonly subtotal: number;
  readonly discountAmount: number;
  readonly promotionAmount: number;
  readonly total: number;
}

export interface OrderPricingSnapshotDto {
  readonly subtotal: number;
  readonly discount: number;
  readonly total: number;
  readonly currency: string;
  readonly lines: readonly OrderPricingLineSnapshotDto[];
}

export interface CreateOrderItemDto {
  readonly productId: string;
  readonly sellerId: string;
  readonly catalogId: string;
  readonly name: string;
  readonly priceAmount: number;
  readonly currency: string;
  readonly quantity: number;
}

export interface CreateOrderDto {
  readonly customerId: string;
  readonly address: string;
  readonly phone: string;
  readonly comment?: string | null;
  readonly paymentMethod: string;
  readonly deliveryMethod: string;
  readonly currency?: string;
  readonly deliveryFee?: number;
  readonly discount?: number;
  readonly items?: readonly CreateOrderItemDto[];
  readonly pricingSnapshot?: OrderPricingSnapshotDto;
}
