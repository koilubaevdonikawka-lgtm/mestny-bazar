import type { CreateOrderFromCheckoutInput, IOrderModule } from "@server/application/modules/checkout/checkout/contracts";
import type { CreateOrderDto, UpdateOrderStatusDto } from "@server/application/modules/order/order/dto";
import { toOrderReadModel, type Order } from "@server/application/modules/order/order/models";
import type { OrderService } from "@server/application/modules/order/order/services";
import type { CreateDisputeDto } from "@server/application/modules/support/support/dto";
import type { Dispute } from "@server/application/modules/support/support/models";
import type { SupportModule } from "@server/application/modules/support/support/api/support.module";
import type { OrderReadModel } from "@server/domain/order";

/** Public entry point for the Order business capability module. */
export class OrderModule implements IOrderModule {
  constructor(
    private readonly service: OrderService,
    private readonly support: SupportModule,
  ) {}

  createOrder(input: CreateOrderFromCheckoutInput): Promise<OrderReadModel>;
  createOrder(dto: CreateOrderDto): Promise<Order>;
  createOrder(
    input: CreateOrderFromCheckoutInput | CreateOrderDto,
  ): Promise<OrderReadModel | Order> {
    const dto = toCreateOrderDto(input);
    const orderPromise = this.service.createOrder(dto);

    if (isCheckoutOrderInput(input)) {
      return orderPromise.then(toOrderReadModel);
    }

    return orderPromise;
  }

  getOrder(orderId: string): Promise<Order | null> {
    return this.service.getOrder(orderId);
  }

  updateOrderStatus(dto: UpdateOrderStatusDto): Promise<Order> {
    return this.service.updateOrderStatus(dto);
  }

  createDispute(dto: CreateDisputeDto): Promise<Dispute> {
    return this.support.createDispute(dto);
  }
}

function isCheckoutOrderInput(
  input: CreateOrderFromCheckoutInput | CreateOrderDto,
): input is CreateOrderFromCheckoutInput {
  return Array.isArray(input.items);
}

function toCreateOrderDto(input: CreateOrderFromCheckoutInput | CreateOrderDto): CreateOrderDto {
  return Object.freeze({
    customerId: input.customerId,
    address: input.address,
    phone: input.phone,
    comment: input.comment,
    paymentMethod: input.paymentMethod,
    deliveryMethod: input.deliveryMethod,
    currency: input.currency,
    deliveryFee: "deliveryFee" in input ? input.deliveryFee : undefined,
    discount: "discount" in input ? input.discount : undefined,
    pricingSnapshot: "pricingSnapshot" in input ? input.pricingSnapshot : undefined,
    items: input.items?.map((item) =>
      Object.freeze({
        productId: item.productId,
        sellerId: item.sellerId,
        catalogId: item.catalogId,
        name: item.name,
        priceAmount: item.priceAmount,
        currency: item.currency,
        quantity: item.quantity,
      }),
    ),
  });
}
