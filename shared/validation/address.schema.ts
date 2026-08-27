import { z } from "zod";

/**
 * Structural/transport bounds only (required-ness, max length, types) — the
 * business-rule minimum length for fullAddress stays owned by
 * AddressService.validateFullAddress, the single source of truth for that
 * threshold, so it isn't duplicated here.
 */
export const createAddressRequestSchema = z.object({
  label: z.string().trim().max(100).optional(),
  fullAddress: z.string().trim().min(1).max(500),
  city: z.string().trim().max(100).optional(),
  district: z.string().trim().max(100).optional(),
  notes: z.string().trim().max(1000).optional(),
  zoneId: z.string().uuid().optional(),
  /** Задача №182 — set together via the map picker, or omitted (manually typed address). */
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  isDefault: z.boolean().optional(),
});

export const updateAddressRequestSchema = createAddressRequestSchema.partial().extend({
  id: z.string().uuid(),
});
