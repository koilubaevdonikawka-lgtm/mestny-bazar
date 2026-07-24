import type { CheckoutCartLine } from "@server/application/modules/checkout/checkout/models";
import type { OrderPricingSnapshotDto } from "@server/application/modules/order/order/dto/create-order.dto";
import type { OrderReadModel } from "@server/domain/order";

export interface CreateOrderFromCheckoutInput {
  readonly customerId: string;
  readonly address: string;
  readonly phone: string;
  readonly comment: string | null;
  readonly paymentMethod: string;
  readonly deliveryMethod: string;
  readonly currency: string;
  readonly items: readonly CheckoutCartLine[];
  readonly pricingSnapshot: OrderPricingSnapshotDto;
}

/** Order module contract for checkout orchestration. */
export interface IOrderModule {
  createOrder(input: CreateOrderFromCheckoutInput): Promise<OrderReadModel>;
}
