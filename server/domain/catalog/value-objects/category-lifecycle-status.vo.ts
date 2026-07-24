import { InvalidCategoryStatusError } from "@server/domain/catalog/exceptions/catalog.errors";
import {
  CATEGORY_LIFECYCLE_STATUS_VALUES,
  type CategoryLifecycleStatus,
  isCategoryLifecycleStatus,
} from "@server/domain/catalog/status/category-status";
import type { ValueObject } from "@server/domain/catalog/value-objects/value-object.types";

export interface CategoryStatusJSON {
  value: CategoryLifecycleStatus;
}

/** Validated category lifecycle status value object. */
export class CategoryStatus implements ValueObject<CategoryStatus, CategoryStatusJSON> {
  private constructor(private readonly value: CategoryLifecycleStatus) {}

  static create(raw: string): CategoryStatus {
    if (!isCategoryLifecycleStatus(raw)) {
      throw new InvalidCategoryStatusError(`Invalid category status: ${raw}`);
    }
    return new CategoryStatus(raw);
  }

  static from(json: CategoryStatusJSON): CategoryStatus {
    return CategoryStatus.create(json.value);
  }

  static draft(): CategoryStatus {
    return CategoryStatus.create("Draft");
  }

  valueOf(): CategoryLifecycleStatus {
    return this.value;
  }

  equals(other: CategoryStatus): boolean {
    return this.value === other.value;
  }

  toJSON(): CategoryStatusJSON {
    return Object.freeze({ value: this.value });
  }

  clone(): CategoryStatus {
    return CategoryStatus.from(this.toJSON());
  }

  toString(): CategoryLifecycleStatus {
    return this.value;
  }

  static allowedValues(): readonly CategoryLifecycleStatus[] {
    return CATEGORY_LIFECYCLE_STATUS_VALUES;
  }
}
