import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { isNativePlatform } from "@/lib/capabilities/platform";
import { getDeepLinkCapability } from "@/lib/capabilities";
import { telegramLogin } from "@/api/telegram-auth";
import type { TelegramLoginPayload } from "@shared/contracts/telegram-login";

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

/**
 * Задача №304 — a real, reported failure: a user confirmed in Telegram,
 * returned to the site, and the UI just sat there unauthenticated — no
 * toast, no redirect, no error in the console. Root cause found by reading
 * the whole chain, not reproduced live (it's a race, not a deterministic
 * bug): telegramLogin() (the createServerFn round trip below) had no
 * client-side timeout at all. supabase-js's own fetch already times out at
 * 8s (SUPABASE_FETCH_TIMEOUT_MS, src/integrations/supabase/client.ts) and
 * the server's own outbound call to Supabase Admin is capped the same way
 * (client.server.ts) — but the one hop between THIS browser and OUR
 * Cloudflare Worker had nothing bounding it. A mobile network hiccup
 * exactly while the OS was switching the user from the Telegram app back to
 * the browser (the moment this whole flow depends on) is a completely
 * ordinary way for a fetch to stall without ever erroring — and a stalled
 * promise never reaches either `catch` block below, so neither the toast
 * nor `console.error` ever fired. AbortSignal.timeout() below guarantees
 * this always settles.
 */
const TELEGRAM_LOGIN_TIMEOUT_MS = 15_000;

function logTelegramLoginStep(step: string, detail?: unknown): void {
  // Задача №304 — deliberately temporary, structured diagnostic logging
  // (not a permanent app-wide logger) for the next time this chain fails:
  // if it happens again, `wrangler tail`/the browser console will show
  // exactly which step it got stuck on or errored at, instead of nothing.
  // Safe to remove once the flow has proven stable across a few more
  // real logins.
  console.info(`[telegram-auth] ${step}`, detail ?? "");
}

/**
 * Задача №302 — customer-only Telegram Login Widget sign-in (see
 * TelegramLoginButton.tsx for the widget itself). Unlike Google, this never
 * leaves the page: the widget's own callback hands back a signed payload in
 * plain JS, which telegramLogin() (src/api/telegram-auth.ts) sends to the
 * one new server function to verify and exchange for a real session's
 * `token_hash` — the client then finishes that exchange itself via
 * verifyOtp(), same as any other Supabase magic-link flow.
 *
 * No native deep-link dance like signInWithGoogle's: nothing here ever
 * hands off to the system browser (the WebView already IS the page the
 * whole time, per capacitor.config.ts's server.url), so this redirects to
 * the plain in-app "/workspace" path on both platforms — unlike
 * getAuthRedirectUrl()'s native branch, which is only meaningful for
 * re-entering the app via a deep link after actually having left it.
 *
 * Задача №304 — every exit path below shows the same toast AND logs via
 * console.error (audited: there was previously exactly one code path —
 * an unbounded hang — that could exit neither way; fixed by the timeout
 * above, not by adding a new catch branch here).
 */
export async function signInWithTelegram(payload: TelegramLoginPayload): Promise<void> {
  logTelegramLoginStep("widget callback received", { telegramId: payload.id });
  try {
    const { tokenHash, verificationType } = await telegramLogin(payload, {
      signal: AbortSignal.timeout(TELEGRAM_LOGIN_TIMEOUT_MS),
    });
    logTelegramLoginStep("server verified payload, session token issued");

    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: verificationType as "magiclink",
    });
    if (error) {
      logTelegramLoginStep("verifyOtp returned an error", error);
      console.error("[telegram-auth] verifyOtp failed", error);
      toast.error("Не удалось войти через Telegram. Попробуйте ещё раз.");
      return;
    }
    logTelegramLoginStep("verifyOtp succeeded, session established");
  } catch (error) {
    logTelegramLoginStep("threw (network/timeout/server error)", error);
    console.error("[telegram-auth] sign-in chain failed", error);
    toast.error("Не удалось войти через Telegram. Попробуйте ещё раз.");
    return;
  }

  window.location.href = "/workspace";
}
