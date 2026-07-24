import { InvalidOrderStatusError } from "@server/domain/order/exceptions/order.errors";
import {
  ORDER_LIFECYCLE_STATUS_VALUES,
  type OrderLifecycleStatus,
  isOrderLifecycleStatus,
} from "@server/domain/order/status/order-status";
import type { ValueObject } from "@server/domain/order/value-objects/value-object.types";

export interface OrderStatusJSON {
  value: OrderLifecycleStatus;
}

/** Validated order lifecycle status value object. */
export class OrderStatus implements ValueObject<OrderStatus, OrderStatusJSON> {
  private constructor(private readonly value: OrderLifecycleStatus) {}

  static create(raw: string): OrderStatus {
    if (!isOrderLifecycleStatus(raw)) {
      throw new InvalidOrderStatusError(`Invalid order status: ${raw}`);
    }
    return new OrderStatus(raw);
  }

  static from(json: OrderStatusJSON): OrderStatus {
    return OrderStatus.create(json.value);
  }

  static draft(): OrderStatus {
    return OrderStatus.create("Draft");
  }

  valueOf(): OrderLifecycleStatus {
    return this.value;
  }

  equals(other: OrderStatus): boolean {
    return this.value === other.value;
  }

  toJSON(): OrderStatusJSON {
    return Object.freeze({ value: this.value });
  }

  clone(): OrderStatus {
    return OrderStatus.from(this.toJSON());
  }

  toString(): OrderLifecycleStatus {
    return this.value;
  }

  static allowedValues(): readonly OrderLifecycleStatus[] {
    return ORDER_LIFECYCLE_STATUS_VALUES;
  }
}
