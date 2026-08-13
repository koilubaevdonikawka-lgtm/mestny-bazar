import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

/**
 * Single source of truth for where Google OAuth should return the user.
 * Always /workspace (docs/architecture/PLATFORM_ACCESS_ARCHITECTURE.md §4,
 * §6-7 — Role Resolution → Workspace Selection runs right after
 * Authentication, not "return to whatever page login was clicked from").
 * /workspace resolves the user's role(s) and either redirects straight to
 * their one applicable Workspace (customer → "/", staff → their own
 * workspace) or, if they hold more than one role, shows the explicit picker
 * — see src/routes/workspace.tsx. Call sites must never compute this
 * themselves.
 */
export function getAuthRedirectUrl(): string {
  return window.location.origin + "/workspace";
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
