import type { ApiError } from "@shared/contracts/api";

export class PlatformApiError extends Error {
  constructor(
    public readonly apiError: ApiError,
    public readonly status: number = 400,
  ) {
    super(apiError.message);
    this.name = "PlatformApiError";
  }
}

/**
 * Single entry point for frontend → Platform Layer calls.
 * All data operations go through createServerFn wrappers in src/api/*.
 */
export const platformClient = {
  // Reserved for shared fetch helpers (auth headers, error normalization).
};
