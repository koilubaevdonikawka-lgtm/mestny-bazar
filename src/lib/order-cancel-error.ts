import type { TranslationKey } from "@/i18n/t";

const CANCEL_ERROR_KEYS: Record<string, TranslationKey> = {
  CANCELLATION_WINDOW_EXPIRED: "orders.cancelWindowExpired",
  ORDER_ALREADY_IN_PROGRESS: "orders.cancelAlreadyInProgress",
};

/** Maps a customer-cancel failure (CustomerCancelOrderRule denial codes) to a user-facing message — shared by the order detail page and order-success. */
export function formatCancelError(error: unknown, t: (key: TranslationKey) => string): string {
  if (error instanceof Error) {
    for (const [code, key] of Object.entries(CANCEL_ERROR_KEYS)) {
      if (error.message.includes(code)) return t(key);
    }
  }
  return t("orders.cancelGenericError");
}
