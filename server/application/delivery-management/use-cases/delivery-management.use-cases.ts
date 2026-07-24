import type { Delivery } from "@server/application/delivery-management/models/delivery.model";
import type {
  AssignCourierResult,
  CancelDeliveryResult,
  DeliveriesListResult,
  DeliveryHistoryView,
} from "@server/application/delivery-management/models/delivery-history.model";
import type { DeliveryStatus } from "@server/application/delivery-management/models/delivery.model";
import type { DeliveryManagementService } from "@server/application/delivery-management/services/delivery-management.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class CreateDeliveryUseCase {
  constructor(private readonly deliveries: DeliveryManagementService) {}

  execute(orderId: string): Promise<UseCaseResult<Delivery>> {
    return this.deliveries.createDelivery(orderId).then(useCaseResult);
  }
}

export class AssignCourierUseCase {
  constructor(private readonly deliveries: DeliveryManagementService) {}

  execute(deliveryId: string, courierId: string): Promise<UseCaseResult<AssignCourierResult>> {
    return this.deliveries.assignCourier(deliveryId, courierId).then(useCaseResult);
  }
}

export class UpdateDeliveryStatusUseCase {
  constructor(private readonly deliveries: DeliveryManagementService) {}

  execute(
    deliveryId: string,
    status: DeliveryStatus,
    actor?: string,
    reason?: string,
  ): Promise<UseCaseResult<Delivery>> {
    return this.deliveries.updateDeliveryStatus(deliveryId, status, actor, reason).then(useCaseResult);
  }
}

export class GetDeliveryUseCase {
  constructor(private readonly deliveries: DeliveryManagementService) {}

  async execute(deliveryId: string): Promise<UseCaseResult<Delivery | null>> {
    return useCaseResult(await this.deliveries.getDelivery(deliveryId));
  }
}

export class GetDeliveriesUseCase {
  constructor(private readonly deliveries: DeliveryManagementService) {}

  execute(customerId: string): Promise<UseCaseResult<DeliveriesListResult>> {
    return this.deliveries.getDeliveries(customerId).then(useCaseResult);
  }
}

export class CancelDeliveryUseCase {
  constructor(private readonly deliveries: DeliveryManagementService) {}

  execute(deliveryId: string, reason?: string): Promise<UseCaseResult<CancelDeliveryResult>> {
    return this.deliveries.cancelDelivery(deliveryId, reason).then(useCaseResult);
  }
}

export class GetDeliveryHistoryUseCase {
  constructor(private readonly deliveries: DeliveryManagementService) {}

  execute(deliveryId: string): Promise<UseCaseResult<DeliveryHistoryView>> {
    return this.deliveries.getDeliveryHistory(deliveryId).then(useCaseResult);
  }
}
