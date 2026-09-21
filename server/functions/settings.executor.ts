import {
  ADMIN_CONTACT_PHONE_SETTING_KEY,
  CONTACT_TELEGRAM_SETTING_KEY,
  CONTACT_WHATSAPP_SETTING_KEY,
  DELIVERY_DESCRIPTION_SETTING_KEY,
  type PlatformSettingDTO,
  type PublicContactLinksDTO,
  type UpdateSettingRequest,
} from "@shared/contracts/settings";
import { normalizeTelegramLink, normalizeWhatsappLink } from "@shared/validation/contact-links";
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

/**
 * Задача №274 — buyer-facing, anonymous, same trust model as
 * executeListPublicDeliveryTariffs (delivery-tariff.executor.ts): exposes
 * only this one setting's value, never the whole settings table, so an
 * unauthenticated /info visit can't read any other admin-configured key.
 */
export async function executeGetPublicAdminContactPhone(): Promise<string | null> {
  const setting = await getServices().settingsService.get(ADMIN_CONTACT_PHONE_SETTING_KEY);
  return typeof setting?.value === "string" && setting.value.trim() ? setting.value : null;
}

/**
 * Задача №296 — same anonymous, single-key trust model as
 * executeGetPublicAdminContactPhone above: only the delivery description's
 * value leaves the settings table, blank/non-string → null (section hidden).
 */
export async function executeGetPublicDeliveryDescription(): Promise<string | null> {
  const setting = await getServices().settingsService.get(DELIVERY_DESCRIPTION_SETTING_KEY);
  return typeof setting?.value === "string" && setting.value.trim() ? setting.value : null;
}

/**
 * Задача №298 — same anonymous, key-scoped trust model as
 * executeGetPublicAdminContactPhone above: only these two keys' values leave
 * the settings table. Each value is normalized to an https URL (or null when
 * blank/unrecognizable), so nothing but a well-formed https link can ever reach
 * an href on the public page.
 */
export async function executeGetPublicContactLinks(): Promise<PublicContactLinksDTO> {
  const [telegram, whatsapp] = await Promise.all([
    getServices().settingsService.get(CONTACT_TELEGRAM_SETTING_KEY),
    getServices().settingsService.get(CONTACT_WHATSAPP_SETTING_KEY),
  ]);
  return {
    telegram: typeof telegram?.value === "string" ? normalizeTelegramLink(telegram.value) : null,
    whatsapp: typeof whatsapp?.value === "string" ? normalizeWhatsappLink(whatsapp.value) : null,
  };
}
