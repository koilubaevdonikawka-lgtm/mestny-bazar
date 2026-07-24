import { InvalidCatalogDescriptionError } from "@server/domain/catalog/exceptions/catalog.errors";
import type { ValueObject } from "@server/domain/catalog/value-objects/value-object.types";

const MAX_LENGTH = 2000;

export interface CatalogDescriptionJSON {
  value: string | null;
}

/** Optional catalog description. */
export class CatalogDescription implements ValueObject<CatalogDescription, CatalogDescriptionJSON> {
  private constructor(private readonly value: string | null) {}

  static create(raw: string | null | undefined): CatalogDescription {
    if (raw === null || raw === undefined) {
      return new CatalogDescription(null);
    }

    const value = raw.trim();
    if (value.length > MAX_LENGTH) {
      throw new InvalidCatalogDescriptionError();
    }

    return new CatalogDescription(value.length > 0 ? value : null);
  }

  static empty(): CatalogDescription {
    return new CatalogDescription(null);
  }

  static from(json: CatalogDescriptionJSON): CatalogDescription {
    return CatalogDescription.create(json.value);
  }

  valueOf(): string | null {
    return this.value;
  }

  isEmpty(): boolean {
    return this.value === null;
  }

  equals(other: CatalogDescription): boolean {
    return this.value === other.value;
  }

  toJSON(): CatalogDescriptionJSON {
    return Object.freeze({ value: this.value });
  }

  clone(): CatalogDescription {
    return CatalogDescription.from(this.toJSON());
  }

  toString(): string | null {
    return this.value;
  }
}
