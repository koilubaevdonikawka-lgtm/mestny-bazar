/** Serializable JSON value — matches the column type (jsonb) and satisfies createServerFn's serializability check. */
export type SettingValue =
  string | number | boolean | null | SettingValue[] | { [key: string]: SettingValue };

export interface PlatformSettingDTO {
  key: string;
  value: SettingValue;
  category: string;
  updatedBy: string | null;
  updatedAt: string;
}

export interface UpdateSettingRequest {
  key: string;
  value: SettingValue;
  category: string;
}
