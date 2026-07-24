import { InvalidCategoryNameError } from "@server/domain/catalog/exceptions/catalog.errors";
import type { ValueObject } from "@server/domain/catalog/value-objects/value-object.types";

const MIN_LENGTH = 2;
const MAX_LENGTH = 200;

export interface CategoryNameJSON {
  value: string;
}

export class CategoryName implements ValueObject<CategoryName, CategoryNameJSON> {
  private constructor(private readonly value: string) {}

  static create(raw: string): CategoryName {
    const value = raw?.trim();
    if (!value || value.length < MIN_LENGTH || value.length > MAX_LENGTH) {
      throw new InvalidCategoryNameError();
    }
    return new CategoryName(value);
  }

  static from(json: CategoryNameJSON): CategoryName {
    return CategoryName.create(json.value);
  }

  valueOf(): string {
    return this.value;
  }

  equals(other: CategoryName): boolean {
    return this.value === other.value;
  }

  toJSON(): CategoryNameJSON {
    return Object.freeze({ value: this.value });
  }

  clone(): CategoryName {
    return CategoryName.from(this.toJSON());
  }

  toString(): string {
    return this.value;
  }
}
