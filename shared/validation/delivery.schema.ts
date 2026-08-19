import { z } from "zod";
import { DeliveryPricingModel, DeliveryTariffType } from "@shared/contracts/delivery";

/** Structural/transport bounds only — business minimums stay owned by the domain services. */
export const createDeliveryZoneRequestSchema = z.object({
  cityId: z.string().uuid(),
  storeId: z.string().uuid().nullable().optional(),
  name: z.string().trim().min(1).max(200),
  sortOrder: z.number().int().min(0).max(100_000).optional(),
  isActive: z.boolean().optional(),
});

export const updateDeliveryZoneRequestSchema = createDeliveryZoneRequestSchema
  .partial()
  .extend({ id: z.string().uuid() });

export const createStoreRequestSchema = z.object({
  cityId: z.string().uuid(),
  name: z.string().trim().min(1).max(200),
  address: z.string().trim().min(1).max(500),
  lat: z.number().min(-90).max(90).nullable().optional(),
  lng: z.number().min(-180).max(180).nullable().optional(),
  isActive: z.boolean().optional(),
});

export const updateStoreRequestSchema = createStoreRequestSchema
  .partial()
  .extend({ id: z.string().uuid() });

const tariffTypeSchema = z.enum([
  DeliveryTariffType.STANDARD,
  DeliveryTariffType.HOLIDAY,
  DeliveryTariffType.CORPORATE,
  DeliveryTariffType.PROMOTIONAL,
]);

const pricingModelSchema = z.enum([
  DeliveryPricingModel.FIXED,
  DeliveryPricingModel.BY_ZONE,
  DeliveryPricingModel.BY_DISTANCE,
]);

export const createDeliveryTariffRequestSchema = z.object({
  zoneId: z.string().uuid().nullable().optional(),
  name: z.string().trim().min(1).max(200),
  tariffType: tariffTypeSchema.optional(),
  pricingModel: pricingModelSchema.optional(),
  basePrice: z.number().min(0),
  pricePerKm: z.number().min(0).nullable().optional(),
  minOrderForFreeDelivery: z.number().min(0).nullable().optional(),
  minOrderAmount: z.number().min(0).nullable().optional(),
  etaMinMinutes: z.number().int().min(0).nullable().optional(),
  etaMaxMinutes: z.number().int().min(0).nullable().optional(),
  validFrom: z.string().nullable().optional(),
  validTo: z.string().nullable().optional(),
  priority: z.number().int().min(0).max(1000).optional(),
  isActive: z.boolean().optional(),
});

export const updateDeliveryTariffRequestSchema = createDeliveryTariffRequestSchema
  .partial()
  .extend({ id: z.string().uuid() });

/** Mirrors createOrderItemRequestSchema's identification shape (order.schema.ts) — no snapshot/variantId needed here, only enough to resolve each product's real weightKg server-side. */
const deliveryFeeItemRequestSchema = z.object({
  quantity: z.number().int().min(1).max(999),
  productId: z.string().trim().min(1).max(200).optional(),
  productSlug: z.string().trim().min(1).max(200).optional(),
});

export const calculateDeliveryFeeRequestSchema = z.object({
  zoneId: z.string().uuid(),
  subtotal: z.number().min(0),
  items: z.array(deliveryFeeItemRequestSchema).max(100).optional(),
});

export const previewDeliveryFeeRequestSchema = calculateDeliveryFeeRequestSchema.extend({
  orderDate: z.string().optional(),
});
