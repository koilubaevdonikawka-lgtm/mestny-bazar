import { InvalidProductInventoryError } from "@server/domain/product/exceptions/product.errors";
import type { ValueObject } from "@server/domain/product/value-objects/value-object.types";

export interface ProductInventoryJSON {
  quantity: number;
}

/** Non-negative stock quantity. */
export class ProductInventory implements ValueObject<ProductInventory, ProductInventoryJSON> {
  private constructor(private readonly quantity: number) {}

  static create(raw: number): ProductInventory {
    if (!Number.isInteger(raw) || raw < 0) {
      throw new InvalidProductInventoryError();
    }
    return new ProductInventory(raw);
  }

  static from(json: ProductInventoryJSON): ProductInventory {
    return ProductInventory.create(json.quantity);
  }

  valueOf(): number {
    return this.quantity;
  }

  isAvailableForSale(): boolean {
    return this.quantity > 0;
  }

  quantityValue(): number {
    return this.quantity;
  }

  equals(other: ProductInventory): boolean {
    return this.quantity === other.quantity;
  }

  toJSON(): ProductInventoryJSON {
    return Object.freeze({ quantity: this.quantity });
  }

  clone(): ProductInventory {
    return ProductInventory.from(this.toJSON());
  }
}
