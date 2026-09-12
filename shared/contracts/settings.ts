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

/**
 * Задача №274 — admin's own contact phone(s), shown to customers on /info.
 * Shared by the admin settings page (write) and the public read path
 * (executeGetPublicAdminContactPhone) so the two can never drift apart —
 * same reason FINIK_WEBHOOK_PATH/TELEGRAM_WEBHOOK_PATH are shared constants.
 * Free-form text (not an array): may hold one number or several, one per
 * line — the admin's own call, not a structured phone-list UI.
 */
export const ADMIN_CONTACT_PHONE_SETTING_KEY = "admin_contact_phone";
export const ADMIN_CONTACT_PHONE_SETTING_CATEGORY = "contact";
