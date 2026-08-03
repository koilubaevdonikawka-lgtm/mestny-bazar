import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

/**
 * Single source of truth for where Google OAuth should return the user:
 * the exact page they clicked "Войти" from. Call sites must never compute
 * this themselves (window.location.origin alone, without the pathname,
 * silently drops the user's page and sends them back to "/").
 */
export function getAuthRedirectUrl(): string {
  return window.location.origin + window.location.pathname;
}

/**
 * Every "Войти" button across the app called this directly and discarded its
 * return value. supabase.auth.signInWithOAuth resolves with { error } (not a
 * rejected promise) on failure — popup blocked, user closed it, network
 * error, provider outage — so those failures produced zero feedback: the
 * button visibly did nothing. Centralized here so the fix isn't duplicated
 * (and isn't missed) across all call sites.
 */
export async function signInWithGoogle(): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: getAuthRedirectUrl() },
  });
  if (error) {
    toast.error("Не удалось войти. Попробуйте ещё раз.");
  }
}
