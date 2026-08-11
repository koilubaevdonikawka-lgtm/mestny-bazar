import type {
  CreateProductVariantRequest,
  ProductVariantDTO,
  UpdateProductVariantRequest,
} from "@shared/contracts/product-variant";
import type { IProductVariantRepository } from "@server/ports/product-variant.repository";
import type { ISellerProductRepository } from "@server/ports/seller-product.repository";
import {
  ProductVariantNotFoundError,
  ProductVariantValidationError,
} from "@server/domain/product-variant.errors";

/**
 * Admin CRUD for a product's variant rows (sku/price/image/publicationStatus).
 * Mirrors AttributeAdminService's shape (existence checks resolved with a
 * friendly error, sku uniqueness resolved the same way slug uniqueness is
 * elsewhere in this codebase). Variant attribute assignment is a separate
 * service (VariantAttributeService) — this one owns the variant row itself.
 * publicationStatus is a plain settable field here, not routed through
 * IProductPublicationPolicy: that policy is actor/permission-gated for the
 * parent product's own seller/admin transition flow, which has no
 * equivalent actor context at this architecture-only stage (item 5 — no UI).
 */
export class ProductVariantService {
  constructor(
    private readonly variants: IProductVariantRepository,
    private readonly sellerProducts: ISellerProductRepository,
  ) {}

  async listForProduct(productId: string): Promise<ProductVariantDTO[]> {
    return this.variants.listForProduct(productId);
  }

  async getById(id: string): Promise<ProductVariantDTO | null> {
    return this.variants.getById(id);
  }

  async createVariant(data: CreateProductVariantRequest): Promise<ProductVariantDTO> {
    await this.assertProductExists(data.productId);
    this.validateSku(data.sku);
    if (data.price !== undefined && data.price !== null) this.validatePrice(data.price);
    if (await this.variants.skuExists(data.sku)) {
      throw new ProductVariantValidationError("SKU already in use", "sku");
    }

    return this.variants.create(data);
  }

  async updateVariant(data: UpdateProductVariantRequest): Promise<ProductVariantDTO> {
    const existing = await this.variants.getById(data.id);
    if (!existing) throw new ProductVariantNotFoundError();

    if (data.sku !== undefined) {
      this.validateSku(data.sku);
      if (await this.variants.skuExists(data.sku, data.id)) {
        throw new ProductVariantValidationError("SKU already in use", "sku");
      }
    }
    if (data.price !== undefined && data.price !== null) this.validatePrice(data.price);

    return this.variants.update(data);
  }

  private validateSku(sku: string): void {
    if (!sku?.trim()) {
      throw new ProductVariantValidationError("SKU is required", "sku");
    }
  }

  private validatePrice(price: number): void {
    if (!Number.isFinite(price) || price < 0) {
      throw new ProductVariantValidationError("Price must be a non-negative number", "price");
    }
  }

  private async assertProductExists(productId: string): Promise<void> {
    const product = await this.sellerProducts.getById(productId, null);
    if (!product) throw new ProductVariantValidationError("Product not found", "productId");
  }
}
