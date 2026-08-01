import { z } from "zod";
import { pageSchema, pageSizeSchema } from "./common.schema";

const paymentMethodSchema = z.enum(["ONLINE", "CASH"]);

/** Present in the CreateOrderItemRequest type but never read by any domain
 * service today (checkout.service.ts's resolveLineItems only uses
 * productId/productSlug/quantity) — still validated so a caller including it
 * isn't rejected, matching the current lenient (ignored) behavior. */
const createOrderItemSnapshotSchema = z.object({
  name: z.string().trim().min(1).max(200),
  price: z.number().finite().min(0).max(10_000_000),
  currency: z.string().trim().min(1).max(10).optional(),
  imageUrl: z.string().trim().max(2000).nullable().optional(),
});

const createOrderItemRequestSchema = z.object({
  quantity: z.number().int().min(1).max(999),
  productId: z.string().trim().min(1).max(200).optional(),
  productSlug: z.string().trim().min(1).max(200).optional(),
  snapshot: createOrderItemSnapshotSchema.optional(),
});

/**
 * Structural/transport bounds only — exact business minimums (customerName
 * >= 2 chars, phone digit count, address snapshot >= 5 chars when required)
 * stay owned by CheckoutService.validateRequest, the single source of truth
 * for those thresholds. The array cap on items is new: nothing previously
 * bounded cart size, letting a request build an arbitrarily large IN-clause
 * against the product table and an arbitrarily large stock-reservation batch.
 */
export const createOrderRequestSchema = z.object({
  items: z.array(createOrderItemRequestSchema).min(1).max(100),
  addressId: z.string().uuid().optional(),
  addressSnapshot: z.string().trim().max(500).optional(),
  zoneId: z.string().uuid().optional(),
  customerName: z.string().trim().min(1).max(200),
  customerPhone: z.string().trim().min(1).max(30),
  paymentMethod: paymentMethodSchema,
  notes: z.string().trim().max(2000).optional(),
  idempotencyKey: z.string().trim().min(1).max(200),
  couponCode: z.string().trim().min(1).max(50).optional(),
});

export const orderListParamsSchema = z
  .object({
    page: pageSchema.optional(),
    pageSize: pageSizeSchema.optional(),
  })
  .optional();
