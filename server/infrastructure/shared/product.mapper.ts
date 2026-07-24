import type { ProductReadModel, ReconstituteProductProps } from "@server/domain/product";
import { Product } from "@server/domain/product";

export function productReadModelToReconstituteProps(
  model: ProductReadModel,
): ReconstituteProductProps {
  return {
    id: model.id,
    sellerId: model.sellerId,
    name: model.name,
    description: model.description,
    priceAmount: model.priceAmount,
    priceCurrency: model.priceCurrency,
    inventoryQuantity: model.inventoryQuantity,
    media: model.media.map((item) => ({ ...item })),
    attributes: { ...model.attributes },
    status: model.status,
    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
  };
}

export function reconstituteProduct(model: ProductReadModel): Product {
  return Product.reconstitute(productReadModelToReconstituteProps(model));
}
