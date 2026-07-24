import { InvalidCategoryVisibilityError } from "@server/domain/catalog/exceptions/catalog.errors";
import type { ValueObject } from "@server/domain/catalog/value-objects/value-object.types";

export interface CategoryVisibilityJSON {
  showInNavigation: boolean;
  showInSearch: boolean;
}

export class CategoryVisibility implements ValueObject<CategoryVisibility, CategoryVisibilityJSON> {
  private constructor(
    private readonly showInNavigation: boolean,
    private readonly showInSearch: boolean,
  ) {}

  static create(input: Partial<CategoryVisibilityJSON> = {}): CategoryVisibility {
    if (
      typeof input.showInNavigation !== "undefined" &&
      typeof input.showInNavigation !== "boolean"
    ) {
      throw new InvalidCategoryVisibilityError();
    }
    if (typeof input.showInSearch !== "undefined" && typeof input.showInSearch !== "boolean") {
      throw new InvalidCategoryVisibilityError();
    }

    return new CategoryVisibility(input.showInNavigation ?? false, input.showInSearch ?? false);
  }

  static hidden(): CategoryVisibility {
    return new CategoryVisibility(false, false);
  }

  static visible(): CategoryVisibility {
    return new CategoryVisibility(true, true);
  }

  static from(json: CategoryVisibilityJSON): CategoryVisibility {
    return CategoryVisibility.create(json);
  }

  valueOf(): CategoryVisibilityJSON {
    return this.toJSON();
  }

  showInNavigationValue(): boolean {
    return this.showInNavigation;
  }

  showInSearchValue(): boolean {
    return this.showInSearch;
  }

  equals(other: CategoryVisibility): boolean {
    return (
      this.showInNavigation === other.showInNavigation && this.showInSearch === other.showInSearch
    );
  }

  toJSON(): CategoryVisibilityJSON {
    return Object.freeze({
      showInNavigation: this.showInNavigation,
      showInSearch: this.showInSearch,
    });
  }

  clone(): CategoryVisibility {
    return CategoryVisibility.from(this.toJSON());
  }
}
