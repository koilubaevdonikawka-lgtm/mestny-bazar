import { useEffect } from "react";
import { toast } from "sonner";

/**
 * Supabase's /auth/v1/callback appends `error`/`error_code`/`error_description`
 * to the app's redirectTo URL when the OAuth exchange fails server-side (e.g.
 * bad_oauth_state). Without this, that failure was only visible as raw query
 * params in the address bar — the user saw no in-app feedback at all.
 */
export function useAuthErrorToast() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const errorCode = params.get("error_code") ?? hashParams.get("error_code");
    const errorDescription = params.get("error_description") ?? hashParams.get("error_description");
    const error = params.get("error") ?? hashParams.get("error");

    if (!error && !errorCode) return;

    toast.error("Не удалось войти через Google. Попробуйте ещё раз.", {
      description: errorDescription
        ? decodeURIComponent(errorDescription.replace(/\+/g, " "))
        : (errorCode ?? error ?? undefined),
    });

    const url = new URL(window.location.href);
    url.search = "";
    url.hash = "";
    window.history.replaceState({}, "", url.toString());
  }, []);
}
