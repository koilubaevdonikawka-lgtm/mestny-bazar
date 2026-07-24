import {
  OrderInvariantViolationError,
  OrderPolicyViolationError,
} from "@server/domain/order/exceptions/order.errors";
import { OrderItem, type OrderItemProps } from "@server/domain/order/entities/order-item.entity";
import {
  OrderCancelledEvent,
  OrderClosedEvent,
  OrderConfirmedEvent,
  OrderCreatedEvent,
  OrderDeliveredEvent,
  OrderDeliveryStartedEvent,
  OrderPaidEvent,
  OrderPreparingEvent,
  OrderReadyForDeliveryEvent,
  OrderRefundedEvent,
  OrderUpdatedEvent,
  type OrderDomainEvent,
} from "@server/domain/order/events/order.events";
import { OrderLifecycle } from "@server/domain/order/lifecycle/order-lifecycle";
import {
  OrderPolicy,
  type OrderDeliverySnapshot,
  type OrderPolicySnapshot,
} from "@server/domain/order/policies/order.policy";
import { OrderSnapshot, type OrderReadModel } from "@server/domain/order/snapshot/order-snapshot";
import { OrderLifecycleStatus } from "@server/domain/order/status/order-status";
import {
  CustomerId,
  DeliveryMethod,
  OrderAddress,
  OrderComment,
  OrderCurrency,
  OrderId,
  OrderMoney,
  OrderNumber,
  OrderPhone,
  OrderStatus,
  OrderTotals,
  PaymentMethod,
} from "@server/domain/order/value-objects";

export interface CreateOrderProps {
  id: string;
  orderNumber: string;
  customerId: string;
  address: string;
  phone: string;
  comment?: string | null;
  paymentMethod: string;
  deliveryMethod: string;
  currency?: string;
  deliveryFee?: number;
  discount?: number;
}

export interface ReconstituteOrderProps {
  id: string;
  orderNumber: string;
  customerId: string;
  status: OrderLifecycleStatus;
  items: OrderItemProps[];
  address: string;
  phone: string;
  comment: string | null;
  paymentMethod: string;
  deliveryMethod: string;
  totals: ReturnType<OrderTotals["toJSON"]>;
  courierId: string | null;
  cancellationReason: string | null;
  refundReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export type { OrderReadModel };

/** Order aggregate root — sole entry point for order state mutations. */
export class Order {
  private readonly domainEvents: OrderDomainEvent[] = [];
  private readonly policy = new OrderPolicy();

  private constructor(
    private readonly id: OrderId,
    private readonly orderNumber: OrderNumber,
    private readonly customerId: CustomerId,
    private status: OrderStatus,
    private items: OrderItem[],
    private address: OrderAddress,
    private phone: OrderPhone,
    private comment: OrderComment,
    private paymentMethod: PaymentMethod,
    private deliveryMethod: DeliveryMethod,
    private totals: OrderTotals,
    private courierId: string | null,
    private cancellationReason: string | null,
    private refundReason: string | null,
    private readonly createdAt: string,
    private updatedAt: string,
  ) {}

  static create(props: CreateOrderProps): Order {
    const currency = OrderCurrency.create(props.currency ?? "KGS");
    const now = new Date().toISOString();
    const order = new Order(
      OrderId.create(props.id),
      OrderNumber.create(props.orderNumber),
      CustomerId.create(props.customerId),
      OrderStatus.draft(),
      [],
      OrderAddress.create(props.address),
      OrderPhone.create(props.phone),
      OrderComment.create(props.comment),
      PaymentMethod.create(props.paymentMethod),
      DeliveryMethod.create(props.deliveryMethod),
      OrderTotals.empty(currency),
      null,
      null,
      null,
      now,
      now,
    );

    order.recalculateTotals({
      deliveryFee: props.deliveryFee,
      discount: props.discount,
    });

    order.record(
      new OrderCreatedEvent(order.id.toString(), now, {
        orderNumber: order.orderNumber.toString(),
        customerId: order.customerId.toString(),
        status: order.status.toString(),
        itemCount: 0,
        totalAmount: order.totals.totalValue().amountValue(),
        currency: order.totals.totalValue().currencyValue(),
      }),
    );

    return order;
  }

  static reconstitute(props: ReconstituteOrderProps): Order {
    const items = props.items.map((item) => OrderItem.create(item));
    return new Order(
      OrderId.create(props.id),
      OrderNumber.create(props.orderNumber),
      CustomerId.create(props.customerId),
      OrderStatus.create(props.status),
      items,
      OrderAddress.create(props.address),
      OrderPhone.create(props.phone),
      OrderComment.create(props.comment),
      PaymentMethod.create(props.paymentMethod),
      DeliveryMethod.create(props.deliveryMethod),
      OrderTotals.from(props.totals),
      props.courierId,
      props.cancellationReason,
      props.refundReason,
      props.createdAt,
      props.updatedAt,
    );
  }

  addItem(props: OrderItemProps): void {
    this.assertCanModifyItems("add_item");

    const productId = props.productId.trim();
    const existing = this.items.find((item) => item.toJSON().productId === productId);
    if (existing) {
      this.changeItemQuantity(productId, existing.toJSON().quantity + props.quantity);
      return;
    }

    this.items = [...this.items, OrderItem.create(props)];
    this.recalculateTotals();
    this.touch();
    this.recordUpdated();
  }

  removeItem(productId: string): void {
    this.assertCanModifyItems("remove_item");

    const normalizedProductId = productId?.trim();
    if (!normalizedProductId) {
      throw new OrderInvariantViolationError("Product id is required");
    }

    const nextItems = this.items.filter((item) => item.toJSON().productId !== normalizedProductId);
    if (nextItems.length === this.items.length) {
      throw new OrderInvariantViolationError("Order item not found");
    }

    this.items = nextItems;
    this.recalculateTotals();
    this.touch();
    this.recordUpdated();
  }

  changeItemQuantity(productId: string, quantity: number): void {
    this.assertCanModifyItems("change_item_quantity");

    const normalizedProductId = productId?.trim();
    const item = this.items.find((entry) => entry.toJSON().productId === normalizedProductId);
    if (!item) {
      throw new OrderInvariantViolationError("Order item not found");
    }

    item.changeQuantity(quantity);
    this.items = this.items.map((entry) =>
      entry.toJSON().productId === normalizedProductId ? item : entry,
    );
    this.recalculateTotals();
    this.touch();
    this.recordUpdated();
  }

  recalculateTotals(input?: { deliveryFee?: number; discount?: number }): void {
    const currencyCode =
      this.items.length > 0
        ? this.items[0].toJSON().price.currency
        : this.totals.subtotalValue().currencyValue();
    const currency = OrderCurrency.create(currencyCode);

    let subtotal = OrderMoney.zero(currency);
    for (const item of this.items) {
      subtotal = subtotal.add(OrderMoney.from(item.toJSON().subtotal));
    }

    const deliveryFee =
      input?.deliveryFee !== undefined
        ? OrderMoney.from({ amount: input.deliveryFee, currency: currency.toString() })
        : this.totals.deliveryFeeValue();

    const discount =
      input?.discount !== undefined
        ? OrderMoney.from({ amount: input.discount, currency: currency.toString() })
        : this.totals.discountValue();

    this.totals = OrderTotals.calculate({ subtotal, deliveryFee, discount });
  }

  confirm(): void {
    this.assertPolicy(this.policy.canConfirm.bind(this.policy), "confirm");

    if (!this.policy.allowsCashForGuest(this.policySnapshot())) {
      throw new OrderPolicyViolationError(
        "Guest orders require cash payment method",
        "confirm",
      );
    }

    const previousStatus = this.status.toString();
    this.transitionStatus("confirm");
    this.record(
      new OrderConfirmedEvent(this.id.toString(), this.updatedAt, {
        previousStatus,
        paymentMethod: this.paymentMethod.toString(),
        deliveryMethod: this.deliveryMethod.toString(),
        totalAmount: this.totals.totalValue().amountValue(),
        currency: this.totals.totalValue().currencyValue(),
      }),
    );
  }

  pay(): void {
    this.assertPolicy(this.policy.canPay.bind(this.policy), "pay");

    const previousStatus = this.status.toString();
    this.transitionStatus("pay");
    this.record(
      new OrderPaidEvent(this.id.toString(), this.updatedAt, {
        previousStatus,
        paymentMethod: this.paymentMethod.toString(),
        totalAmount: this.totals.totalValue().amountValue(),
        currency: this.totals.totalValue().currencyValue(),
      }),
    );
  }

  cancel(reason: string): void {
    this.assertPolicy(this.policy.canCancel.bind(this.policy), "cancel");

    const normalizedReason = reason?.trim();
    if (!normalizedReason) {
      throw new OrderPolicyViolationError("Cancellation reason is required", "cancel");
    }

    const previousStatus = this.status.toString();
    this.cancellationReason = normalizedReason;
    this.transitionStatus("cancel");
    this.record(
      new OrderCancelledEvent(this.id.toString(), this.updatedAt, {
        previousStatus,
        reason: normalizedReason,
      }),
    );
  }

  startPreparing(): void {
    this.assertDeliveryPolicy(this.policy.canStartPreparing.bind(this.policy), "start_preparing");

    const previousStatus = this.status.toString();
    this.transitionStatus("start_preparing");
    this.record(
      new OrderPreparingEvent(this.id.toString(), this.updatedAt, {
        previousStatus,
      }),
    );
  }

  completePreparing(): void {
    this.assertDeliveryPolicy(
      this.policy.canCompletePreparing.bind(this.policy),
      "complete_preparing",
    );

    const previousStatus = this.status.toString();
    this.transitionStatus("complete_preparing");
    this.record(
      new OrderReadyForDeliveryEvent(this.id.toString(), this.updatedAt, {
        previousStatus,
      }),
    );
  }

  handToCourier(courierId: string): void {
    this.assertDeliveryPolicy(this.policy.canHandToCourier.bind(this.policy), "hand_to_courier");

    const normalizedCourierId = courierId?.trim();
    if (!normalizedCourierId) {
      throw new OrderPolicyViolationError("Courier id is required", "hand_to_courier");
    }

    this.courierId = normalizedCourierId;
    OrderLifecycle.transition(this.status.toString(), "hand_to_courier");
    this.touch();
    this.recordUpdated();
  }

  startDelivery(): void {
    this.assertDeliveryPolicy(this.policy.canStartDelivery.bind(this.policy), "start_delivery");

    const previousStatus = this.status.toString();
    this.transitionStatus("start_delivery");
    this.record(
      new OrderDeliveryStartedEvent(this.id.toString(), this.updatedAt, {
        previousStatus,
        courierId: this.courierId,
        deliveryMethod: this.deliveryMethod.toString(),
      }),
    );
  }

  deliver(): void {
    if (this.deliveryMethod.isPickup()) {
      this.assertDeliveryPolicy(this.policy.canCompletePickup.bind(this.policy), "deliver");
    } else {
      this.assertDeliveryPolicy(this.policy.canDeliver.bind(this.policy), "deliver");
    }

    const previousStatus = this.status.toString();
    this.transitionStatus("deliver");
    this.record(
      new OrderDeliveredEvent(this.id.toString(), this.updatedAt, {
        previousStatus,
      }),
    );
  }

  refund(reason: string): void {
    this.assertPolicy(this.policy.canRefund.bind(this.policy), "refund");

    const normalizedReason = reason?.trim();
    if (!normalizedReason) {
      throw new OrderPolicyViolationError("Refund reason is required", "refund");
    }

    const previousStatus = this.status.toString();
    this.refundReason = normalizedReason;
    this.transitionStatus("refund");
    this.record(
      new OrderRefundedEvent(this.id.toString(), this.updatedAt, {
        previousStatus,
        reason: normalizedReason,
        totalAmount: this.totals.totalValue().amountValue(),
        currency: this.totals.totalValue().currencyValue(),
      }),
    );
  }

  close(): void {
    this.assertPolicy(this.policy.canClose.bind(this.policy), "close");

    const previousStatus = this.status.toString();
    this.transitionStatus("close");
    this.record(
      new OrderClosedEvent(this.id.toString(), this.updatedAt, {
        previousStatus,
      }),
    );
  }

  pullDomainEvents(): OrderDomainEvent[] {
    const events = [...this.domainEvents];
    this.domainEvents.length = 0;
    return events;
  }

  peekDomainEvents(): readonly OrderDomainEvent[] {
    return [...this.domainEvents];
  }

  snapshot(): OrderSnapshot {
    return OrderSnapshot.capture({
      id: this.id,
      orderNumber: this.orderNumber,
      customerId: this.customerId,
      status: this.status,
      items: this.items.map((item) => item.toJSON()),
      address: this.address,
      phone: this.phone,
      comment: this.comment,
      paymentMethod: this.paymentMethod,
      deliveryMethod: this.deliveryMethod,
      totals: this.totals,
      courierId: this.courierId,
      cancellationReason: this.cancellationReason,
      refundReason: this.refundReason,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    });
  }

  private assertCanModifyItems(action: string): void {
    if (!this.policy.canModifyItems(this.policySnapshot())) {
      throw new OrderPolicyViolationError(
        `Action "${action}" is not permitted for order in status "${this.status.toString()}"`,
        action,
      );
    }
  }

  private transitionStatus(action: Parameters<typeof OrderLifecycle.transition>[1]): void {
    const next = OrderLifecycle.transition(this.status.toString(), action);
    this.status = OrderStatus.create(next);
    this.touch();
  }

  private policySnapshot(): OrderPolicySnapshot {
    return {
      status: this.status.toString(),
      paymentMethod: this.paymentMethod,
      customerId: this.customerId,
      itemCount: this.items.length,
      courierId: this.courierId,
    };
  }

  private deliverySnapshot(): OrderDeliverySnapshot {
    return {
      ...this.policySnapshot(),
      deliveryMethod: this.deliveryMethod,
    };
  }

  private assertPolicy(
    predicate: (snapshot: OrderPolicySnapshot) => boolean,
    action: string,
  ): void {
    if (!predicate(this.policySnapshot())) {
      throw new OrderPolicyViolationError(
        `Action "${action}" is not permitted for order in status "${this.status.toString()}"`,
        action,
      );
    }
  }

  private assertDeliveryPolicy(
    predicate: (snapshot: OrderDeliverySnapshot) => boolean,
    action: string,
  ): void {
    if (!predicate(this.deliverySnapshot())) {
      throw new OrderPolicyViolationError(
        `Action "${action}" is not permitted for order in status "${this.status.toString()}"`,
        action,
      );
    }
  }

  private recordUpdated(): void {
    this.record(
      new OrderUpdatedEvent(this.id.toString(), this.updatedAt, {
        itemCount: this.items.length,
        totalAmount: this.totals.totalValue().amountValue(),
        currency: this.totals.totalValue().currencyValue(),
      }),
    );
  }

  private touch(): void {
    this.updatedAt = new Date().toISOString();
  }

  private record(event: OrderDomainEvent): void {
    this.domainEvents.push(Object.freeze(event));
  }
}
