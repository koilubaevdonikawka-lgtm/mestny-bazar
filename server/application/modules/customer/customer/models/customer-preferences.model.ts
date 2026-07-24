/**
 * User preference snapshot owned by the Customer capability module.
 * Separated from core profile data for Recommendation Engine, Experience Engine,
 * AI Personalization, and Loyalty BCM integration.
 */
export interface CustomerPreferences {
  readonly entries: Readonly<Record<string, string>>;
}

/** Runtime shape keeps flat key access for backward-compatible consumers. */
export type CustomerPreferencesSnapshot = CustomerPreferences & Readonly<Record<string, string>>;

export function createCustomerPreferences(
  entries: Readonly<Record<string, string>> = {},
): CustomerPreferencesSnapshot {
  const frozenEntries = Object.freeze({ ...entries });
  return Object.freeze({
    entries: frozenEntries,
    ...frozenEntries,
  }) as CustomerPreferencesSnapshot;
}

export function updateCustomerPreferences(
  current: CustomerPreferences,
  entries: Readonly<Record<string, string>>,
): CustomerPreferencesSnapshot {
  return createCustomerPreferences({ ...current.entries, ...entries });
}

export function normalizeCustomerPreferences(
  value: CustomerPreferences | Readonly<Record<string, string>> | undefined,
): CustomerPreferencesSnapshot {
  if (!value) {
    return createCustomerPreferences();
  }

  if ("entries" in value && typeof value.entries === "object") {
    return createCustomerPreferences(value.entries);
  }

  return createCustomerPreferences(value as Readonly<Record<string, string>>);
}
