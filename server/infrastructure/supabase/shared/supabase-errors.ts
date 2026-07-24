/** Raised when a Supabase query fails at the infrastructure boundary. */
export class SupabaseInfrastructureError extends Error {
  readonly code = "infrastructure.supabase_error";

  constructor(
    message: string,
    readonly details?: string,
  ) {
    super(details ? `${message}: ${details}` : message);
    this.name = "SupabaseInfrastructureError";
  }
}

/** Normalizes Supabase client errors into infrastructure exceptions. */
export function assertSupabaseSuccess<T>(
  label: string,
  result: { data: T; error: { message: string } | null },
): T {
  if (result.error) {
    throw new SupabaseInfrastructureError(label, result.error.message);
  }
  return result.data;
}
