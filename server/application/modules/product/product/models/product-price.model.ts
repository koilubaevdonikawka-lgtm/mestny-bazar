export interface ProductPrice {
  readonly amount: number;
  readonly currency: string;
}

const MIN_AMOUNT = 0.01;
const MAX_AMOUNT = 999_999_999;
const CURRENCY_PATTERN = /^[A-Z]{3}$/;

export function createProductPrice(amount: number, currency: string): ProductPrice {
  const normalizedCurrency = currency.trim().toUpperCase();
  if (
    !Number.isFinite(amount) ||
    amount < MIN_AMOUNT ||
    amount > MAX_AMOUNT ||
    !normalizedCurrency ||
    !CURRENCY_PATTERN.test(normalizedCurrency)
  ) {
    throw new Error("Invalid product price.");
  }

  return Object.freeze({
    amount: Number(amount.toFixed(2)),
    currency: normalizedCurrency,
  });
}

export function isValidPriceForPublication(price: ProductPrice): boolean {
  return price.amount >= MIN_AMOUNT;
}
