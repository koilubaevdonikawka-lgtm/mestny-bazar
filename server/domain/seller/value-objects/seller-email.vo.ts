import { InvalidSellerEmailError } from "@server/domain/seller/exceptions/seller.errors";
import type { ValueObject } from "@server/domain/seller/value-objects/value-object.types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface SellerEmailJSON {
  value: string;
}

export class SellerEmail implements ValueObject<SellerEmail, SellerEmailJSON> {
  private constructor(private readonly value: string) {}

  static create(raw: string): SellerEmail {
    const value = raw?.trim().toLowerCase();
    if (!value || !EMAIL_PATTERN.test(value)) {
      throw new InvalidSellerEmailError();
    }
    return new SellerEmail(value);
  }

  static from(json: SellerEmailJSON): SellerEmail {
    return SellerEmail.create(json.value);
  }

  valueOf(): string {
    return this.value;
  }

  equals(other: SellerEmail): boolean {
    return this.value === other.value;
  }

  toJSON(): SellerEmailJSON {
    return Object.freeze({ value: this.value });
  }

  clone(): SellerEmail {
    return SellerEmail.from(this.toJSON());
  }

  toString(): string {
    return this.value;
  }
}
