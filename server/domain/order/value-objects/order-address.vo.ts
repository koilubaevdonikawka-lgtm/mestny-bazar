import { InvalidOrderAddressError } from "@server/domain/order/exceptions/order.errors";
import type { ValueObject } from "@server/domain/order/value-objects/value-object.types";

const MIN_LENGTH = 5;
const MAX_LENGTH = 500;

export interface OrderAddressJSON {
  value: string;
}

export class OrderAddress implements ValueObject<OrderAddress, OrderAddressJSON> {
  private constructor(private readonly value: string) {}

  static create(raw: string): OrderAddress {
    const value = raw?.trim();
    if (!value || value.length < MIN_LENGTH || value.length > MAX_LENGTH) {
      throw new InvalidOrderAddressError();
    }
    return new OrderAddress(value);
  }

  static from(json: OrderAddressJSON): OrderAddress {
    return OrderAddress.create(json.value);
  }

  valueOf(): string {
    return this.value;
  }

  equals(other: OrderAddress): boolean {
    return this.value === other.value;
  }

  toJSON(): OrderAddressJSON {
    return Object.freeze({ value: this.value });
  }

  clone(): OrderAddress {
    return OrderAddress.from(this.toJSON());
  }

  toString(): string {
    return this.value;
  }
}
