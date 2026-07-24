import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { ISupabaseClientProvider } from "@server/infrastructure/supabase/client/i-supabase-client-provider";
import type { SupabaseConfiguration } from "@server/infrastructure/supabase/configuration";

function isNewSupabaseApiKey(value: string): boolean {
  return value.startsWith("sb_publishable_") || value.startsWith("sb_secret_");
}

function createSupabaseFetch(supabaseKey: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined,
    );

    if (init?.headers) {
      new Headers(init.headers).forEach((value, key) => headers.set(key, value));
    }

    if (isNewSupabaseApiKey(supabaseKey) && headers.get("Authorization") === `Bearer ${supabaseKey}`) {
      headers.delete("Authorization");
    }

    headers.set("apikey", supabaseKey);
    return fetch(input, { ...init, headers });
  };
}

function createConfiguredClient(url: string, key: string, timeoutMs: number): SupabaseClient {
  return createClient(url, key, {
    global: {
      fetch: createSupabaseFetch(key),
      headers: {
        "X-Client-Info": "marketplace-infrastructure",
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: "public",
    },
  });
}

/** Encapsulates Supabase client creation for infrastructure adapters. */
export class SupabaseClientProvider implements ISupabaseClientProvider {
  private serviceClient: SupabaseClient | null = null;
  private anonClient: SupabaseClient | null = null;

  constructor(private readonly configuration: SupabaseConfiguration) {
    Object.freeze(this);
  }

  getServiceClient(): SupabaseClient {
    if (!this.serviceClient) {
      this.serviceClient = createConfiguredClient(
        this.configuration.url,
        this.configuration.serviceRoleKey,
        this.configuration.timeoutMs,
      );
    }
    return this.serviceClient;
  }

  getAnonClient(): SupabaseClient {
    if (!this.anonClient) {
      this.anonClient = createConfiguredClient(
        this.configuration.url,
        this.configuration.anonKey,
        this.configuration.timeoutMs,
      );
    }
    return this.anonClient;
  }
}

export type { ISupabaseClientProvider } from "@server/infrastructure/supabase/client/i-supabase-client-provider";
