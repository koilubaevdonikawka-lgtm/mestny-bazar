import type { MarketplaceModule } from "@server/application/modules/marketplace/marketplace/api/marketplace.module";
import type {
  IProductModule,
  ProductVerificationIssue,
  ProductVerificationResult,
} from "@server/application/modules/checkout/checkout/contracts";
import type { CheckoutCartLine } from "@server/application/modules/checkout/checkout/models";
import type {
  CreateProductDto,
  PublishProductDto,
  UpdateProductDto,
} from "@server/application/modules/product/product/dto";
import {
  type Product,
  type ProductPrice,
} from "@server/application/modules/product/product/models";
import type { ProductService } from "@server/application/modules/product/product/services";

/** Public entry point for the Product business capability module. */
export class ProductModule implements IProductModule {
  constructor(
    private readonly service: ProductService,
    private readonly marketplace: MarketplaceModule,
  ) {}

  createProduct(dto: CreateProductDto): Promise<Product> {
    return this.service.createProduct(dto);
  }

  updateProduct(dto: UpdateProductDto): Promise<Product> {
    return this.service.updateProduct(dto);
  }

  async publishProduct(dto: PublishProductDto): Promise<Product> {
    const product = await this.service.prepareForPublication(dto);
    await this.marketplace.publishListing({
      productId: product.id,
      sellerId: dto.sellerId,
    });
    return product;
  }

  getProduct(productId: string): Promise<Product | null> {
    return this.service.getProduct(productId);
  }

  exists(productId: string): Promise<boolean> {
    return this.service.exists(productId);
  }

  getCurrentPrice(productId: string): Promise<ProductPrice | null> {
    return this.service.getCurrentPrice(productId);
  }

  getAvailableStock(productId: string): Promise<number | null> {
    return this.service.getAvailableStock(productId);
  }

  async verifyProductsExist(lines: readonly CheckoutCartLine[]): Promise<ProductVerificationResult> {
    const issues: ProductVerificationIssue[] = [];

    for (const line of lines) {
      const product = await this.service.getProduct(line.productId);
      if (!product) {
        issues.push({
          productId: line.productId,
          message: "Product was not found.",
        });
        continue;
      }

      if (!(await this.marketplace.isPublished(line.productId))) {
        issues.push({
          productId: line.productId,
          message: "Product is not published.",
        });
      }
    }

    return verificationResult(issues);
  }

  async verifyStock(lines: readonly CheckoutCartLine[]): Promise<ProductVerificationResult> {
    const issues: ProductVerificationIssue[] = [];

    for (const line of lines) {
      const available = await this.service.getAvailableStock(line.productId);
      if (available === null || available < line.quantity) {
        issues.push({
          productId: line.productId,
          message: `Insufficient stock: requested ${line.quantity}, available ${available ?? 0}.`,
        });
      }
    }

    return verificationResult(issues);
  }

  async verifyPrices(_lines: readonly CheckoutCartLine[]): Promise<ProductVerificationResult> {
    return verificationResult([]);
  }
}

function verificationResult(issues: ProductVerificationIssue[]): ProductVerificationResult {
  return Object.freeze({
    valid: issues.length === 0,
    issues: Object.freeze([...issues]),
  });
}
