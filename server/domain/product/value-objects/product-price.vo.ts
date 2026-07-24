import { InvalidProductPriceError } from "@server/domain/product/exceptions/product.errors";
import type { ValueObject } from "@server/domain/product/value-objects/value-object.types";

const MIN_AMOUNT = 0.01;
const MAX_AMOUNT = 999_999_999;
const CURRENCY_PATTERN = /^[A-Z]{3}$/;

export interface ProductPriceJSON {
  amount: number;
  currency: string;
}

/** Monetary value with currency code (ISO 4217-style). */
export class ProductPrice implements ValueObject<ProductPrice, ProductPriceJSON> {
  private constructor(
    private readonly amount: number,
    private readonly currency: string,
  ) {}

  static create(amount: number, currency: string): ProductPrice {
    const normalizedCurrency = currency?.trim().toUpperCase();
    if (
      !Number.isFinite(amount) ||
      amount < MIN_AMOUNT ||
      amount > MAX_AMOUNT ||
      !normalizedCurrency ||
      !CURRENCY_PATTERN.test(normalizedCurrency)
    ) {
      throw new InvalidProductPriceError();
    }

    return new ProductPrice(Number(amount.toFixed(2)), normalizedCurrency);
  }

  static from(json: ProductPriceJSON): ProductPrice {
    return ProductPrice.create(json.amount, json.currency);
  }

  valueOf(): ProductPriceJSON {
    return this.toJSON();
  }

  isValidForPublication(): boolean {
    return this.amount >= MIN_AMOUNT;
  }

  amountValue(): number {
    return this.amount;
  }

  currencyCode(): string {
    return this.currency;
  }

  equals(other: ProductPrice): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  toJSON(): ProductPriceJSON {
    return Object.freeze({ amount: this.amount, currency: this.currency });
  }

  clone(): ProductPrice {
    return ProductPrice.from(this.toJSON());
  }
}
