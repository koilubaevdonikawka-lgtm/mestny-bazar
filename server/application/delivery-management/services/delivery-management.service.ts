/**
 * Delivery Management — delivery lifecycle only.
 *
 * Reads orders via IOrderDeliveryReader only.
 * Does NOT access Order Repository, Payment, Checkout, Cart, or Product BCM directly.
 */
import type { ICourierProvider } from "@server/application/delivery-management/contracts/courier-provider.contract";
import type { IDeliveryEventPublisher } from "@server/application/delivery-management/contracts/delivery-event-publisher.contract";
import type { IDeliveryHistoryRepository } from "@server/application/delivery-management/contracts/delivery-history-repository.contract";
import type { IDeliveryRepository } from "@server/application/delivery-management/contracts/delivery-repository.contract";
import type { IDeliveryStatusProvider } from "@server/application/delivery-management/contracts/delivery-status-provider.contract";
import type { IOrderDeliveryReader } from "@server/application/delivery-management/contracts/order-delivery-reader.contract";
import {
  createDeliveryHistoryEntry,
  type AssignCourierResult,
  type CancelDeliveryResult,
  type DeliveriesListResult,
  type DeliveryHistoryView,
} from "@server/application/delivery-management/models/delivery-history.model";
import {
  createDelivery,
  DeliveryStatus,
  type Delivery,
  withCourierId,
  withDeliveryStatus,
} from "@server/application/delivery-management/models/delivery.model";
import type { IIdGenerator } from "@server/application/ports";

export class DeliveryManagementService {
  constructor(
    private readonly deliveryRepository: IDeliveryRepository,
    private readonly orderReader: IOrderDeliveryReader,
    private readonly courierProvider: ICourierProvider,
    private readonly statusProvider: IDeliveryStatusProvider,
    private readonly historyRepository: IDeliveryHistoryRepository,
    private readonly eventPublisher: IDeliveryEventPublisher,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async createDelivery(orderId: string): Promise<Delivery> {
    const order = await this.requireDeliverableOrder(orderId);

    const existing = await this.deliveryRepository.findByOrderId(orderId);
    const activeDelivery = existing.find(
      (delivery) => !this.statusProvider.isTerminal(delivery.status),
    );
    if (activeDelivery) {
      throw new Error(`Active delivery already exists for order: ${orderId}`);
    }

    const deliveryId = this.idGenerator.generate();
    const delivery = createDelivery({
      deliveryId,
      orderId,
      customerId: order.customerId,
    });

    await this.deliveryRepository.save(delivery);
    await this.recordHistory(deliveryId, delivery.status, null, "Delivery created", null);
    await this.eventPublisher.publishDeliveryCreated(deliveryId, orderId, order.customerId);

    return delivery;
  }

  async assignCourier(deliveryId: string, courierId: string): Promise<AssignCourierResult> {
    const delivery = await this.requireDelivery(deliveryId);

    if (delivery.status === DeliveryStatus.Cancelled || delivery.status === DeliveryStatus.Delivered) {
      throw new Error(`Cannot assign courier in status: ${delivery.status}`);
    }

    const available = await this.courierProvider.isCourierAvailable(courierId);
    if (!available) {
      throw new Error(`Courier is not available: ${courierId}`);
    }

    await this.courierProvider.assignCourier(courierId, deliveryId);

    let updated = withCourierId(delivery, courierId);
    if (updated.status === DeliveryStatus.Pending) {
      updated = await this.transitionDelivery(
        updated,
        DeliveryStatus.Assigned,
        "Courier assigned",
        courierId,
      );
    } else {
      await this.deliveryRepository.update(updated);
    }

    await this.eventPublisher.publishCourierAssigned(deliveryId, courierId);

    return {
      assigned: true,
      deliveryId,
      courierId,
      status: updated.status,
    };
  }

  async updateDeliveryStatus(
    deliveryId: string,
    status: DeliveryStatus,
    actor?: string,
    reason?: string,
  ): Promise<Delivery> {
    const delivery = await this.requireDelivery(deliveryId);
    const updated = await this.transitionDelivery(
      delivery,
      status,
      reason ?? "Status updated",
      actor ?? null,
    );

    if (status === DeliveryStatus.Delivered) {
      if (updated.courierId) {
        await this.courierProvider.releaseCourier(updated.courierId);
      }
      await this.eventPublisher.publishDeliveryCompleted(deliveryId, delivery.orderId);
    }

    return updated;
  }

  async getDelivery(deliveryId: string): Promise<Delivery | null> {
    return this.deliveryRepository.findById(deliveryId);
  }

  async getDeliveries(customerId: string): Promise<DeliveriesListResult> {
    const deliveries = await this.deliveryRepository.findByCustomerId(customerId);
    return { deliveries, total: deliveries.length };
  }

  async getAllDeliveries(): Promise<DeliveriesListResult> {
    const deliveries = await this.deliveryRepository.findAll();
    return { deliveries, total: deliveries.length };
  }

  async getDeliveriesByOrderId(orderId: string): Promise<readonly Delivery[]> {
    return this.deliveryRepository.findByOrderId(orderId);
  }

  async cancelDelivery(deliveryId: string, reason?: string): Promise<CancelDeliveryResult> {
    const delivery = await this.requireDelivery(deliveryId);

    if (delivery.status === DeliveryStatus.Cancelled) {
      return { cancelled: true };
    }

    if (this.statusProvider.isTerminal(delivery.status)) {
      throw new Error(`Delivery cannot be cancelled in status: ${delivery.status}`);
    }

    if (delivery.courierId) {
      await this.courierProvider.releaseCourier(delivery.courierId);
    }

    await this.transitionDelivery(
      delivery,
      DeliveryStatus.Cancelled,
      reason ?? "Delivery cancelled",
      null,
    );
    await this.eventPublisher.publishDeliveryCancelled(deliveryId, delivery.orderId);

    return { cancelled: true };
  }

  async getDeliveryHistory(deliveryId: string): Promise<DeliveryHistoryView> {
    await this.requireDelivery(deliveryId);
    const entries = await this.historyRepository.findByDeliveryId(deliveryId);
    return { deliveryId, entries };
  }

  private async requireDeliverableOrder(orderId: string) {
    const order = await this.orderReader.getOrderForDelivery(orderId);
    if (!order) {
      throw new Error(`Order not found: ${orderId}`);
    }
    if (!order.deliverable) {
      throw new Error(`Order is not eligible for delivery in status: ${order.status}`);
    }
    return order;
  }

  private async requireDelivery(deliveryId: string): Promise<Delivery> {
    const delivery = await this.deliveryRepository.findById(deliveryId);
    if (!delivery) {
      throw new Error(`Delivery not found: ${deliveryId}`);
    }
    return delivery;
  }

  private async transitionDelivery(
    delivery: Delivery,
    status: DeliveryStatus,
    reason: string,
    actor: string | null,
  ): Promise<Delivery> {
    if (!this.statusProvider.canTransition(delivery.status, status)) {
      throw new Error(`Invalid delivery status transition: ${delivery.status} -> ${status}`);
    }

    const updated = withDeliveryStatus(delivery, status);
    await this.deliveryRepository.update(updated);
    await this.recordHistory(delivery.deliveryId, status, delivery.status, reason, actor);
    await this.eventPublisher.publishStatusChanged(delivery.deliveryId, status, delivery.status);

    return updated;
  }

  private async recordHistory(
    deliveryId: string,
    status: DeliveryStatus,
    previousStatus: DeliveryStatus | null,
    reason: string,
    actor: string | null,
  ): Promise<void> {
    await this.historyRepository.append(
      createDeliveryHistoryEntry({
        id: this.idGenerator.generate(),
        deliveryId,
        status,
        previousStatus,
        reason,
        actor,
      }),
    );
  }
}

export { isDeliveryStatus } from "@server/application/delivery-management/models/delivery.model";
