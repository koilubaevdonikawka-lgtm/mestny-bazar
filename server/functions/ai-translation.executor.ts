import type { TranslateTextRequest, TranslateTextResult } from "@shared/contracts/ai-provider";
import { requireAdminFromRequest } from "@server/auth/resolve-user";
import { getServices } from "@server/di/container";

const MODULE = "ai";

export async function executeTranslateText(
  request: TranslateTextRequest,
): Promise<TranslateTextResult> {
  const { userId, roles } = await requireAdminFromRequest();
  getServices().permissionPolicy.assert({ actor: { id: userId, roles }, module: MODULE });

  return getServices().aiTranslationService.translate(request);
}
