import type {
  CreateSellerProductRequest,
  ProductPublicationStatus,
  SellerProductDTO,
  UpdateSellerProductRequest,
} from "@shared/contracts/seller-product";
import { ProductPublicationStatus as Status } from "@shared/contracts/seller-product";
import type { ISellerProductRepository } from "@server/ports/seller-product.repository";
import type { IProductPublicationPolicy } from "@server/ports/product-publication.port";
import {
  SellerProductNotFoundError,
  SellerProductValidationError,
} from "@server/domain/seller-product.errors";

function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return base.slice(0, 80) || `product-${Date.now()}`;
}

export class SellerProductService {
  constructor(
    private readonly products: ISellerProductRepository,
    private readonly publicationPolicy: IProductPublicationPolicy,
  ) {}

  async listProducts(sellerId: string): Promise<SellerProductDTO[]> {
    return this.products.listBySeller(sellerId);
  }

  async getProduct(id: string, sellerId: string): Promise<SellerProductDTO> {
    const product = await this.products.getById(id, sellerId);
    if (!product) throw new SellerProductNotFoundError();
    return product;
  }

  async createProduct(sellerId: string, data: CreateSellerProductRequest): Promise<SellerProductDTO> {
    this.validateName(data.name);
    this.validatePrice(data.price);
    if (data.stock !== undefined) this.validateStock(data.stock);

    const slug = await this.resolveUniqueSlug(data.slug?.trim() || slugify(data.name));

    this.publicationPolicy.assertCanTransition({
      productId: slug,
      currentStatus: Status.DRAFT,
      targetStatus: Status.DRAFT,
      actor: { id: sellerId },
      reason: "seller_create",
    });

    return this.products.create(sellerId, { ...data, slug });
  }

  async updateProduct(
    sellerId: string,
    data: UpdateSellerProductRequest,
  ): Promise<SellerProductDTO> {
    const existing = await this.products.getById(data.id, sellerId);
    if (!existing) throw new SellerProductNotFoundError();

    if (data.name !== undefined) this.validateName(data.name);
    if (data.price !== undefined) this.validatePrice(data.price);
    if (data.stock !== undefined) this.validateStock(data.stock);

    let patch = { ...data };
    if (data.slug !== undefined) {
      patch = { ...patch, slug: await this.resolveUniqueSlug(data.slug.trim(), data.id) };
    }

    return this.products.update(sellerId, patch);
  }

  async publishProduct(sellerId: string, id: string): Promise<SellerProductDTO> {
    return this.transitionPublication(sellerId, id, Status.PUBLISHED, "seller_publish");
  }

  async hideProduct(sellerId: string, id: string): Promise<SellerProductDTO> {
    return this.transitionPublication(sellerId, id, Status.HIDDEN, "seller_hide");
  }

  private async transitionPublication(
    sellerId: string,
    productId: string,
    targetStatus: ProductPublicationStatus,
    reason: string,
  ): Promise<SellerProductDTO> {
    const product = await this.getProduct(productId, sellerId);

    this.publicationPolicy.assertCanTransition({
      productId,
      currentStatus: product.publicationStatus,
      targetStatus,
      actor: { id: sellerId },
      reason,
    });

    return this.products.setPublicationStatus(sellerId, productId, targetStatus);
  }

  private async resolveUniqueSlug(baseSlug: string, exceptId?: string): Promise<string> {
    if (!baseSlug) {
      throw new SellerProductValidationError("Slug is required", "slug");
    }
    if (!(await this.products.slugExists(baseSlug, exceptId))) return baseSlug;

    for (let i = 2; i <= 20; i++) {
      const candidate = `${baseSlug}-${i}`;
      if (!(await this.products.slugExists(candidate, exceptId))) return candidate;
    }
    return `${baseSlug}-${Date.now()}`;
  }

  private validateName(name: string): void {
    if (!name?.trim() || name.trim().length < 2) {
      throw new SellerProductValidationError("Name must be at least 2 characters", "name");
    }
  }

  private validatePrice(price: number): void {
    if (!Number.isFinite(price) || price < 0) {
      throw new SellerProductValidationError("Price must be a non-negative number", "price");
    }
  }

  private validateStock(stock: number): void {
    if (!Number.isInteger(stock) || stock < 0) {
      throw new SellerProductValidationError("Stock must be a non-negative integer", "stock");
    }
  }
}
