import { InvalidCategoryMetadataError } from "@server/domain/catalog/exceptions/catalog.errors";
import type { ValueObject } from "@server/domain/catalog/value-objects/value-object.types";

const MAX_KEY_LENGTH = 64;
const MAX_VALUE_LENGTH = 512;
const MAX_ENTRIES = 50;

export interface CategoryMetadataJSON {
  entries: Record<string, string>;
}

export class CategoryMetadata implements ValueObject<CategoryMetadata, CategoryMetadataJSON> {
  private constructor(private readonly entries: Readonly<Record<string, string>>) {}

  static empty(): CategoryMetadata {
    return new CategoryMetadata(Object.freeze({}));
  }

  static create(raw: Record<string, string> = {}): CategoryMetadata {
    const entries: Record<string, string> = {};
    const keys = Object.keys(raw);

    if (keys.length > MAX_ENTRIES) {
      throw new InvalidCategoryMetadataError("Metadata exceeds maximum entry count");
    }

    for (const key of keys) {
      const normalizedKey = key.trim();
      const normalizedValue = raw[key]?.trim();

      if (!normalizedKey || normalizedKey.length > MAX_KEY_LENGTH) {
        throw new InvalidCategoryMetadataError("Metadata key is invalid");
      }
      if (!normalizedValue || normalizedValue.length > MAX_VALUE_LENGTH) {
        throw new InvalidCategoryMetadataError("Metadata value is invalid");
      }

      entries[normalizedKey] = normalizedValue;
    }

    return new CategoryMetadata(Object.freeze(entries));
  }

  static from(json: CategoryMetadataJSON): CategoryMetadata {
    return CategoryMetadata.create(json.entries);
  }

  valueOf(): CategoryMetadataJSON {
    return this.toJSON();
  }

  entriesValue(): Readonly<Record<string, string>> {
    return this.entries;
  }

  equals(other: CategoryMetadata): boolean {
    return JSON.stringify(this.toJSON()) === JSON.stringify(other.toJSON());
  }

  toJSON(): CategoryMetadataJSON {
    return Object.freeze({
      entries: Object.freeze({ ...this.entries }),
    });
  }

  clone(): CategoryMetadata {
    return CategoryMetadata.from(this.toJSON());
  }
}
