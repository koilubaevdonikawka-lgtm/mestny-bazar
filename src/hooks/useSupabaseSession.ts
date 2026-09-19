import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SessionResult {
  data: { session: { user?: unknown } | null };
}

/**
 * Задача №282 — the initial getSession() used to have no rejection handler:
 * if it rejected (no network at launch), isAuthenticated stayed `null`
 * forever and AccountMenu's disabled placeholder button never re-enabled.
 * A failed check now resolves `null` to `false` (never demotes an already
 * known state — see the hook below), and the check is re-run whenever the
 * browser reports connectivity is back, so the app recovers on its own if
 * the stored session turns out to be valid. Pure and dependency-injected so
 * it's testable without React or a real network.
 */
export function watchSession(
  getSession: () => Promise<SessionResult>,
  onResolved: (isAuthenticated: boolean) => void,
  onFailed: () => void,
  target: Pick<EventTarget, "addEventListener" | "removeEventListener"> | undefined,
): () => void {
  let cancelled = false;

  const check = () => {
    getSession().then(
      ({ data }) => {
        if (!cancelled) onResolved(!!data.session?.user);
      },
      () => {
        if (!cancelled) onFailed();
      },
    );
  };

  check();
  target?.addEventListener("online", check);

  return () => {
    cancelled = true;
    target?.removeEventListener("online", check);
  };
}

/** `null` while the initial session check is in flight, then reflects auth state live. */
export function useSupabaseSession(): { isAuthenticated: boolean | null } {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const stopWatching = watchSession(
      () => supabase.auth.getSession(),
      setIsAuthenticated,
      // Only resolves the still-unknown state: a failed *re*-check after
      // reconnecting must not flip an already-known user to signed out.
      () => setIsAuthenticated((current) => current ?? false),
      typeof window === "undefined" ? undefined : window,
    );
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session?.user);
    });
    return () => {
      stopWatching();
      subscription.unsubscribe();
    };
  }, []);

  return { isAuthenticated };
}
