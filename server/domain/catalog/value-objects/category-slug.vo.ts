import { InvalidCategorySlugError } from "@server/domain/catalog/exceptions/catalog.errors";
import type { ValueObject } from "@server/domain/catalog/value-objects/value-object.types";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export interface CategorySlugJSON {
  value: string;
}

export class CategorySlug implements ValueObject<CategorySlug, CategorySlugJSON> {
  private constructor(private readonly value: string) {}

  static create(raw: string): CategorySlug {
    const value = raw?.trim().toLowerCase();
    if (!value || !SLUG_PATTERN.test(value)) {
      throw new InvalidCategorySlugError();
    }
    return new CategorySlug(value);
  }

  static fromName(name: string): CategorySlug {
    const normalized = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    return CategorySlug.create(normalized);
  }

  static from(json: CategorySlugJSON): CategorySlug {
    return CategorySlug.create(json.value);
  }

  valueOf(): string {
    return this.value;
  }

  equals(other: CategorySlug): boolean {
    return this.value === other.value;
  }

  toJSON(): CategorySlugJSON {
    return Object.freeze({ value: this.value });
  }

  clone(): CategorySlug {
    return CategorySlug.from(this.toJSON());
  }

  toString(): string {
    return this.value;
  }
}
