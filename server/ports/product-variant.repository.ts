import type {
  CreateProductVariantRequest,
  ProductVariantDTO,
  UpdateProductVariantRequest,
} from "@shared/contracts/product-variant";

/** A product's own variant rows — sku/price/image/publicationStatus. Attribute assignment is a separate port (IVariantAttributeRepository). */
export interface IProductVariantRepository {
  listForProduct(productId: string): Promise<ProductVariantDTO[]>;
  getById(id: string): Promise<ProductVariantDTO | null>;
  create(data: CreateProductVariantRequest): Promise<ProductVariantDTO>;
  update(data: UpdateProductVariantRequest): Promise<ProductVariantDTO>;
  skuExists(sku: string, exceptId?: string): Promise<boolean>;
}
