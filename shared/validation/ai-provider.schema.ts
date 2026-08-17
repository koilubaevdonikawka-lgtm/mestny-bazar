import { z } from "zod";

export const translateTextRequestSchema = z.object({
  text: z.string().trim().min(1).max(5000),
  targetLanguage: z.string().trim().min(1).max(35),
  sourceLanguage: z.string().trim().min(1).max(35).optional(),
});
