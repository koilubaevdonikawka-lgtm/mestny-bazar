import { InvalidSellerIdError } from "@server/domain/order/exceptions/order.errors";
import type { ValueObject } from "@server/domain/order/value-objects/value-object.types";

export interface SellerIdJSON {
  value: string;
}

export class SellerId implements ValueObject<SellerId, SellerIdJSON> {
  private constructor(private readonly value: string) {}

  static create(raw: string): SellerId {
    const value = raw?.trim();
    if (!value) {
      throw new InvalidSellerIdError();
    }
    return new SellerId(value);
  }

  static from(json: SellerIdJSON): SellerId {
    return SellerId.create(json.value);
  }

  valueOf(): string {
    return this.value;
  }

  equals(other: SellerId): boolean {
    return this.value === other.value;
  }

  toJSON(): SellerIdJSON {
    return Object.freeze({ value: this.value });
  }

  clone(): SellerId {
    return SellerId.from(this.toJSON());
  }

  toString(): string {
    return this.value;
  }
}
