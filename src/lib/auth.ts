import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { isNativePlatform } from "@/lib/capabilities/platform";
import { getDeepLinkCapability } from "@/lib/capabilities";

/**
 * Reverse-DNS custom URL scheme derived from capacitor.config.ts's own
 * `appId` ("com.mesnyibazar.app") — unique per app store convention, can't
 * collide with another installed app's scheme. Registered at the OS level
 * in android/app/src/main/AndroidManifest.xml (intent-filter) and
 * ios/App/App/Info.plist (CFBundleURLSchemes); this constant is the single
 * source of truth both native registrations and this file's own parsing
 * must agree with.
 *
 * MUST also be added to Supabase Dashboard → Authentication → URL
 * Configuration → Redirect URLs as exactly this value
 * ("com.mesnyibazar.app://auth-callback") — Supabase rejects a redirectTo
 * that isn't on that allowlist. This is a dashboard-only setting; nothing
 * in this repo can configure it.
 */
const NATIVE_AUTH_CALLBACK_URL = "com.mesnyibazar.app://auth-callback";

/**
 * Single source of truth for where Google OAuth should return the user.
 * Web: always /workspace (docs/architecture/PLATFORM_ACCESS_ARCHITECTURE.md
 * §4, §6-7 — Role Resolution → Workspace Selection runs right after
 * Authentication). Native: the custom-scheme deep link above — Google
 * blocks OAuth entirely inside an embedded WebView user-agent
 * (`disallowed_useragent`), so the native flow must hand off to the
 * system browser and get a way back into the app; a plain https URL
 * would just reopen in that same system browser, not this app.
 */
export function getAuthRedirectUrl(): string {
  if (isNativePlatform()) return NATIVE_AUTH_CALLBACK_URL;
  return window.location.origin + "/workspace";
}

/**
 * Finishes a native sign-in once the OS hands the auth-callback deep link
 * back to the app (App.addListener("appUrlOpen", ...) via
 * getDeepLinkCapability(), wired below in signInWithGoogle()).
 *
 * This project's Supabase client (src/integrations/supabase/client.ts)
 * does not set `flowType`, so it uses supabase-js's default `implicit`
 * flow, not PKCE — the callback URL carries `access_token`/`refresh_token`
 * directly in its fragment, not a `?code=` to exchange. That means the
 * correct completion call for THIS app's actual configuration is
 * `supabase.auth.setSession({ access_token, refresh_token })`, not
 * `exchangeCodeForSession()` (that method is PKCE-only and would throw
 * `AuthSessionMissingError`/reject a non-existent code here — verified
 * against the installed @supabase/supabase-js@2.110.0's GoTrueClient).
 */
async function completeNativeSignIn(url: string): Promise<void> {
  if (!url.startsWith(NATIVE_AUTH_CALLBACK_URL)) return;

  const { Browser } = await import("@capacitor/browser");
  await Browser.close().catch(() => {});

  const fragment = url.split("#")[1] ?? "";
  const params = new URLSearchParams(fragment);
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");

  if (!accessToken || !refreshToken) {
    toast.error("Не удалось войти. Попробуйте ещё раз.");
    return;
  }

  const { error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  if (error) {
    toast.error("Не удалось войти. Попробуйте ещё раз.");
    return;
  }

  // Full navigation, not router.navigate() — matches what the web flow's
  // own OAuth redirect already is (a real page load of /workspace), and
  // this file has no access to the TanStack Router instance outside
  // component context.
  window.location.href = "/workspace";
}

/**
 * Every "Войти" button across the app called this directly and discarded its
 * return value. supabase.auth.signInWithOAuth resolves with { error } (not a
 * rejected promise) on failure — popup blocked, user closed it, network
 * error, provider outage — so those failures produced zero feedback: the
 * button visibly did nothing. Centralized here so the fix isn't duplicated
 * (and isn't missed) across all call sites.
 *
 * Native branch: Google's OAuth policy blocks sign-in from an embedded
 * WebView user-agent outright (`disallowed_useragent`, enforced since 2023)
 * — android.webkit.WebView/WKWebView, exactly what this Capacitor app's own
 * WebView is. `skipBrowserRedirect: true` stops the SDK from navigating the
 * WebView itself; the returned URL is opened in the system
 * browser/Custom Tabs/SFSafariViewController via `@capacitor/browser`
 * instead, which Google does accept. A one-shot deep-link listener
 * (removed the instant it fires) picks up the OS handing control back to
 * the app and finishes the sign-in (completeNativeSignIn above).
 */
export async function signInWithGoogle(): Promise<void> {
  if (isNativePlatform()) {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: getAuthRedirectUrl(), skipBrowserRedirect: true },
    });
    if (error || !data?.url) {
      toast.error("Не удалось войти. Попробуйте ещё раз.");
      return;
    }

    const removeListener = getDeepLinkCapability().addListener((incomingUrl) => {
      removeListener();
      void completeNativeSignIn(incomingUrl);
    });

    const { Browser } = await import("@capacitor/browser");
    await Browser.open({ url: data.url });
    return;
  }

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: getAuthRedirectUrl() },
  });
  if (error) {
    toast.error("Не удалось войти. Попробуйте ещё раз.");
  }
}
