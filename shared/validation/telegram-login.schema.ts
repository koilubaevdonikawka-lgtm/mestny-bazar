import { z } from "zod";

/**
 * Structural/transport bounds only — the real security check (HMAC over
 * these exact fields) happens server-side in
 * server/domain/telegram-login/verify-telegram-login-payload.ts. This only
 * rejects a structurally malformed request before it ever reaches that
 * check, same convention as every other schema in this file's siblings.
 */
export const telegramLoginPayloadSchema = z.object({
  id: z.number().int().positive(),
  first_name: z.string().trim().min(1).max(200),
  last_name: z.string().trim().max(200).optional(),
  username: z.string().trim().max(200).optional(),
  photo_url: z.string().trim().url().max(2000).optional(),
  auth_date: z.number().int().positive(),
  hash: z
    .string()
    .trim()
    .regex(/^[0-9a-f]{64}$/i, "hash must be a 64-char hex HMAC-SHA256 digest"),
});
