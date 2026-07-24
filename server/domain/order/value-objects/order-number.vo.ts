import { InvalidOrderNumberError } from "@server/domain/order/exceptions/order.errors";
import type { ValueObject } from "@server/domain/order/value-objects/value-object.types";

export interface OrderNumberJSON {
  value: string;
}

export class OrderNumber implements ValueObject<OrderNumber, OrderNumberJSON> {
  private constructor(private readonly value: string) {}

  static create(raw: string): OrderNumber {
    const value = raw?.trim();
    if (!value) {
      throw new InvalidOrderNumberError();
    }
    return new OrderNumber(value);
  }

  static from(json: OrderNumberJSON): OrderNumber {
    return OrderNumber.create(json.value);
  }

  valueOf(): string {
    return this.value;
  }

  equals(other: OrderNumber): boolean {
    return this.value === other.value;
  }

  toJSON(): OrderNumberJSON {
    return Object.freeze({ value: this.value });
  }

  clone(): OrderNumber {
    return OrderNumber.from(this.toJSON());
  }

  toString(): string {
    return this.value;
  }
}
