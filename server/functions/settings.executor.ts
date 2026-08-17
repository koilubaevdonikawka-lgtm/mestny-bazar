import type { PlatformSettingDTO, UpdateSettingRequest } from "@shared/contracts/settings";
import { requireAdminFromRequest } from "@server/auth/resolve-user";
import { getServices } from "@server/di/container";

const MODULE = "settings";

export async function executeListSettings(): Promise<PlatformSettingDTO[]> {
  const { userId, roles } = await requireAdminFromRequest();
  getServices().permissionPolicy.assert({ actor: { id: userId, roles }, module: MODULE });
  return getServices().settingsService.list();
}

export async function executeGetSetting(key: string): Promise<PlatformSettingDTO | null> {
  const { userId, roles } = await requireAdminFromRequest();
  getServices().permissionPolicy.assert({ actor: { id: userId, roles }, module: MODULE });
  return getServices().settingsService.get(key);
}

export async function executeUpdateSetting(
  request: UpdateSettingRequest,
): Promise<PlatformSettingDTO> {
  const { userId, roles } = await requireAdminFromRequest();
  getServices().permissionPolicy.assert({ actor: { id: userId, roles }, module: MODULE });
  return getServices().settingsService.update(userId, request);
}
