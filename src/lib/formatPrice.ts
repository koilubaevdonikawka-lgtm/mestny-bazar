/**
 * Задача №179/№183 — whole-number display price ("1 сом", not "1.00 KGS"),
 * rounded defensively: production has no non-integer prices today, but
 * `price` is a plain `number` in the schema with no integer constraint, so
 * a future non-integer price rounds to the nearest whole number rather than
 * silently truncating or crashing. Shared by the catalog card (ProductCard)
 * and the cart (CartPanel) — deliberately still separate from formatMoney
 * (shared/lib/order-display.ts), which stays "1.00 KGS" for order-history/
 * admin/finance/courier/warehouse screens showing real transacted totals;
 * Задача №183 only extended the "N сом" format to the cart, not those.
 */
export function formatDisplayPrice(amount: number): string {
  return `${Math.round(amount)}`;
}
