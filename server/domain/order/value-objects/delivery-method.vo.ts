import { InvalidDeliveryMethodError } from "@server/domain/order/exceptions/order.errors";
import type { ValueObject } from "@server/domain/order/value-objects/value-object.types";

export type DeliveryMethodType = "courier" | "pickup";

export const DELIVERY_METHOD_VALUES: readonly DeliveryMethodType[] = ["courier", "pickup"];

export interface DeliveryMethodJSON {
  value: DeliveryMethodType;
}

export class DeliveryMethod implements ValueObject<DeliveryMethod, DeliveryMethodJSON> {
  private constructor(private readonly value: DeliveryMethodType) {}

  static create(raw: string): DeliveryMethod {
    const value = raw?.trim().toLowerCase() as DeliveryMethodType;
    if (!DELIVERY_METHOD_VALUES.includes(value)) {
      throw new InvalidDeliveryMethodError();
    }
    return new DeliveryMethod(value);
  }

  static courier(): DeliveryMethod {
    return DeliveryMethod.create("courier");
  }

  static pickup(): DeliveryMethod {
    return DeliveryMethod.create("pickup");
  }

  static from(json: DeliveryMethodJSON): DeliveryMethod {
    return DeliveryMethod.create(json.value);
  }

  valueOf(): DeliveryMethodType {
    return this.value;
  }

  isCourier(): boolean {
    return this.value === "courier";
  }

  isPickup(): boolean {
    return this.value === "pickup";
  }

  equals(other: DeliveryMethod): boolean {
    return this.value === other.value;
  }

  toJSON(): DeliveryMethodJSON {
    return Object.freeze({ value: this.value });
  }

  clone(): DeliveryMethod {
    return DeliveryMethod.from(this.toJSON());
  }

  toString(): DeliveryMethodType {
    return this.value;
  }
}
