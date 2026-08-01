import type { ICourierStatusRepository } from "@server/ports/courier-status.repository";
import type { IMarketplaceEventBus } from "@server/ports/marketplace-events.port";
import type { CourierStatusDTO } from "@shared/contracts/courier-status";

/** Courier's own availability toggle (couriers.md — "через PWA"). */
export class CourierStatusService {
  constructor(
    private readonly courierStatus: ICourierStatusRepository,
    private readonly events: IMarketplaceEventBus,
  ) {}

  async setAvailability(courierId: string, isAvailable: boolean): Promise<CourierStatusDTO> {
    const status = await this.courierStatus.setAvailability(courierId, isAvailable);
    await this.events.publish({ type: "courier.status_changed", courierId, isAvailable });
    return status;
  }
}
