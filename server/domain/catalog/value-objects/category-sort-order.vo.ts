import { InvalidCategorySortOrderError } from "@server/domain/catalog/exceptions/catalog.errors";
import type { ValueObject } from "@server/domain/catalog/value-objects/value-object.types";

export interface CategorySortOrderJSON {
  value: number;
}

export class CategorySortOrder implements ValueObject<CategorySortOrder, CategorySortOrderJSON> {
  private constructor(private readonly value: number) {}

  static create(raw: number): CategorySortOrder {
    if (!Number.isInteger(raw) || raw < 0) {
      throw new InvalidCategorySortOrderError();
    }
    return new CategorySortOrder(raw);
  }

  static initial(): CategorySortOrder {
    return new CategorySortOrder(0);
  }

  static from(json: CategorySortOrderJSON): CategorySortOrder {
    return CategorySortOrder.create(json.value);
  }

  valueOf(): number {
    return this.value;
  }

  orderValue(): number {
    return this.value;
  }

  equals(other: CategorySortOrder): boolean {
    return this.value === other.value;
  }

  toJSON(): CategorySortOrderJSON {
    return Object.freeze({ value: this.value });
  }

  clone(): CategorySortOrder {
    return CategorySortOrder.from(this.toJSON());
  }
}
