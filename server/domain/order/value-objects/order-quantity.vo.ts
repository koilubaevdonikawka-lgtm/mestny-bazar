import { InvalidOrderQuantityError } from "@server/domain/order/exceptions/order.errors";
import type { ValueObject } from "@server/domain/order/value-objects/value-object.types";

export interface OrderQuantityJSON {
  value: number;
}

export class OrderQuantity implements ValueObject<OrderQuantity, OrderQuantityJSON> {
  private constructor(private readonly value: number) {}

  static create(raw: number): OrderQuantity {
    if (!Number.isInteger(raw) || raw <= 0) {
      throw new InvalidOrderQuantityError();
    }
    return new OrderQuantity(raw);
  }

  static from(json: OrderQuantityJSON): OrderQuantity {
    return OrderQuantity.create(json.value);
  }

  valueOf(): number {
    return this.value;
  }

  quantityValue(): number {
    return this.value;
  }

  equals(other: OrderQuantity): boolean {
    return this.value === other.value;
  }

  toJSON(): OrderQuantityJSON {
    return Object.freeze({ value: this.value });
  }

  clone(): OrderQuantity {
    return OrderQuantity.from(this.toJSON());
  }
}
