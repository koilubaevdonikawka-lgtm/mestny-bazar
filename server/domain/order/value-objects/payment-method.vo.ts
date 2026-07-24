import { InvalidPaymentMethodError } from "@server/domain/order/exceptions/order.errors";
import type { ValueObject } from "@server/domain/order/value-objects/value-object.types";

export type PaymentMethodType = "cash" | "online" | "card";

export const PAYMENT_METHOD_VALUES: readonly PaymentMethodType[] = ["cash", "online", "card"];

export interface PaymentMethodJSON {
  value: PaymentMethodType;
}

export class PaymentMethod implements ValueObject<PaymentMethod, PaymentMethodJSON> {
  private constructor(private readonly value: PaymentMethodType) {}

  static create(raw: string): PaymentMethod {
    const value = raw?.trim().toLowerCase() as PaymentMethodType;
    if (!PAYMENT_METHOD_VALUES.includes(value)) {
      throw new InvalidPaymentMethodError();
    }
    return new PaymentMethod(value);
  }

  static cash(): PaymentMethod {
    return PaymentMethod.create("cash");
  }

  static online(): PaymentMethod {
    return PaymentMethod.create("online");
  }

  static from(json: PaymentMethodJSON): PaymentMethod {
    return PaymentMethod.create(json.value);
  }

  valueOf(): PaymentMethodType {
    return this.value;
  }

  isCash(): boolean {
    return this.value === "cash";
  }

  isOnline(): boolean {
    return this.value === "online" || this.value === "card";
  }

  equals(other: PaymentMethod): boolean {
    return this.value === other.value;
  }

  toJSON(): PaymentMethodJSON {
    return Object.freeze({ value: this.value });
  }

  clone(): PaymentMethod {
    return PaymentMethod.from(this.toJSON());
  }

  toString(): PaymentMethodType {
    return this.value;
  }
}
