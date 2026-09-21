/**
 * Задача №298 — contact links the admin types in «Настройки» (Telegram,
 * WhatsApp) and the public /info page opens. Deliberately lenient: it accepts
 * the forms an owner actually pastes (full link, link without scheme, @username,
 * a phone number) and turns them into one https URL. Anything else returns null
 * — which also means a stored value can never become a `javascript:` or other
 * non-https href on the public page. Shared by the admin form (validation on
 * save) and the public reader (executeGetPublicContactLinks), so both agree.
 */

const TELEGRAM_HOSTS = /^(?:www\.)?(?:t\.me|telegram\.me)\//i;
const WHATSAPP_HOSTS =
  /^(?:www\.)?(?:wa\.me|api\.whatsapp\.com|chat\.whatsapp\.com|whatsapp\.com)\//i;

function stripScheme(raw: string): string | null {
  const match = /^(https?):\/\/(.*)$/i.exec(raw);
  if (match) return match[2];
  if (/^[a-z][a-z0-9+.-]*:/i.test(raw)) return null;
  return raw;
}

export function normalizeTelegramLink(raw: string): string | null {
  const value = raw.trim();
  if (!value || /\s/.test(value)) return null;
  const rest = stripScheme(value);
  if (rest === null) return null;
  if (TELEGRAM_HOSTS.test(rest) && rest.replace(TELEGRAM_HOSTS, "").length > 0) {
    return `https://${rest}`;
  }
  const username = /^@?([A-Za-z0-9_]{4,64})$/.exec(value);
  return username ? `https://t.me/${username[1]}` : null;
}

export function normalizeWhatsappLink(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;
  if (!/\s/.test(value)) {
    const rest = stripScheme(value);
    if (rest !== null && WHATSAPP_HOSTS.test(rest) && rest.replace(WHATSAPP_HOSTS, "").length > 0) {
      return `https://${rest}`;
    }
  }
  // A phone number: spaces, dashes, dots and brackets allowed, leading "+" optional.
  if (!/^\+?[\d\s().-]+$/.test(value)) return null;
  const digits = value.replace(/\D/g, "");
  // wa.me needs the international form (country code first, no leading 0).
  return /^[1-9]\d{6,14}$/.test(digits) ? `https://wa.me/${digits}` : null;
}
