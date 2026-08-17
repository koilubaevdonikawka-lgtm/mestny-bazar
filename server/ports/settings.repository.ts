import type { PlatformSettingDTO, SettingValue } from "@shared/contracts/settings";

export interface ISettingsRepository {
  list(): Promise<PlatformSettingDTO[]>;
  get(key: string): Promise<PlatformSettingDTO | null>;
  set(
    key: string,
    value: SettingValue,
    category: string,
    updatedBy: string,
  ): Promise<PlatformSettingDTO>;
}
