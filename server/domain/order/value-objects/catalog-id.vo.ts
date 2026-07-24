import { InvalidCatalogIdError } from "@server/domain/order/exceptions/order.errors";
import type { ValueObject } from "@server/domain/order/value-objects/value-object.types";

export interface CatalogIdJSON {
  value: string;
}

export class CatalogId implements ValueObject<CatalogId, CatalogIdJSON> {
  private constructor(private readonly value: string) {}

  static create(raw: string): CatalogId {
    const value = raw?.trim();
    if (!value) {
      throw new InvalidCatalogIdError();
    }
    return new CatalogId(value);
  }

  static from(json: CatalogIdJSON): CatalogId {
    return CatalogId.create(json.value);
  }

  valueOf(): string {
    return this.value;
  }

  equals(other: CatalogId): boolean {
    return this.value === other.value;
  }

  toJSON(): CatalogIdJSON {
    return Object.freeze({ value: this.value });
  }

  clone(): CatalogId {
    return CatalogId.from(this.toJSON());
  }

  toString(): string {
    return this.value;
  }
}
