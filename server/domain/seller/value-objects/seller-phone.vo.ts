import { InvalidSellerPhoneError } from "@server/domain/seller/exceptions/seller.errors";
import type { ValueObject } from "@server/domain/seller/value-objects/value-object.types";

export interface SellerPhoneJSON {
  value: string;
}

export class SellerPhone implements ValueObject<SellerPhone, SellerPhoneJSON> {
  private constructor(private readonly value: string) {}

  static create(raw: string): SellerPhone {
    const digits = raw?.replace(/[^\d]/g, "") ?? "";
    if (digits.length < 9) {
      throw new InvalidSellerPhoneError();
    }
    return new SellerPhone(digits);
  }

  static from(json: SellerPhoneJSON): SellerPhone {
    return SellerPhone.create(json.value);
  }

  valueOf(): string {
    return this.value;
  }

  equals(other: SellerPhone): boolean {
    return this.value === other.value;
  }

  toJSON(): SellerPhoneJSON {
    return Object.freeze({ value: this.value });
  }

  clone(): SellerPhone {
    return SellerPhone.from(this.toJSON());
  }

  toString(): string {
    return this.value;
  }
}
