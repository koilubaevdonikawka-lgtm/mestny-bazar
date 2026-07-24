/** Runtime health snapshot for an external provider. */
export interface ProviderHealth {
  readonly providerId: string;
  readonly status: "healthy" | "degraded" | "unavailable";
  readonly checkedAt: string;
  readonly message?: string;
}

export function createProviderHealth(input: {
  providerId: string;
  status: ProviderHealth["status"];
  message?: string;
}): ProviderHealth {
  return Object.freeze({
    providerId: input.providerId.trim(),
    status: input.status,
    checkedAt: new Date().toISOString(),
    message: input.message?.trim() || undefined,
  });
}
