import { InvalidSellerNameError } from "@server/domain/seller/exceptions/seller.errors";
import type { ValueObject } from "@server/domain/seller/value-objects/value-object.types";

const MIN_LENGTH = 2;
const MAX_LENGTH = 200;

export interface SellerNameJSON {
  value: string;
}

export class SellerName implements ValueObject<SellerName, SellerNameJSON> {
  private constructor(private readonly value: string) {}

  static create(raw: string): SellerName {
    const value = raw?.trim();
    if (!value || value.length < MIN_LENGTH || value.length > MAX_LENGTH) {
      throw new InvalidSellerNameError();
    }
    return new SellerName(value);
  }

  static from(json: SellerNameJSON): SellerName {
    return SellerName.create(json.value);
  }

  valueOf(): string {
    return this.value;
  }

  equals(other: SellerName): boolean {
    return this.value === other.value;
  }

  toJSON(): SellerNameJSON {
    return Object.freeze({ value: this.value });
  }

  clone(): SellerName {
    return SellerName.from(this.toJSON());
  }

  toString(): string {
    return this.value;
  }
}
