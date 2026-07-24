import { ApiValidationError } from "@server/api/errors/api.errors";
import type { SellerProductApplicationService } from "@server/application/seller-product/services/seller-product-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readNumber,
  readQueryString,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** Seller product management HTTP controller. */
export class SellerProductController {
  constructor(private readonly sellerProducts: SellerProductApplicationService) {}

  async create(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const sellerId = readString(body.sellerId);
    const name = readString(body.name);
    if (!sellerId) {
      throw new ApiValidationError({ sellerId: ["sellerId is required"] });
    }
    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }

    const priceAmount = readNumber(body.priceAmount);
    const stockQuantity = readNumber(body.stockQuantity);
    if (priceAmount === undefined || priceAmount <= 0) {
      throw new ApiValidationError({ priceAmount: ["priceAmount must be a positive number"] });
    }
    if (stockQuantity === undefined || stockQuantity < 0 || !Number.isInteger(stockQuantity)) {
      throw new ApiValidationError({ stockQuantity: ["stockQuantity must be a non-negative integer"] });
    }

    const result = await this.sellerProducts.createProduct({
      sellerId,
      name,
      description: readString(body.description),
      priceAmount,
      priceCurrency: readString(body.priceCurrency) ?? "KGS",
      stockQuantity,
      media: readMedia(body.media),
      attributes: readAttributes(body.attributes),
    });
    return createJsonResponse(context, result.value, 201);
  }

  async update(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const productId = this.requireProductId(context);
    const body = readRecordBody(context.body);
    const sellerId = readString(body.sellerId);
    if (!sellerId) {
      throw new ApiValidationError({ sellerId: ["sellerId is required"] });
    }

    const result = await this.sellerProducts.updateProduct({
      productId,
      sellerId,
      name: readString(body.name),
      description: body.description === null ? null : readString(body.description),
      media: readMedia(body.media),
      attributes: readAttributes(body.attributes),
    });
    return createJsonResponse(context, result.value);
  }

  async deleteProduct(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const productId = this.requireProductId(context);
    const body = readRecordBody(context.body);
    const sellerId = readString(body.sellerId);
    if (!sellerId) {
      throw new ApiValidationError({ sellerId: ["sellerId is required"] });
    }

    const result = await this.sellerProducts.deleteProduct({ productId, sellerId });
    return createJsonResponse(context, result.value);
  }

  async uploadImages(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const productId = this.requireProductId(context);
    const body = readRecordBody(context.body);
    const sellerId = readString(body.sellerId);
    const media = readMedia(body.media);
    if (!sellerId) {
      throw new ApiValidationError({ sellerId: ["sellerId is required"] });
    }
    if (!media?.length) {
      throw new ApiValidationError({ media: ["At least one image is required"] });
    }

    const result = await this.sellerProducts.uploadImages({ productId, sellerId, media });
    return createJsonResponse(context, result.value);
  }

  async changePrice(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const productId = this.requireProductId(context);
    const body = readRecordBody(context.body);
    const sellerId = readString(body.sellerId);
    const amount = readNumber(body.amount);
    if (!sellerId) {
      throw new ApiValidationError({ sellerId: ["sellerId is required"] });
    }
    if (amount === undefined || amount <= 0) {
      throw new ApiValidationError({ amount: ["amount must be a positive number"] });
    }

    const result = await this.sellerProducts.changePrice({
      productId,
      sellerId,
      amount,
      currency: readString(body.currency) ?? "KGS",
    });
    return createJsonResponse(context, result.value);
  }

  async changeInventory(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const productId = this.requireProductId(context);
    const body = readRecordBody(context.body);
    const sellerId = readString(body.sellerId);
    const quantity = readNumber(body.quantity);
    if (!sellerId) {
      throw new ApiValidationError({ sellerId: ["sellerId is required"] });
    }
    if (quantity === undefined || quantity < 0 || !Number.isInteger(quantity)) {
      throw new ApiValidationError({ quantity: ["quantity must be a non-negative integer"] });
    }

    const result = await this.sellerProducts.changeInventory({ productId, sellerId, quantity });
    return createJsonResponse(context, result.value);
  }

  async submit(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const productId = this.requireProductId(context);
    const body = readRecordBody(context.body);
    const sellerId = readString(body.sellerId);
    if (!sellerId) {
      throw new ApiValidationError({ sellerId: ["sellerId is required"] });
    }

    const result = await this.sellerProducts.submitForModeration({ productId, sellerId });
    return createJsonResponse(context, result.value);
  }

  async approve(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const productId = this.requireProductId(context);
    const result = await this.sellerProducts.approveProduct(productId);
    return createJsonResponse(context, result.value);
  }

  async reject(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const productId = this.requireProductId(context);
    const body = readRecordBody(context.body);
    const reason = readString(body.reason);
    if (!reason) {
      throw new ApiValidationError({ reason: ["reason is required"] });
    }

    const result = await this.sellerProducts.rejectProduct({ productId, reason });
    return createJsonResponse(context, result.value);
  }

  async publish(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const productId = this.requireProductId(context);
    const body = readRecordBody(context.body);
    const sellerId = readString(body.sellerId);
    if (!sellerId) {
      throw new ApiValidationError({ sellerId: ["sellerId is required"] });
    }

    const result = await this.sellerProducts.publishProduct({ productId, sellerId });
    return createJsonResponse(context, result.value);
  }

  async unpublish(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const productId = this.requireProductId(context);
    const body = readRecordBody(context.body);
    const sellerId = readString(body.sellerId);
    if (!sellerId) {
      throw new ApiValidationError({ sellerId: ["sellerId is required"] });
    }

    const result = await this.sellerProducts.unpublishProduct({ productId, sellerId });
    return createJsonResponse(context, result.value);
  }

  async archive(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const productId = this.requireProductId(context);
    const body = readRecordBody(context.body);
    const sellerId = readString(body.sellerId);
    if (!sellerId) {
      throw new ApiValidationError({ sellerId: ["sellerId is required"] });
    }

    const result = await this.sellerProducts.archiveProduct({ productId, sellerId });
    return createJsonResponse(context, result.value);
  }

  async list(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const sellerId = readQueryString(context.query, "sellerId");
    if (!sellerId?.trim()) {
      throw new ApiValidationError({ sellerId: ["sellerId query parameter is required"] });
    }

    const result = await this.sellerProducts.getSellerProducts(sellerId);
    return createJsonResponse(context, result.value);
  }

  private requireProductId(context: ApiRequestContext): string {
    const productId = context.params.id;
    if (!productId?.trim()) {
      throw new ApiValidationError({ id: ["Product id is required"] });
    }
    return productId;
  }
}

function readMedia(value: unknown) {
  if (!Array.isArray(value)) {
    return undefined;
  }

  return value
    .map((item, index) => {
      if (typeof item === "string") {
        return Object.freeze({ url: item, sortOrder: index });
      }
      if (typeof item === "object" && item !== null) {
        const record = item as Record<string, unknown>;
        const url = readString(record.url);
        if (!url) {
          return null;
        }
        return Object.freeze({
          id: readString(record.id),
          url,
          sortOrder: readNumber(record.sortOrder) ?? index,
        });
      }
      return null;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
}

function readAttributes(value: unknown): Readonly<Record<string, string>> | undefined {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return undefined;
  }

  const attributes: Record<string, string> = {};
  for (const [key, raw] of Object.entries(value)) {
    if (typeof raw === "string") {
      attributes[key] = raw;
    }
  }
  return Object.keys(attributes).length > 0 ? attributes : undefined;
}
