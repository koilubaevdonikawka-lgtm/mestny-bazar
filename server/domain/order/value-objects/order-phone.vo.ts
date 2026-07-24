import { InvalidOrderPhoneError } from "@server/domain/order/exceptions/order.errors";
import type { ValueObject } from "@server/domain/order/value-objects/value-object.types";

const MIN_DIGITS = 9;

export interface OrderPhoneJSON {
  value: string;
}

export class OrderPhone implements ValueObject<OrderPhone, OrderPhoneJSON> {
  private constructor(private readonly value: string) {}

  static create(raw: string): OrderPhone {
    const digits = raw?.replace(/\D/g, "") ?? "";
    if (digits.length < MIN_DIGITS) {
      throw new InvalidOrderPhoneError();
    }
    return new OrderPhone(digits);
  }

  static from(json: OrderPhoneJSON): OrderPhone {
    return OrderPhone.create(json.value);
  }

  valueOf(): string {
    return this.value;
  }

  equals(other: OrderPhone): boolean {
    return this.value === other.value;
  }

  toJSON(): OrderPhoneJSON {
    return Object.freeze({ value: this.value });
  }

  clone(): OrderPhone {
    return OrderPhone.from(this.toJSON());
  }

  toString(): string {
    return this.value;
  }
}
