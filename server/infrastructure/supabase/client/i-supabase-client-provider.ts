import type { SupabaseClient } from "@supabase/supabase-js";

/** Provides configured Supabase clients to infrastructure adapters. */
export interface ISupabaseClientProvider {
  getServiceClient(): SupabaseClient;
  getAnonClient(): SupabaseClient;
}
