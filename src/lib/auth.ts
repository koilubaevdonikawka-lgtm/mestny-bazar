import { toast } from "sonner";
import { lovable } from "@/integrations/lovable";

/**
 * Every "Войти" button across the app called lovable.auth.signInWithOAuth
 * directly and discarded its return value. That call resolves with
 * { error } (not a rejected promise) on failure — popup blocked, user closed
 * it, network error, provider outage — so those failures produced zero
 * feedback: the button visibly did nothing. Centralized here so the fix
 * isn't duplicated (and isn't missed) across all twelve call sites.
 */
export async function signInWithGoogle(redirectUri: string): Promise<void> {
  const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: redirectUri });
  if (result && "error" in result && result.error) {
    toast.error("Не удалось войти. Попробуйте ещё раз.");
  }
}
