import { z } from "zod";
import type { SettingValue } from "@shared/contracts/settings";

/** Structural bounds only — matches the pattern in address.schema.ts/order.schema.ts. */
export const settingKeySchema = z.object({ key: z.string().trim().min(1).max(200) }).strict();

// Business setting values are intentionally open-shaped (a single row can hold
// a string, number, boolean, or nested object depending on what it configures)
// — validated at read time by whichever domain service consumes a given key,
// not here. This schema only bounds the transport envelope to valid JSON.
const settingValueSchema: z.ZodType<SettingValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(settingValueSchema),
    z.record(z.string(), settingValueSchema),
  ]),
);

export const updateSettingRequestSchema = z.object({
  key: z.string().trim().min(1).max(200),
  value: settingValueSchema,
  category: z.string().trim().min(1).max(100),
});
