import { InvalidProductIdError } from "@server/domain/order/exceptions/order.errors";
import type { ValueObject } from "@server/domain/order/value-objects/value-object.types";

export interface ProductIdJSON {
  value: string;
}

export class ProductId implements ValueObject<ProductId, ProductIdJSON> {
  private constructor(private readonly value: string) {}

  static create(raw: string): ProductId {
    const value = raw?.trim();
    if (!value) {
      throw new InvalidProductIdError();
    }
    return new ProductId(value);
  }

  static from(json: ProductIdJSON): ProductId {
    return ProductId.create(json.value);
  }

  valueOf(): string {
    return this.value;
  }

  equals(other: ProductId): boolean {
    return this.value === other.value;
  }

  toJSON(): ProductIdJSON {
    return Object.freeze({ value: this.value });
  }

  clone(): ProductId {
    return ProductId.from(this.toJSON());
  }

  toString(): string {
    return this.value;
  }
}
