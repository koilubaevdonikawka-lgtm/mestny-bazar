import { z } from "zod";

/**
 * Structural/transport bounds only — exact business minimums (fullName >= 2
 * chars, phone digit count) stay owned by ProfileService, the single source
 * of truth for those thresholds (same split as address.schema.ts).
 */
export const updateProfileRequestSchema = z.object({
  fullName: z.string().trim().max(200).optional(),
  phone: z.string().trim().max(30).optional(),
});
