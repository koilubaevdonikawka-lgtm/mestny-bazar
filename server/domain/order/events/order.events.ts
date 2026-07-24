import { DomainEvent } from "@server/domain/order/events/domain-event.base";
import type { OrderLifecycleStatus } from "@server/domain/order/status/order-status";
import type { PaymentMethodType } from "@server/domain/order/value-objects/payment-method.vo";
import type { DeliveryMethodType } from "@server/domain/order/value-objects/delivery-method.vo";

export abstract class OrderDomainEventBase extends DomainEvent {
  protected constructor(
    readonly orderId: string,
    occurredAt: string,
  ) {
    super(occurredAt);
  }
}

export class OrderCreatedEvent extends OrderDomainEventBase {
  readonly eventName = "order.created" as const;

  constructor(
    orderId: string,
    occurredAt: string,
    readonly payload: {
      orderNumber: string;
      customerId: string;
      status: OrderLifecycleStatus;
      itemCount: number;
      totalAmount: number;
      currency: string;
    },
  ) {
    super(orderId, occurredAt);
  }
}

export class OrderUpdatedEvent extends OrderDomainEventBase {
  readonly eventName = "order.updated" as const;

  constructor(
    orderId: string,
    occurredAt: string,
    readonly payload: {
      itemCount: number;
      totalAmount: number;
      currency: string;
    },
  ) {
    super(orderId, occurredAt);
  }
}

export class OrderConfirmedEvent extends OrderDomainEventBase {
  readonly eventName = "order.confirmed" as const;

  constructor(
    orderId: string,
    occurredAt: string,
    readonly payload: {
      previousStatus: OrderLifecycleStatus;
      paymentMethod: PaymentMethodType;
      deliveryMethod: DeliveryMethodType;
      totalAmount: number;
      currency: string;
    },
  ) {
    super(orderId, occurredAt);
  }
}

export class OrderPaidEvent extends OrderDomainEventBase {
  readonly eventName = "order.paid" as const;

  constructor(
    orderId: string,
    occurredAt: string,
    readonly payload: {
      previousStatus: OrderLifecycleStatus;
      paymentMethod: PaymentMethodType;
      totalAmount: number;
      currency: string;
    },
  ) {
    super(orderId, occurredAt);
  }
}

export class OrderCancelledEvent extends OrderDomainEventBase {
  readonly eventName = "order.cancelled" as const;

  constructor(
    orderId: string,
    occurredAt: string,
    readonly payload: {
      previousStatus: OrderLifecycleStatus;
      reason: string;
    },
  ) {
    super(orderId, occurredAt);
  }
}

export class OrderPreparingEvent extends OrderDomainEventBase {
  readonly eventName = "order.preparing" as const;

  constructor(
    orderId: string,
    occurredAt: string,
    readonly payload: {
      previousStatus: OrderLifecycleStatus;
    },
  ) {
    super(orderId, occurredAt);
  }
}

export class OrderReadyForDeliveryEvent extends OrderDomainEventBase {
  readonly eventName = "order.ready_for_delivery" as const;

  constructor(
    orderId: string,
    occurredAt: string,
    readonly payload: {
      previousStatus: OrderLifecycleStatus;
    },
  ) {
    super(orderId, occurredAt);
  }
}

export class OrderDeliveryStartedEvent extends OrderDomainEventBase {
  readonly eventName = "order.delivery_started" as const;

  constructor(
    orderId: string,
    occurredAt: string,
    readonly payload: {
      previousStatus: OrderLifecycleStatus;
      courierId: string | null;
      deliveryMethod: DeliveryMethodType;
    },
  ) {
    super(orderId, occurredAt);
  }
}

export class OrderDeliveredEvent extends OrderDomainEventBase {
  readonly eventName = "order.delivered" as const;

  constructor(
    orderId: string,
    occurredAt: string,
    readonly payload: {
      previousStatus: OrderLifecycleStatus;
    },
  ) {
    super(orderId, occurredAt);
  }
}

export class OrderRefundedEvent extends OrderDomainEventBase {
  readonly eventName = "order.refunded" as const;

  constructor(
    orderId: string,
    occurredAt: string,
    readonly payload: {
      previousStatus: OrderLifecycleStatus;
      reason: string;
      totalAmount: number;
      currency: string;
    },
  ) {
    super(orderId, occurredAt);
  }
}

export class OrderClosedEvent extends OrderDomainEventBase {
  readonly eventName = "order.closed" as const;

  constructor(
    orderId: string,
    occurredAt: string,
    readonly payload: {
      previousStatus: OrderLifecycleStatus;
    },
  ) {
    super(orderId, occurredAt);
  }
}

export type OrderDomainEvent =
  | OrderCreatedEvent
  | OrderUpdatedEvent
  | OrderConfirmedEvent
  | OrderPaidEvent
  | OrderCancelledEvent
  | OrderPreparingEvent
  | OrderReadyForDeliveryEvent
  | OrderDeliveryStartedEvent
  | OrderDeliveredEvent
  | OrderRefundedEvent
  | OrderClosedEvent;

export type OrderDomainEventType = OrderDomainEvent["eventName"];
