import type { CreateOrderCommand } from "@server/application/commands";
import { DomainEventDispatcher } from "@server/application/events";
import type {
  IIdGenerator,
  IOrderRepository,
  ITransactionManager,
} from "@server/application/ports";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";
import { Order, type OrderReadModel } from "@server/domain/order";

export class CreateOrderUseCase {
  constructor(
    private readonly orders: IOrderRepository,
    private readonly idGenerator: IIdGenerator,
    private readonly transactionManager: ITransactionManager,
    private readonly eventDispatcher: DomainEventDispatcher,
  ) {}

  async execute(command: CreateOrderCommand): Promise<UseCaseResult<OrderReadModel>> {
    return this.transactionManager.execute(async () => {
      const order = Order.create({
        id: command.orderId,
        orderNumber: command.orderNumber,
        customerId: command.dto.customerId,
        address: command.dto.address,
        phone: command.dto.phone,
        comment: command.dto.comment,
        paymentMethod: command.dto.paymentMethod,
        deliveryMethod: command.dto.deliveryMethod,
        currency: command.dto.currency,
        deliveryFee: command.dto.deliveryFee,
        discount: command.dto.discount,
      });

      for (const item of command.dto.items ?? []) {
        order.addItem({
          id: this.idGenerator.generate(),
          productId: item.productId,
          sellerId: item.sellerId,
          catalogId: item.catalogId,
          name: item.name,
          priceAmount: item.priceAmount,
          currency: item.currency,
          quantity: item.quantity,
        });
      }

      await this.orders.save(order);
      await this.eventDispatcher.dispatchFrom(order, "Order");

      return useCaseResult(order.snapshot().toJSON());
    });
  }
}
