import { InvalidOrderIdError } from "@server/domain/order/exceptions/order.errors";
import type { ValueObject } from "@server/domain/order/value-objects/value-object.types";

export interface OrderIdJSON {
  value: string;
}

export class OrderId implements ValueObject<OrderId, OrderIdJSON> {
  private constructor(private readonly value: string) {}

  static create(raw: string): OrderId {
    const value = raw?.trim();
    if (!value) {
      throw new InvalidOrderIdError();
    }
    return new OrderId(value);
  }

  static from(json: OrderIdJSON): OrderId {
    return OrderId.create(json.value);
  }

  valueOf(): string {
    return this.value;
  }

  equals(other: OrderId): boolean {
    return this.value === other.value;
  }

  toJSON(): OrderIdJSON {
    return Object.freeze({ value: this.value });
  }

  clone(): OrderId {
    return OrderId.from(this.toJSON());
  }

  toString(): string {
    return this.value;
  }
}
