export const SYSTEM_SETTINGS_ID = "system";

/** Platform-wide system settings owned by Administration. */
export interface SystemSettings {
  readonly id: typeof SYSTEM_SETTINGS_ID;
  readonly platformName: string;
  readonly supportEmail: string;
  readonly defaultLocale: string;
  readonly defaultCurrency: string;
  readonly updatedAt: string;
  readonly updatedBy: string;
}

export function createDefaultSystemSettings(updatedBy = "system"): SystemSettings {
  const timestamp = new Date().toISOString();
  return Object.freeze({
    id: SYSTEM_SETTINGS_ID,
    platformName: "Местный Базар",
    supportEmail: "support@localbazaar.example",
    defaultLocale: "ru-KG",
    defaultCurrency: "KGS",
    updatedAt: timestamp,
    updatedBy,
  });
}

export function withSystemSettingsUpdate(
  settings: SystemSettings,
  input: {
    platformName?: string;
    supportEmail?: string;
    defaultLocale?: string;
    defaultCurrency?: string;
    updatedBy: string;
  },
): SystemSettings {
  return Object.freeze({
    ...settings,
    platformName: input.platformName?.trim() || settings.platformName,
    supportEmail: input.supportEmail?.trim() || settings.supportEmail,
    defaultLocale: input.defaultLocale?.trim() || settings.defaultLocale,
    defaultCurrency: input.defaultCurrency?.trim() || settings.defaultCurrency,
    updatedAt: new Date().toISOString(),
    updatedBy: input.updatedBy.trim(),
  });
}
