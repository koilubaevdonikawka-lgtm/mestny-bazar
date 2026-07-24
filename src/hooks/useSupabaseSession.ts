import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/** `null` while the initial session check is in flight, then reflects auth state live. */
export function useSupabaseSession(): { isAuthenticated: boolean | null } {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setIsAuthenticated(!!data.session?.user);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session?.user);
    });
    return () => subscription.unsubscribe();
  }, []);

  return { isAuthenticated };
}
