import { requireAdminFromRequest, requireSellerFromRequest } from "@server/auth/resolve-user";
import { requireModulePermission } from "@server/auth/require-module-permission";
import { getServices } from "@server/di/container";
import { MediaUploadContext, type UploadImageResponse } from "@shared/contracts/media-upload";
import type { UploadImageInput } from "@server/domain/media-upload.service";

const MODULE = "design";

/**
 * Per-context gating mirrors exactly what each existing module's own
 * executor already does today — no new restriction invented for
 * category/banner/product; only the courier context (new in this pass) gets
 * the new fine-grained RBAC check.
 */
async function authorizeUploadContext(context: UploadImageInput["context"]): Promise<void> {
  if (context === MediaUploadContext.PRODUCT) {
    await requireSellerFromRequest();
    return;
  }

  const { userId, roles } = await requireAdminFromRequest();

  if (context === MediaUploadContext.BANNER) {
    getServices().permissionPolicy.assert({ actor: { id: userId, roles }, module: MODULE });
    return;
  }

  if (context === MediaUploadContext.COURIER) {
    await requireModulePermission(userId, "couriers", "edit");
  }
  // category: requireAdminFromRequest() alone, matching category-admin.executor.ts.
}

export async function executeUploadImage(input: UploadImageInput): Promise<UploadImageResponse> {
  await authorizeUploadContext(input.context);
  return getServices().mediaUploadService.uploadImage(input);
}
