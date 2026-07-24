import {
  createProductPrice,
  type ProductPrice,
} from "@server/application/modules/product/product/models/product-price.model";
import {
  createProductStock,
  type ProductStock,
} from "@server/application/modules/product/product/models/product-stock.model";
import {
  ProductStatus,
  type ProductStatus as ProductStatusValue,
} from "@server/application/modules/product/product/models/product-status.model";

export interface ProductMediaItem {
  readonly id: string;
  readonly url: string;
  readonly sortOrder: number;
}

/** Product card snapshot owned by the Product capability module. */
export interface Product {
  readonly id: string;
  readonly sellerId: string;
  readonly name: string;
  readonly description: string | null;
  readonly price: ProductPrice;
  readonly stock: ProductStock;
  readonly media: readonly ProductMediaItem[];
  readonly attributes: Readonly<Record<string, string>>;
  readonly status: ProductStatusValue;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export function createProduct(input: {
  id: string;
  sellerId: string;
  name: string;
  description?: string | null;
  priceAmount: number;
  priceCurrency: string;
  stockQuantity: number;
  media?: readonly ProductMediaItem[];
  attributes?: Readonly<Record<string, string>>;
}): Product {
  const timestamp = new Date().toISOString();

  return Object.freeze({
    id: input.id.trim(),
    sellerId: input.sellerId.trim(),
    name: input.name.trim(),
    description: input.description?.trim() ?? null,
    price: createProductPrice(input.priceAmount, input.priceCurrency),
    stock: createProductStock(input.stockQuantity),
    media: Object.freeze(normalizeMedia(input.media ?? [])),
    attributes: Object.freeze({ ...(input.attributes ?? {}) }),
    status: ProductStatus.Draft,
    createdAt: timestamp,
    updatedAt: timestamp,
  });
}

export function updateProductDetails(
  product: Product,
  input: {
    name?: string;
    description?: string | null;
    media?: readonly ProductMediaItem[];
    attributes?: Readonly<Record<string, string>>;
  },
): Product {
  return Object.freeze({
    ...product,
    name: input.name?.trim() ?? product.name,
    description: input.description !== undefined ? input.description?.trim() ?? null : product.description,
    media: input.media ? Object.freeze(normalizeMedia(input.media)) : product.media,
    attributes: input.attributes ? Object.freeze({ ...input.attributes }) : product.attributes,
    updatedAt: new Date().toISOString(),
  });
}

export function withProductPrice(product: Product, price: ProductPrice): Product {
  return Object.freeze({
    ...product,
    price,
    updatedAt: new Date().toISOString(),
  });
}

export function withProductStock(product: Product, stock: ProductStock): Product {
  return Object.freeze({
    ...product,
    stock,
    updatedAt: new Date().toISOString(),
  });
}

export function withProductStatus(product: Product, status: ProductStatusValue): Product {
  return Object.freeze({
    ...product,
    status,
    updatedAt: new Date().toISOString(),
  });
}

function normalizeMedia(items: readonly ProductMediaItem[]): readonly ProductMediaItem[] {
  return items.map((item) =>
    Object.freeze({
      id: item.id.trim(),
      url: item.url.trim(),
      sortOrder: item.sortOrder,
    }),
  );
}
