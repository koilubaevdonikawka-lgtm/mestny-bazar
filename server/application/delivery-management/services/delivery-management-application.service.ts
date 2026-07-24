import type { DeliveryStatus } from "@server/application/delivery-management/models/delivery.model";
import {
  AssignCourierUseCase,
  CancelDeliveryUseCase,
  CreateDeliveryUseCase,
  GetDeliveriesUseCase,
  GetDeliveryHistoryUseCase,
  GetDeliveryUseCase,
  UpdateDeliveryStatusUseCase,
} from "@server/application/delivery-management/use-cases/delivery-management.use-cases";

/** Application facade for delivery management scenario. */
export class DeliveryManagementApplicationService {
  constructor(
    private readonly createDeliveryUseCase: CreateDeliveryUseCase,
    private readonly assignCourierUseCase: AssignCourierUseCase,
    private readonly updateDeliveryStatusUseCase: UpdateDeliveryStatusUseCase,
    private readonly getDeliveryUseCase: GetDeliveryUseCase,
    private readonly getDeliveriesUseCase: GetDeliveriesUseCase,
    private readonly cancelDeliveryUseCase: CancelDeliveryUseCase,
    private readonly getDeliveryHistoryUseCase: GetDeliveryHistoryUseCase,
  ) {}

  createDelivery(orderId: string) {
    return this.createDeliveryUseCase.execute(orderId);
  }

  assignCourier(deliveryId: string, courierId: string) {
    return this.assignCourierUseCase.execute(deliveryId, courierId);
  }

  updateStatus(
    deliveryId: string,
    status: DeliveryStatus,
    actor?: string,
    reason?: string,
  ) {
    return this.updateDeliveryStatusUseCase.execute(deliveryId, status, actor, reason);
  }

  getDelivery(deliveryId: string) {
    return this.getDeliveryUseCase.execute(deliveryId);
  }

  getDeliveries(customerId: string) {
    return this.getDeliveriesUseCase.execute(customerId);
  }

  cancelDelivery(deliveryId: string, reason?: string) {
    return this.cancelDeliveryUseCase.execute(deliveryId, reason);
  }

  getHistory(deliveryId: string) {
    return this.getDeliveryHistoryUseCase.execute(deliveryId);
  }
}
