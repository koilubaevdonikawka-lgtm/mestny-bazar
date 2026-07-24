import { InvalidProductDescriptionError } from "@server/domain/product/exceptions/product.errors";
import type { ValueObject } from "@server/domain/product/value-objects/value-object.types";

const MAX_LENGTH = 5000;

export interface ProductDescriptionJSON {
  value: string | null;
}

/** Optional long-form product description. */
export class ProductDescription implements ValueObject<ProductDescription, ProductDescriptionJSON> {
  private constructor(private readonly value: string | null) {}

  static create(raw: string | null | undefined): ProductDescription {
    if (raw === null || raw === undefined) {
      return new ProductDescription(null);
    }

    const value = raw.trim();
    if (value.length > MAX_LENGTH) {
      throw new InvalidProductDescriptionError();
    }

    return new ProductDescription(value.length > 0 ? value : null);
  }

  static from(json: ProductDescriptionJSON): ProductDescription {
    return ProductDescription.create(json.value);
  }

  valueOf(): string | null {
    return this.value;
  }

  isEmpty(): boolean {
    return this.value === null;
  }

  equals(other: ProductDescription): boolean {
    return this.value === other.value;
  }

  toJSON(): ProductDescriptionJSON {
    return Object.freeze({ value: this.value });
  }

  clone(): ProductDescription {
    return ProductDescription.from(this.toJSON());
  }

  toString(): string | null {
    return this.value;
  }
}
