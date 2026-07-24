const MIN_AMOUNT = 0.01;
const MAX_AMOUNT = 999_999_999;
const CURRENCY_PATTERN = /^[A-Z]{3}$/;

/** Product price owned by the Pricing capability module. */
export interface Price {
  readonly id: string;
  readonly productId: string;
  readonly amount: number;
  readonly currency: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface PriceAmount {
  readonly amount: number;
  readonly currency: string;
}

export function createPrice(input: {
  id: string;
  productId: string;
  amount: number;
  currency: string;
}): Price {
  const normalized = normalizePriceAmount(input.amount, input.currency);
  const timestamp = new Date().toISOString();

  return Object.freeze({
    id: input.id.trim(),
    productId: input.productId.trim(),
    amount: normalized.amount,
    currency: normalized.currency,
    createdAt: timestamp,
    updatedAt: timestamp,
  });
}

export function updatePriceAmount(price: Price, amount: number, currency: string): Price {
  const normalized = normalizePriceAmount(amount, currency);

  return Object.freeze({
    ...price,
    amount: normalized.amount,
    currency: normalized.currency,
    updatedAt: new Date().toISOString(),
  });
}

export function toPriceAmount(price: Price): PriceAmount {
  return Object.freeze({
    amount: price.amount,
    currency: price.currency,
  });
}

export function normalizePriceAmount(amount: number, currency: string): PriceAmount {
  const normalizedCurrency = currency.trim().toUpperCase();
  if (
    !Number.isFinite(amount) ||
    amount < MIN_AMOUNT ||
    amount > MAX_AMOUNT ||
    !normalizedCurrency ||
    !CURRENCY_PATTERN.test(normalizedCurrency)
  ) {
    throw new Error("Invalid price amount.");
  }

  return Object.freeze({
    amount: Number(amount.toFixed(2)),
    currency: normalizedCurrency,
  });
}

export function isValidPriceForPublication(price: PriceAmount): boolean {
  return price.amount >= MIN_AMOUNT;
}
