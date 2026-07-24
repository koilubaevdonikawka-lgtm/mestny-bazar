import { InvalidSellerAddressError } from "@server/domain/seller/exceptions/seller.errors";
import type { ValueObject } from "@server/domain/seller/value-objects/value-object.types";

const MIN_LENGTH = 5;
const MAX_LENGTH = 500;

export interface SellerAddressJSON {
  value: string;
}

export class SellerAddress implements ValueObject<SellerAddress, SellerAddressJSON> {
  private constructor(private readonly value: string) {}

  static create(raw: string): SellerAddress {
    const value = raw?.trim();
    if (!value || value.length < MIN_LENGTH || value.length > MAX_LENGTH) {
      throw new InvalidSellerAddressError();
    }
    return new SellerAddress(value);
  }

  static from(json: SellerAddressJSON): SellerAddress {
    return SellerAddress.create(json.value);
  }

  valueOf(): string {
    return this.value;
  }

  equals(other: SellerAddress): boolean {
    return this.value === other.value;
  }

  toJSON(): SellerAddressJSON {
    return Object.freeze({ value: this.value });
  }

  clone(): SellerAddress {
    return SellerAddress.from(this.toJSON());
  }

  toString(): string {
    return this.value;
  }
}
