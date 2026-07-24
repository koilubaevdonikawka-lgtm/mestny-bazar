import { DeliveryStatus } from "@server/application/delivery-management/models/delivery.model";
import type { DeliveryManagementApplicationService } from "@server/application/delivery-management/services/delivery-management-application.service";
import type { DeliveryManagementService } from "@server/application/delivery-management/services/delivery-management.service";
import type {
  CreateDeliveryWorkflowResult,
  DeliveryWorkflowSnapshot,
  IDeliveryWorkflowService,
} from "@server/application/workflow-orchestration/contracts/delivery-workflow-service.contract";

const DEFAULT_COURIER_ID = "courier-001";

/** Adapts Delivery Management Application Service to IDeliveryWorkflowService. */
export class DeliveryWorkflowServiceAdapter implements IDeliveryWorkflowService {
  constructor(
    private readonly delivery: DeliveryManagementApplicationService,
    private readonly deliveryService: DeliveryManagementService,
  ) {}

  async createDelivery(orderId: string): Promise<CreateDeliveryWorkflowResult> {
    const result = await this.delivery.createDelivery(orderId);
    const entry = result.value;
    return Object.freeze({
      deliveryId: entry.deliveryId,
      orderId: entry.orderId,
      status: entry.status,
    });
  }

  async completeDelivery(deliveryId: string): Promise<boolean> {
    let current = await this.getDelivery(deliveryId);
    if (!current) {
      return false;
    }
    if (current.status === DeliveryStatus.Delivered) {
      return true;
    }

    if (current.status === DeliveryStatus.Pending) {
      await this.delivery.assignCourier(deliveryId, DEFAULT_COURIER_ID);
      current = await this.getDelivery(deliveryId);
    }

    if (current?.status === DeliveryStatus.Assigned) {
      await this.delivery.updateStatus(deliveryId, DeliveryStatus.InTransit);
      current = await this.getDelivery(deliveryId);
    }

    if (current?.status === DeliveryStatus.InTransit) {
      await this.delivery.updateStatus(deliveryId, DeliveryStatus.Delivered);
      return true;
    }

    await this.delivery.updateStatus(deliveryId, DeliveryStatus.Delivered);
    return true;
  }

  async cancelDelivery(
    deliveryId: string,
    _customerId: string,
    reason?: string,
  ): Promise<boolean> {
    const result = await this.delivery.cancelDelivery(deliveryId, reason);
    return result.value.cancelled;
  }

  async getDelivery(deliveryId: string): Promise<DeliveryWorkflowSnapshot | null> {
    const result = await this.delivery.getDelivery(deliveryId);
    const entry = result.value;
    if (!entry) {
      return null;
    }

    return toSnapshot(entry);
  }

  async findByOrderId(orderId: string): Promise<DeliveryWorkflowSnapshot | null> {
    const deliveries = await this.deliveryService.getDeliveriesByOrderId(orderId);
    const entry = deliveries[0];
    return entry ? toSnapshot(entry) : null;
  }
}

function toSnapshot(delivery: {
  deliveryId: string;
  orderId: string;
  customerId: string;
  status: string;
}): DeliveryWorkflowSnapshot {
  return Object.freeze({
    deliveryId: delivery.deliveryId,
    orderId: delivery.orderId,
    customerId: delivery.customerId,
    status: delivery.status,
  });
}
