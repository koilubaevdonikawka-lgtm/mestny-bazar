import type { CreateOrderDto } from "@server/application/dto";
import { CreateOrderCommand } from "@server/application/commands";
import { GetOrderQuery } from "@server/application/queries";
import type { IIdGenerator } from "@server/application/ports";
import {
  CreateOrderUseCase,
  GetOrderUseCase,
} from "@server/application/use-cases";
import type { OrderReadModel } from "@server/domain/order";

/** Order application facade — orchestrates use cases without domain logic. */
export class OrderApplicationService {
  constructor(
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly getOrderUseCase: GetOrderUseCase,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async createOrder(dto: CreateOrderDto): Promise<OrderReadModel> {
    const orderId = this.idGenerator.generate();
    const orderNumber = this.buildOrderNumber();
    const command = CreateOrderCommand.create(orderId, orderNumber, dto);
    const result = await this.createOrderUseCase.execute(command);
    return result.value;
  }

  async getOrder(orderId: string): Promise<OrderReadModel | null> {
    const query = GetOrderQuery.create(orderId);
    const result = await this.getOrderUseCase.execute(query);
    return result.value;
  }

  private buildOrderNumber(): string {
    return `ORD-${Date.now()}-${this.idGenerator.generate().slice(0, 8)}`;
  }
}
