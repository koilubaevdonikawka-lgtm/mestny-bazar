import type { GetOrderQuery } from "@server/application/queries";
import type { IOrderRepository } from "@server/application/ports";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";
import type { OrderReadModel } from "@server/domain/order";

export class GetOrderUseCase {
  constructor(private readonly orders: IOrderRepository) {}

  async execute(query: GetOrderQuery): Promise<UseCaseResult<OrderReadModel | null>> {
    const snapshot = await this.orders.findSnapshotById(query.orderId);
    return useCaseResult(snapshot);
  }
}
