import { InvalidCatalogNameError } from "@server/domain/catalog/exceptions/catalog.errors";
import type { ValueObject } from "@server/domain/catalog/value-objects/value-object.types";

const MIN_LENGTH = 2;
const MAX_LENGTH = 200;

export interface CatalogNameJSON {
  value: string;
}

export class CatalogName implements ValueObject<CatalogName, CatalogNameJSON> {
  private constructor(private readonly value: string) {}

  static create(raw: string): CatalogName {
    const value = raw?.trim();
    if (!value || value.length < MIN_LENGTH || value.length > MAX_LENGTH) {
      throw new InvalidCatalogNameError();
    }
    return new CatalogName(value);
  }

  static from(json: CatalogNameJSON): CatalogName {
    return CatalogName.create(json.value);
  }

  valueOf(): string {
    return this.value;
  }

  equals(other: CatalogName): boolean {
    return this.value === other.value;
  }

  toJSON(): CatalogNameJSON {
    return Object.freeze({ value: this.value });
  }

  clone(): CatalogName {
    return CatalogName.from(this.toJSON());
  }

  toString(): string {
    return this.value;
  }
}
