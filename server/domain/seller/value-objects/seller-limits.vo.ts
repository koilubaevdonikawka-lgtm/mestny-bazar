import { InvalidSellerLimitsError } from "@server/domain/seller/exceptions/seller.errors";
import type { ValueObject } from "@server/domain/seller/value-objects/value-object.types";

export interface SellerLimitsJSON {
  maxProducts: number;
  maxPublishedProducts: number;
  maxImagesPerProduct: number;
  maxCategories: number;
  extensions: Record<string, number>;
}

const DEFAULT_LIMITS: SellerLimitsJSON = {
  maxProducts: 100,
  maxPublishedProducts: 50,
  maxImagesPerProduct: 10,
  maxCategories: 5,
  extensions: {},
};

export class SellerLimits implements ValueObject<SellerLimits, SellerLimitsJSON> {
  private constructor(private readonly limits: SellerLimitsJSON) {}

  static default(): SellerLimits {
    return SellerLimits.from(DEFAULT_LIMITS);
  }

  static create(input: Partial<SellerLimitsJSON>): SellerLimits {
    return SellerLimits.from({
      ...DEFAULT_LIMITS,
      ...input,
      extensions: { ...DEFAULT_LIMITS.extensions, ...(input.extensions ?? {}) },
    });
  }

  static from(json: SellerLimitsJSON): SellerLimits {
    const values = [
      json.maxProducts,
      json.maxPublishedProducts,
      json.maxImagesPerProduct,
      json.maxCategories,
    ];
    if (values.some((value) => !Number.isInteger(value) || value < 0)) {
      throw new InvalidSellerLimitsError("Limit values must be non-negative integers");
    }

    const extensions = json.extensions ?? {};
    for (const [key, value] of Object.entries(extensions)) {
      if (!key.trim() || !Number.isInteger(value) || value < 0) {
        throw new InvalidSellerLimitsError(`Invalid extension limit: ${key}`);
      }
    }

    return new SellerLimits(
      Object.freeze({
        maxProducts: json.maxProducts,
        maxPublishedProducts: json.maxPublishedProducts,
        maxImagesPerProduct: json.maxImagesPerProduct,
        maxCategories: json.maxCategories,
        extensions: Object.freeze({ ...extensions }),
      }),
    );
  }

  valueOf(): SellerLimitsJSON {
    return this.toJSON();
  }

  maxProductsValue(): number {
    return this.limits.maxProducts;
  }

  maxPublishedProductsValue(): number {
    return this.limits.maxPublishedProducts;
  }

  maxImagesPerProductValue(): number {
    return this.limits.maxImagesPerProduct;
  }

  maxCategoriesValue(): number {
    return this.limits.maxCategories;
  }

  extensionLimit(key: string): number | undefined {
    return this.limits.extensions[key];
  }

  canAddProduct(currentCount: number): boolean {
    return currentCount < this.limits.maxProducts;
  }

  canPublishProduct(currentPublishedCount: number): boolean {
    return currentPublishedCount < this.limits.maxPublishedProducts;
  }

  canAddImage(currentImageCount: number): boolean {
    return currentImageCount < this.limits.maxImagesPerProduct;
  }

  canUseCategory(currentCategoryCount: number): boolean {
    return currentCategoryCount < this.limits.maxCategories;
  }

  equals(other: SellerLimits): boolean {
    return JSON.stringify(this.toJSON()) === JSON.stringify(other.toJSON());
  }

  toJSON(): SellerLimitsJSON {
    return Object.freeze({
      maxProducts: this.limits.maxProducts,
      maxPublishedProducts: this.limits.maxPublishedProducts,
      maxImagesPerProduct: this.limits.maxImagesPerProduct,
      maxCategories: this.limits.maxCategories,
      extensions: Object.freeze({ ...this.limits.extensions }),
    });
  }

  clone(): SellerLimits {
    return SellerLimits.from(this.toJSON());
  }
}
