import { InvalidCategoryPathError } from "@server/domain/catalog/exceptions/catalog.errors";
import type { CategorySlug } from "@server/domain/catalog/value-objects/category-slug.vo";
import type { ValueObject } from "@server/domain/catalog/value-objects/value-object.types";

export interface CategoryPathJSON {
  value: string;
  segments: string[];
  depth: number;
}

export class CategoryPath implements ValueObject<CategoryPath, CategoryPathJSON> {
  private constructor(
    private readonly value: string,
    private readonly segments: readonly string[],
    private readonly depth: number,
  ) {}

  static root(slug: CategorySlug): CategoryPath {
    const segment = slug.toString();
    return new CategoryPath(`/${segment}`, [segment], 0);
  }

  static fromParent(parent: CategoryPath, slug: CategorySlug): CategoryPath {
    const segment = slug.toString();
    const segments = [...parent.segments, segment];
    const value = `${parent.value}/${segment}`;
    return new CategoryPath(value, segments, parent.depth + 1);
  }

  static from(json: CategoryPathJSON): CategoryPath {
    const segments = json.segments?.map((segment) => segment.trim()).filter(Boolean);
    if (!segments?.length || json.depth < 0 || json.depth !== segments.length - 1) {
      throw new InvalidCategoryPathError("Category path segments and depth are inconsistent");
    }

    const value = json.value?.trim();
    const expected = `/${segments.join("/")}`;
    if (!value || value !== expected) {
      throw new InvalidCategoryPathError("Category path value does not match segments");
    }

    return new CategoryPath(value, segments, json.depth);
  }

  valueOf(): CategoryPathJSON {
    return this.toJSON();
  }

  pathValue(): string {
    return this.value;
  }

  segmentsValue(): readonly string[] {
    return this.segments;
  }

  depthValue(): number {
    return this.depth;
  }

  equals(other: CategoryPath): boolean {
    return this.value === other.value;
  }

  toJSON(): CategoryPathJSON {
    return Object.freeze({
      value: this.value,
      segments: [...this.segments],
      depth: this.depth,
    });
  }

  clone(): CategoryPath {
    return CategoryPath.from(this.toJSON());
  }

  toString(): string {
    return this.value;
  }
}
