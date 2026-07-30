import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

/**
 * Every "Войти" button across the app called this directly and discarded its
 * return value. supabase.auth.signInWithOAuth resolves with { error } (not a
 * rejected promise) on failure — popup blocked, user closed it, network
 * error, provider outage — so those failures produced zero feedback: the
 * button visibly did nothing. Centralized here so the fix isn't duplicated
 * (and isn't missed) across all call sites.
 */
export async function signInWithGoogle(redirectUri: string): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: redirectUri },
  });
  if (error) {
    toast.error("Не удалось войти. Попробуйте ещё раз.");
  }
}
