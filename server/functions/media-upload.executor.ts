import { requireAdminFromRequest, requireSellerFromRequest } from "@server/auth/resolve-user";
import { requireModulePermission } from "@server/auth/require-module-permission";
import { assertMarketingAccess } from "@server/auth/assert-marketing-access";
import { getServices } from "@server/di/container";
import { MediaUploadContext, type UploadImageResponse } from "@shared/contracts/media-upload";
import type { UploadImageInput } from "@server/domain/media-upload.service";
import { ForbiddenError } from "@server/domain/orders.errors";
import { RateLimitPolicy } from "@server/domain/rate-limit.service";
import { enforceRateLimit } from "@server/functions/rate-limit.guard";

/**
 * Per-context gating mirrors what each existing module's own executor
 * already does today, with one deliberate exception: PRODUCT accepts admin
 * OR seller (Промпт №105 — product decision by the owner: while the
 * marketplace is run by a single seller who is also the admin, requiring a
 * separate seller role just to upload a product photo is unnecessary
 * friction — product-admin.executor.ts already lets admin alone create/edit
 * every other field of the same product, so photo upload was the one
 * desynchronized exception). Genuine seller accounts keep working exactly
 * as before — admin is an added alternative path, not a replacement; only a
 * caller with neither role is rejected.
 */
async function authorizeUploadContext(context: UploadImageInput["context"]): Promise<string> {
  if (context === MediaUploadContext.PRODUCT) {
    try {
      return (await requireAdminFromRequest()).userId;
    } catch (error) {
      // Not authenticated at all — propagate as-is (401), no point retrying
      // the seller check with the same missing/invalid token. Only a
      // same-user "you have neither role" (ForbiddenError) falls through to
      // the seller check.
      if (!(error instanceof ForbiddenError)) throw error;
      return (await requireSellerFromRequest()).userId;
    }
  }

  const { userId, roles } = await requireAdminFromRequest();

  if (context === MediaUploadContext.BANNER) {
    await assertMarketingAccess(userId, roles);
    return userId;
  }

  if (context === MediaUploadContext.COURIER) {
    await requireModulePermission(userId, "couriers", "edit");
  }
  // category: requireAdminFromRequest() alone, matching category-admin.executor.ts.
  return userId;
}

export async function executeUploadImage(input: UploadImageInput): Promise<UploadImageResponse> {
  // Задача №288 — IP counter before any auth call; per-account counters
  // (and the extra paid-Gemini cap on the AI branch) once the caller is known.
  await enforceRateLimit(RateLimitPolicy.MEDIA_UPLOAD);
  const userId = await authorizeUploadContext(input.context);
  await enforceRateLimit(RateLimitPolicy.MEDIA_UPLOAD, { userId, countIp: false });
  if (input.context === MediaUploadContext.PRODUCT && !input.skipAiProcessing) {
    await enforceRateLimit(RateLimitPolicy.MEDIA_UPLOAD_AI, { userId, countIp: false });
  }
  return getServices().mediaUploadService.uploadImage(input);
}
