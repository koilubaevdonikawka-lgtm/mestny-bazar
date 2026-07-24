import type { ProductMediaItem } from "@server/domain/product/value-objects/product-media.vo";
import type { ProductStatus } from "@server/domain/product/status/product-status";
import {
  ProductAttributes,
  ProductDescription,
  ProductId,
  ProductInventory,
  ProductMedia,
  ProductName,
  ProductPrice,
} from "@server/domain/product/value-objects";

/** Serializable product read shape — stable external contract. */
export interface ProductReadModel {
  id: string;
  sellerId: string;
  name: string;
  description: string | null;
  priceAmount: number;
  priceCurrency: string;
  inventoryQuantity: number;
  media: ProductMediaItem[];
  attributes: Record<string, string>;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}

/** Immutable product snapshot — no aggregate internals exposed. */
export class ProductSnapshot implements ProductReadModel {
  readonly id: string;
  readonly sellerId: string;
  readonly name: string;
  readonly description: string | null;
  readonly priceAmount: number;
  readonly priceCurrency: string;
  readonly inventoryQuantity: number;
  readonly media: ProductMediaItem[];
  readonly attributes: Record<string, string>;
  readonly status: ProductStatus;
  readonly createdAt: string;
  readonly updatedAt: string;

  private constructor(data: ProductReadModel) {
    this.id = data.id;
    this.sellerId = data.sellerId;
    this.name = data.name;
    this.description = data.description;
    this.priceAmount = data.priceAmount;
    this.priceCurrency = data.priceCurrency;
    this.inventoryQuantity = data.inventoryQuantity;
    this.media = Object.freeze(data.media.map((item) => Object.freeze({ ...item }))) as ProductMediaItem[];
    this.attributes = Object.freeze({ ...data.attributes });
    this.status = data.status;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    Object.freeze(this);
  }

  static capture(input: {
    id: ProductId;
    sellerId: string;
    name: ProductName;
    description: ProductDescription;
    price: ProductPrice;
    inventory: ProductInventory;
    media: ProductMedia;
    attributes: ProductAttributes;
    status: ProductStatus;
    createdAt: string;
    updatedAt: string;
  }): ProductSnapshot {
    return new ProductSnapshot({
      id: input.id.toString(),
      sellerId: input.sellerId,
      name: input.name.toString(),
      description: input.description.toString(),
      priceAmount: input.price.amountValue(),
      priceCurrency: input.price.currencyCode(),
      inventoryQuantity: input.inventory.quantityValue(),
      media: input.media.toJSON().items,
      attributes: { ...input.attributes.toJSON().values },
      status: input.status,
      createdAt: input.createdAt,
      updatedAt: input.updatedAt,
    });
  }

  static fromJSON(data: ProductReadModel): ProductSnapshot {
    return new ProductSnapshot(data);
  }

  toJSON(): ProductReadModel {
    return {
      id: this.id,
      sellerId: this.sellerId,
      name: this.name,
      description: this.description,
      priceAmount: this.priceAmount,
      priceCurrency: this.priceCurrency,
      inventoryQuantity: this.inventoryQuantity,
      media: this.media.map((item) => ({ ...item })),
      attributes: { ...this.attributes },
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  equals(other: ProductSnapshot): boolean {
    return JSON.stringify(this.toJSON()) === JSON.stringify(other.toJSON());
  }

  clone(): ProductSnapshot {
    return ProductSnapshot.fromJSON(this.toJSON());
  }
}
