import { InvalidProductAttributesError } from "@server/domain/product/exceptions/product.errors";
import type { ValueObject } from "@server/domain/product/value-objects/value-object.types";

const MAX_KEYS = 50;
const MAX_KEY_LENGTH = 64;
const MAX_VALUE_LENGTH = 256;

export interface ProductAttributesJSON {
  values: Record<string, string>;
}

/** Immutable key-value product characteristics. */
export class ProductAttributes implements ValueObject<ProductAttributes, ProductAttributesJSON> {
  private constructor(private readonly values: Readonly<Record<string, string>>) {}

  static create(raw: Record<string, string>): ProductAttributes {
    const entries = Object.entries(raw ?? {});
    if (entries.length > MAX_KEYS) {
      throw new InvalidProductAttributesError(`Product cannot have more than ${MAX_KEYS} attributes`);
    }

    const normalized: Record<string, string> = {};
    for (const [key, value] of entries) {
      const normalizedKey = key?.trim();
      const normalizedValue = value?.trim();
      if (!normalizedKey || normalizedKey.length > MAX_KEY_LENGTH) {
        throw new InvalidProductAttributesError("Attribute key is invalid");
      }
      if (!normalizedValue || normalizedValue.length > MAX_VALUE_LENGTH) {
        throw new InvalidProductAttributesError(`Attribute "${normalizedKey}" value is invalid`);
      }
      if (normalized[normalizedKey]) {
        throw new InvalidProductAttributesError(`Duplicate attribute key: ${normalizedKey}`);
      }
      normalized[normalizedKey] = normalizedValue;
    }

    return new ProductAttributes(Object.freeze(normalized));
  }

  static from(json: ProductAttributesJSON): ProductAttributes {
    return ProductAttributes.create(json.values);
  }

  static empty(): ProductAttributes {
    return new ProductAttributes(Object.freeze({}));
  }

  valueOf(): ProductAttributesJSON {
    return this.toJSON();
  }

  toRecord(): Readonly<Record<string, string>> {
    return this.values;
  }

  equals(other: ProductAttributes): boolean {
    const leftKeys = Object.keys(this.values);
    const rightKeys = Object.keys(other.values);
    if (leftKeys.length !== rightKeys.length) {
      return false;
    }
    return leftKeys.every((key) => this.values[key] === other.values[key]);
  }

  toJSON(): ProductAttributesJSON {
    return Object.freeze({ values: Object.freeze({ ...this.values }) });
  }

  clone(): ProductAttributes {
    return ProductAttributes.from(this.toJSON());
  }
}
