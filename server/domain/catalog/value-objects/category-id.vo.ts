import { InvalidCategoryIdError } from "@server/domain/catalog/exceptions/catalog.errors";
import type { ValueObject } from "@server/domain/catalog/value-objects/value-object.types";

export interface CategoryIdJSON {
  value: string;
}

export class CategoryId implements ValueObject<CategoryId, CategoryIdJSON> {
  private constructor(private readonly value: string) {}

  static create(raw: string): CategoryId {
    const value = raw?.trim();
    if (!value) {
      throw new InvalidCategoryIdError();
    }
    return new CategoryId(value);
  }

  static from(json: CategoryIdJSON): CategoryId {
    return CategoryId.create(json.value);
  }

  valueOf(): string {
    return this.value;
  }

  equals(other: CategoryId): boolean {
    return this.value === other.value;
  }

  toJSON(): CategoryIdJSON {
    return Object.freeze({ value: this.value });
  }

  clone(): CategoryId {
    return CategoryId.from(this.toJSON());
  }

  toString(): string {
    return this.value;
  }
}
