import { z } from "zod";

export const setCourierAvailabilityRequestSchema = z.object({
  isAvailable: z.boolean(),
});
