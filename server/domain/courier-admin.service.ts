import type { ICourierStatusRepository } from "@server/ports/courier-status.repository";
import type { IOrderRepository } from "@server/ports/order.repository";
import type { CourierAdminSummaryDTO } from "@shared/contracts/courier-status";

/** Admin overview of couriers and their current workload (couriers.md §"Активные назначения"). */
export class CourierAdminService {
  constructor(
    private readonly courierStatus: ICourierStatusRepository,
    private readonly orders: IOrderRepository,
  ) {}

  async listCouriers(): Promise<CourierAdminSummaryDTO[]> {
    const statuses = await this.courierStatus.listAll();
    return Promise.all(
      statuses.map(async (status) => ({
        courierId: status.courierId,
        isAvailable: status.isAvailable,
        lastSeenAt: status.lastSeenAt,
        activeDeliveries: await this.orders.countActiveDeliveriesByCourier(status.courierId),
      })),
    );
  }
}
