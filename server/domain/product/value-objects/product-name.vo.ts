import { InvalidProductNameError } from "@server/domain/product/exceptions/product.errors";
import type { ValueObject } from "@server/domain/product/value-objects/value-object.types";

const MIN_LENGTH = 2;
const MAX_LENGTH = 200;

export interface ProductNameJSON {
  value: string;
}

/** Validated product display name. */
export class ProductName implements ValueObject<ProductName, ProductNameJSON> {
  private constructor(private readonly value: string) {}

  static create(raw: string): ProductName {
    const value = raw?.trim();
    if (!value || value.length < MIN_LENGTH || value.length > MAX_LENGTH) {
      throw new InvalidProductNameError();
    }
    return new ProductName(value);
  }

  static from(json: ProductNameJSON): ProductName {
    return ProductName.create(json.value);
  }

  valueOf(): string {
    return this.value;
  }

  equals(other: ProductName): boolean {
    return this.value === other.value;
  }

  toJSON(): ProductNameJSON {
    return Object.freeze({ value: this.value });
  }

  clone(): ProductName {
    return ProductName.from(this.toJSON());
  }

  toString(): string {
    return this.value;
  }
}
