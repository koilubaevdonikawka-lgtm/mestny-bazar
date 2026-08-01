import type { PlatformSettingDTO, UpdateSettingRequest } from "@shared/contracts/settings";
import { getSettingFn, listSettingsFn, updateSettingFn } from "@/api/settings.functions";

export async function listSettings(): Promise<PlatformSettingDTO[]> {
  return listSettingsFn();
}

export async function getSetting(key: string): Promise<PlatformSettingDTO | null> {
  return getSettingFn({ data: { key } });
}

export async function updateSetting(request: UpdateSettingRequest): Promise<PlatformSettingDTO> {
  return updateSettingFn({ data: request });
}
