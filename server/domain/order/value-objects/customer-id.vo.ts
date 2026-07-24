import { InvalidCustomerIdError } from "@server/domain/order/exceptions/order.errors";
import type { ValueObject } from "@server/domain/order/value-objects/value-object.types";

export interface CustomerIdJSON {
  value: string;
}

export class CustomerId implements ValueObject<CustomerId, CustomerIdJSON> {
  private constructor(private readonly value: string) {}

  static create(raw: string): CustomerId {
    const value = raw?.trim();
    if (!value) {
      throw new InvalidCustomerIdError();
    }
    return new CustomerId(value);
  }

  static guest(): CustomerId {
    return new CustomerId("guest");
  }

  static from(json: CustomerIdJSON): CustomerId {
    return CustomerId.create(json.value);
  }

  valueOf(): string {
    return this.value;
  }

  isGuest(): boolean {
    return this.value === "guest";
  }

  equals(other: CustomerId): boolean {
    return this.value === other.value;
  }

  toJSON(): CustomerIdJSON {
    return Object.freeze({ value: this.value });
  }

  clone(): CustomerId {
    return CustomerId.from(this.toJSON());
  }

  toString(): string {
    return this.value;
  }
}
