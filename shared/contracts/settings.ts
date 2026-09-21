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

/**
 * Задача №296 — free-text delivery description shown to customers on /info,
 * edited in the admin "Доставка" section. Same shape and trust model as
 * ADMIN_CONTACT_PHONE_SETTING_KEY above (multi-line string; blank = section
 * hidden), shared by the admin write path and the public read path.
 */
export const DELIVERY_DESCRIPTION_SETTING_KEY = "delivery_description";
export const DELIVERY_DESCRIPTION_SETTING_CATEGORY = "delivery";
