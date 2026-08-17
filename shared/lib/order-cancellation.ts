/**
 * Single source of truth for the customer self-cancellation window, shared by
 * the server rule (server/domain/order-lifecycle/rules/customer-cancel-order.rule.ts)
 * and the frontend countdown (CancelOrderButton). The server is always the
 * one that decides — these are pure functions of order.createdAt and a "now"
 * timestamp, never a client-held elapsed timer.
 */
export const CUSTOMER_CANCELLATION_WINDOW_MS = 2 * 60 * 1000;

/** Milliseconds left in the window, clamped to >= 0. */
export function getCancellationRemainingMs(createdAt: string, now: number = Date.now()): number {
  const deadline = new Date(createdAt).getTime() + CUSTOMER_CANCELLATION_WINDOW_MS;
  return Math.max(0, deadline - now);
}

export function isWithinCancellationWindow(createdAt: string, now: number = Date.now()): boolean {
  return getCancellationRemainingMs(createdAt, now) > 0;
}

/** Formats remaining milliseconds as "M:SS" (e.g. "2:00", "0:37", "0:00"). */
export function formatCountdown(remainingMs: number): string {
  const totalSeconds = Math.ceil(Math.max(0, remainingMs) / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
