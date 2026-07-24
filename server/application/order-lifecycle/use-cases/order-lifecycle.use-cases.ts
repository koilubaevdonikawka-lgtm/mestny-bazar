import type { Order } from "@server/application/modules/order/order/models";
import type { OrderTimeline } from "@server/application/order-lifecycle/models/order-timeline-entry.model";
import type { OrderLifecycleService } from "@server/application/order-lifecycle/services/order-lifecycle.service";
import type { OrderTimelineService } from "@server/application/order-lifecycle/services/order-timeline.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class AssignCourierUseCase {
  constructor(private readonly lifecycle: OrderLifecycleService) {}

  execute(input: { orderId: string; courierId: string; actor?: string | null }): Promise<UseCaseResult<Order>> {
    return this.lifecycle.assignCourier(input.orderId, input.courierId, input.actor).then(useCaseResult);
  }
}

export class AcceptDeliveryUseCase {
  constructor(private readonly lifecycle: OrderLifecycleService) {}

  execute(input: { orderId: string; actor?: string | null }): Promise<UseCaseResult<Order>> {
    return this.lifecycle.acceptDelivery(input.orderId, input.actor).then(useCaseResult);
  }
}

export class StartDeliveryUseCase {
  constructor(private readonly lifecycle: OrderLifecycleService) {}

  execute(input: { orderId: string; actor?: string | null }): Promise<UseCaseResult<Order>> {
    return this.lifecycle.startDelivery(input.orderId, input.actor).then(useCaseResult);
  }
}

export class ArriveToCustomerUseCase {
  constructor(private readonly lifecycle: OrderLifecycleService) {}

  execute(input: { orderId: string; actor?: string | null }): Promise<UseCaseResult<Order>> {
    return this.lifecycle.arriveToCustomer(input.orderId, input.actor).then(useCaseResult);
  }
}

export class CompleteDeliveryUseCase {
  constructor(private readonly lifecycle: OrderLifecycleService) {}

  execute(input: { orderId: string; actor?: string | null }): Promise<UseCaseResult<Order>> {
    return this.lifecycle.completeDelivery(input.orderId, input.actor).then(useCaseResult);
  }
}

export class CancelOrderUseCase {
  constructor(private readonly lifecycle: OrderLifecycleService) {}

  execute(input: {
    orderId: string;
    reason: string;
    actor?: string | null;
  }): Promise<UseCaseResult<Order>> {
    return this.lifecycle.cancelOrder(input.orderId, input.reason, input.actor).then(useCaseResult);
  }
}

export class ReturnOrderUseCase {
  constructor(private readonly lifecycle: OrderLifecycleService) {}

  execute(input: {
    orderId: string;
    reason: string;
    actor?: string | null;
  }): Promise<UseCaseResult<Order>> {
    return this.lifecycle.returnOrder(input.orderId, input.reason, input.actor).then(useCaseResult);
  }
}

export class RefundOrderUseCase {
  constructor(private readonly lifecycle: OrderLifecycleService) {}

  execute(input: {
    orderId: string;
    reason: string;
    actor?: string | null;
  }): Promise<UseCaseResult<Order>> {
    return this.lifecycle.refundOrder(input.orderId, input.reason, input.actor).then(useCaseResult);
  }
}

export class GetOrderTimelineUseCase {
  constructor(private readonly timeline: OrderTimelineService) {}

  execute(orderId: string): Promise<UseCaseResult<OrderTimeline>> {
    return this.timeline.getTimeline(orderId).then(useCaseResult);
  }
}
