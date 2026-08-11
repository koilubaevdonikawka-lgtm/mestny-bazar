import type { ICourierStatusRepository } from "@server/ports/courier-status.repository";
import type { IOrderRepository } from "@server/ports/order.repository";
import type { ICourierProfileRepository } from "@server/ports/courier-profile.repository";
import type { CourierListItemDTO } from "@shared/contracts/courier-profile";

/** Admin overview of couriers and their current workload (couriers.md §"Активные назначения"). */
export class CourierAdminService {
  constructor(
    private readonly courierStatus: ICourierStatusRepository,
    private readonly orders: IOrderRepository,
    private readonly courierProfiles: ICourierProfileRepository,
  ) {}

  async listCouriers(): Promise<CourierListItemDTO[]> {
    const [profiles, statuses] = await Promise.all([
      this.courierProfiles.list(),
      this.courierStatus.listAll(),
    ]);
    const statusByCourier = new Map(statuses.map((s) => [s.courierId, s]));

    return Promise.all(
      profiles.map(async (profile) => {
        const status = statusByCourier.get(profile.userId);
        return {
          ...profile,
          isAvailable: status?.isAvailable ?? false,
          lastSeenAt: status?.lastSeenAt ?? null,
          activeDeliveries: await this.orders.countActiveDeliveriesByCourier(profile.userId),
        };
      }),
    );
  }
}
