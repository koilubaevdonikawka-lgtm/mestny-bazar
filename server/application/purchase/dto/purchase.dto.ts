import type { CheckoutResult, CheckoutSession } from "@server/application/modules/checkout/checkout/models";
import type { CheckoutValidationResult } from "@server/application/modules/checkout/checkout/dto";
import type { CreateCheckoutDto } from "@server/application/modules/checkout/checkout/dto";
import type { AddCartItemDto } from "@server/application/modules/cart/cart/dto";
import type { CartSnapshot } from "@server/application/modules/cart/cart/models";
import type { Payment } from "@server/application/modules/payment/payment/models";
import type { Product } from "@server/application/modules/product/product/models";
import type { ProductSearchResult } from "@server/application/modules/search/search/models";
import type { SearchFilters } from "@server/application/modules/search/search/dto";
import type { FulfillmentResult } from "@server/application/modules/order-fulfillment/order-fulfillment/models";
import type { Notification } from "@server/application/modules/notification/notification/models";
import type { Order } from "@server/application/modules/order/order/models";

export interface CheckoutUseCaseResult {
  readonly session: CheckoutSession;
  readonly validation: CheckoutValidationResult;
}

export interface PayOrderInput {
  readonly paymentId: string;
  readonly confirmCash?: boolean;
}

export interface PayOrderResult {
  readonly payment: Payment;
  readonly requiresOnlinePayment: boolean;
  readonly paymentUrl: string | null;
}

export interface CompletePurchaseInput {
  readonly sessionId: string;
  readonly confirmCash?: boolean;
}

export interface CompletePurchaseResult {
  readonly checkout: CheckoutResult;
  readonly payment: PayOrderResult;
  readonly fulfillment: FulfillmentResult | null;
  readonly warehouseNotification: Notification | null;
  readonly courierNotification: Notification | null;
  readonly adminNotification: Notification | null;
}

export interface NotifyOrderInput {
  readonly orderId: string;
  readonly orderNumber: string;
  readonly customerId: string;
  readonly address: string;
  readonly phone: string;
  readonly itemCount: number;
  readonly totalAmount: number;
  readonly currency: string;
}

export type BrowseCatalogInput = SearchFilters;
export type BrowseCatalogResult = ProductSearchResult;
export type ViewProductResult = Product | null;
export type AddToCartInput = AddCartItemDto;
export type AddToCartResult = CartSnapshot;
export type UpdateCartInput = {
  readonly customerId: string;
  readonly productId: string;
  readonly quantity: number;
};
export type UpdateCartResult = CartSnapshot;
export type CheckoutInput = CreateCheckoutDto;
export type CreateOrderInput = { readonly sessionId: string };
export type CreateOrderResult = CheckoutResult;

export function toNotifyOrderInput(order: Order): NotifyOrderInput {
  return Object.freeze({
    orderId: order.id,
    orderNumber: order.orderNumber,
    customerId: order.customerId,
    address: order.address,
    phone: order.phone,
    itemCount: order.items.length,
    totalAmount: order.totals.total.amount,
    currency: order.totals.total.currency,
  });
}
