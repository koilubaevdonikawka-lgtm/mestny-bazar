import type {
  CreateSellerProductRequest,
  ProductPublicationStatus,
  SellerProductDTO,
  SellerProductListParams,
  SellerProductListResult,
  UpdateSellerProductRequest,
} from "@shared/contracts/seller-product";
import { ProductPublicationStatus as Status } from "@shared/contracts/seller-product";
import type { ISellerProductRepository } from "@server/ports/seller-product.repository";
import type { IProductPublicationPolicy } from "@server/ports/product-publication.port";
import type { IMarketplaceEventBus } from "@server/ports/marketplace-events.port";
import type { IAdminCategoryRepository } from "@server/ports/category-admin.repository";
import {
  SellerProductNotFoundError,
  SellerProductValidationError,
} from "@server/domain/seller-product.errors";
import { slugify } from "@shared/lib/slugify";

/**
 * The single Product lifecycle — Промпт №103 (architecture audit remediation):
 * previously the Admin Catalog had its own parallel ProductAdminService with
 * its own repository/DTO/validation/slug logic. That duplication is gone —
 * every product, whether created by a seller or an admin, is created,
 * validated, published and read through this one service. sellerId === null
 * is the sole signal for "this call is an admin acting with full authority
 * over any product," reusing the already-nullable products.seller_id column
 * (seller_role migration) rather than a second product table/entity.
 */
export class SellerProductService {
  constructor(
    private readonly products: ISellerProductRepository,
    private readonly categories: IAdminCategoryRepository,
    private readonly publicationPolicy: IProductPublicationPolicy,
    private readonly events: IMarketplaceEventBus,
  ) {}

  async listProducts(sellerId: string): Promise<SellerProductDTO[]> {
    return this.products.listBySeller(sellerId);
  }

  /** Admin-wide, paginated, cross-seller view (Промпт №103 — server-side pagination). */
  async listAllProducts(params: SellerProductListParams): Promise<SellerProductListResult> {
    return this.products.listAll(params);
  }

  async getProduct(id: string, sellerId: string): Promise<SellerProductDTO> {
    const product = await this.products.getById(id, sellerId);
    if (!product) throw new SellerProductNotFoundError();
    return product;
  }

  /** Admin reads any product — no seller ownership scoping. */
  async getProductAsAdmin(id: string): Promise<SellerProductDTO> {
    const product = await this.products.getById(id, null);
    if (!product) throw new SellerProductNotFoundError();
    return product;
  }

  async createProduct(
    sellerId: string | null,
    data: CreateSellerProductRequest,
  ): Promise<SellerProductDTO> {
    this.validateName(data.name);
    this.validatePrice(data.price);
    if (data.stock !== undefined) this.validateStock(data.stock);
    if (data.categoryId) await this.assertCategoryExists(data.categoryId);

    const slug = await this.resolveUniqueSlug(data.slug?.trim() || slugify(data.name, "product"));
    const isAdmin = sellerId === null;
    // Sellers are always bootstrapped into DRAFT (unchanged behavior); only
    // an admin actor may request a different status directly at creation.
    const targetStatus = isAdmin ? (data.publicationStatus ?? Status.DRAFT) : Status.DRAFT;

    this.publicationPolicy.assertCanTransition({
      productId: slug,
      currentStatus: Status.DRAFT,
      targetStatus,
      actor: { id: sellerId ?? "admin", roles: isAdmin ? ["admin"] : ["seller"] },
      reason: isAdmin ? "admin_create" : "seller_create",
    });

    const product = await this.products.create(sellerId, {
      ...data,
      slug,
      publicationStatus: targetStatus,
    });

    // ai.md — the AI quality-analysis trigger reacts to a product actually
    // going live, regardless of who published it.
    if (targetStatus === Status.PUBLISHED) {
      await this.events.publish({ type: "product.published", product });
    }

    return product;
  }

  async updateProduct(
    sellerId: string | null,
    data: UpdateSellerProductRequest,
  ): Promise<SellerProductDTO> {
    const existing = await this.products.getById(data.id, sellerId);
    if (!existing) throw new SellerProductNotFoundError();

    if (data.name !== undefined) this.validateName(data.name);
    if (data.price !== undefined) this.validatePrice(data.price);
    if (data.stock !== undefined) this.validateStock(data.stock);
    if (data.categoryId) await this.assertCategoryExists(data.categoryId);

    const isAdmin = sellerId === null;
    let patch = { ...data };
    if (!isAdmin) {
      // Sellers change publication status only via publishProduct/hideProduct
      // (unchanged behavior) — strip it defensively if a client sends it.
      patch = { ...patch, publicationStatus: undefined };
    } else if (
      data.publicationStatus !== undefined &&
      data.publicationStatus !== existing.publicationStatus
    ) {
      this.publicationPolicy.assertCanTransition({
        productId: data.id,
        currentStatus: existing.publicationStatus,
        targetStatus: data.publicationStatus,
        actor: { id: "admin", roles: ["admin"] },
        reason: "admin_update",
      });
    }

    if (data.slug !== undefined) {
      patch = { ...patch, slug: await this.resolveUniqueSlug(data.slug.trim(), data.id) };
    }

    const product = await this.products.update(sellerId, patch);

    if (
      isAdmin &&
      data.publicationStatus === Status.PUBLISHED &&
      existing.publicationStatus !== Status.PUBLISHED
    ) {
      await this.events.publish({ type: "product.published", product });
    }

    return product;
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

    const updated = await this.products.setPublicationStatus(sellerId, productId, targetStatus);

    // ai.md — the AI quality-analysis trigger reacts to a product actually
    // going live, not to HIDDEN (or the DRAFT bootstrap transition, which
    // never reaches here — see createProduct).
    if (targetStatus === Status.PUBLISHED) {
      await this.events.publish({ type: "product.published", product: updated });
    }

    return updated;
  }

  private async assertCategoryExists(categoryId: string): Promise<void> {
    const category = await this.categories.getById(categoryId);
    if (!category) {
      throw new SellerProductValidationError("Category not found", "categoryId");
    }
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
