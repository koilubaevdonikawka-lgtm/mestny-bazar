import type { IMarketplaceEventBus } from "@server/ports/marketplace-events.port";
import type { OrderDTO } from "@shared/contracts/order";

/** Optional legacy facade — routes notifications through Marketplace Events. */
export class NotificationService {
  constructor(private readonly events: IMarketplaceEventBus) {}

  async onOrderCreated(order: OrderDTO): Promise<void> {
    await this.events.publish({ type: "order.created", order });
  }
}
