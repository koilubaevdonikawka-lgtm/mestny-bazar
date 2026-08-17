import type {
  ProductAttributeValueDTO,
  SetProductAttributeValueRequest,
} from "@shared/contracts/product-attributes";

/** A product's actual attribute value assignments — separate from IAttributeRepository (which owns attribute *definitions*), since this operates on the product aggregate. */
export interface IProductAttributeRepository {
  listForProduct(productId: string): Promise<ProductAttributeValueDTO[]>;
  /** Upsert — one row per (productId, attributeId), enforced by a DB unique constraint. */
  setValue(data: SetProductAttributeValueRequest): Promise<ProductAttributeValueDTO>;
  removeValue(productId: string, attributeId: string): Promise<void>;
}
