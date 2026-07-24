import { InvalidOrderCurrencyError } from "@server/domain/order/exceptions/order.errors";
import type { ValueObject } from "@server/domain/order/value-objects/value-object.types";

const ISO_CURRENCY_PATTERN = /^[A-Z]{3}$/;

export interface OrderCurrencyJSON {
  value: string;
}

export class OrderCurrency implements ValueObject<OrderCurrency, OrderCurrencyJSON> {
  private constructor(private readonly value: string) {}

  static create(raw: string): OrderCurrency {
    const value = raw?.trim().toUpperCase();
    if (!value || !ISO_CURRENCY_PATTERN.test(value)) {
      throw new InvalidOrderCurrencyError();
    }
    return new OrderCurrency(value);
  }

  static kgs(): OrderCurrency {
    return OrderCurrency.create("KGS");
  }

  static from(json: OrderCurrencyJSON): OrderCurrency {
    return OrderCurrency.create(json.value);
  }

  valueOf(): string {
    return this.value;
  }

  equals(other: OrderCurrency): boolean {
    return this.value === other.value;
  }

  toJSON(): OrderCurrencyJSON {
    return Object.freeze({ value: this.value });
  }

  clone(): OrderCurrency {
    return OrderCurrency.from(this.toJSON());
  }

  toString(): string {
    return this.value;
  }
}
