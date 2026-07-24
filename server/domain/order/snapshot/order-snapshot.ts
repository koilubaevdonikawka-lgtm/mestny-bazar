import type { OrderLifecycleStatus } from "@server/domain/order/status/order-status";
import type { OrderItemJSON } from "@server/domain/order/entities/order-item.entity";
import {
  CustomerId,
  DeliveryMethod,
  OrderAddress,
  OrderComment,
  OrderId,
  OrderNumber,
  OrderPhone,
  OrderStatus,
  OrderTotals,
  PaymentMethod,
} from "@server/domain/order/value-objects";

export interface OrderReadModel {
  id: string;
  orderNumber: string;
  customerId: string;
  status: OrderLifecycleStatus;
  items: OrderItemJSON[];
  address: string;
  phone: string;
  comment: string | null;
  paymentMethod: ReturnType<PaymentMethod["toJSON"]>["value"];
  deliveryMethod: ReturnType<DeliveryMethod["toJSON"]>["value"];
  totals: ReturnType<OrderTotals["toJSON"]>;
  courierId: string | null;
  cancellationReason: string | null;
  refundReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export class OrderSnapshot implements OrderReadModel {
  readonly id: string;
  readonly orderNumber: string;
  readonly customerId: string;
  readonly status: OrderLifecycleStatus;
  readonly items: readonly OrderItemJSON[];
  readonly address: string;
  readonly phone: string;
  readonly comment: string | null;
  readonly paymentMethod: OrderReadModel["paymentMethod"];
  readonly deliveryMethod: OrderReadModel["deliveryMethod"];
  readonly totals: OrderReadModel["totals"];
  readonly courierId: string | null;
  readonly cancellationReason: string | null;
  readonly refundReason: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;

  private constructor(data: OrderReadModel) {
    this.id = data.id;
    this.orderNumber = data.orderNumber;
    this.customerId = data.customerId;
    this.status = data.status;
    this.items = Object.freeze(data.items.map((item) => Object.freeze({ ...item })));
    this.address = data.address;
    this.phone = data.phone;
    this.comment = data.comment;
    this.paymentMethod = data.paymentMethod;
    this.deliveryMethod = data.deliveryMethod;
    this.totals = Object.freeze({
      subtotal: Object.freeze({ ...data.totals.subtotal }),
      deliveryFee: Object.freeze({ ...data.totals.deliveryFee }),
      discount: Object.freeze({ ...data.totals.discount }),
      total: Object.freeze({ ...data.totals.total }),
    });
    this.courierId = data.courierId;
    this.cancellationReason = data.cancellationReason;
    this.refundReason = data.refundReason;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    Object.freeze(this);
  }

  static capture(input: {
    id: OrderId;
    orderNumber: OrderNumber;
    customerId: CustomerId;
    status: OrderStatus;
    items: readonly OrderItemJSON[];
    address: OrderAddress;
    phone: OrderPhone;
    comment: OrderComment;
    paymentMethod: PaymentMethod;
    deliveryMethod: DeliveryMethod;
    totals: OrderTotals;
    courierId: string | null;
    cancellationReason: string | null;
    refundReason: string | null;
    createdAt: string;
    updatedAt: string;
  }): OrderSnapshot {
    return new OrderSnapshot({
      id: input.id.toString(),
      orderNumber: input.orderNumber.toString(),
      customerId: input.customerId.toString(),
      status: input.status.toString(),
      items: input.items.map((item) => ({ ...item })),
      address: input.address.toString(),
      phone: input.phone.toString(),
      comment: input.comment.toString(),
      paymentMethod: input.paymentMethod.toString(),
      deliveryMethod: input.deliveryMethod.toString(),
      totals: input.totals.toJSON(),
      courierId: input.courierId,
      cancellationReason: input.cancellationReason,
      refundReason: input.refundReason,
      createdAt: input.createdAt,
      updatedAt: input.updatedAt,
    });
  }

  static fromJSON(data: OrderReadModel): OrderSnapshot {
    return new OrderSnapshot(data);
  }

  toJSON(): OrderReadModel {
    return {
      id: this.id,
      orderNumber: this.orderNumber,
      customerId: this.customerId,
      status: this.status,
      items: this.items.map((item) => ({ ...item })),
      address: this.address,
      phone: this.phone,
      comment: this.comment,
      paymentMethod: this.paymentMethod,
      deliveryMethod: this.deliveryMethod,
      totals: {
        subtotal: { ...this.totals.subtotal },
        deliveryFee: { ...this.totals.deliveryFee },
        discount: { ...this.totals.discount },
        total: { ...this.totals.total },
      },
      courierId: this.courierId,
      cancellationReason: this.cancellationReason,
      refundReason: this.refundReason,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  equals(other: OrderSnapshot): boolean {
    return JSON.stringify(this.toJSON()) === JSON.stringify(other.toJSON());
  }

  clone(): OrderSnapshot {
    return OrderSnapshot.fromJSON(this.toJSON());
  }
}
