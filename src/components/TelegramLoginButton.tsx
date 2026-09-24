import { useEffect, useId, useRef } from "react";
import { signInWithTelegram } from "@/lib/auth";
import { useTranslation } from "@/i18n/LanguageProvider";
import type { TelegramLoginPayload } from "@shared/contracts/telegram-login";

/** Public bot username (no "@") — safe to ship in client code; the bot's own secret token never leaves the server (verified in server/functions/telegram-login.executor.ts). */
const TELEGRAM_BOT_USERNAME = "MestnyBazar_Bot";
const WIDGET_SCRIPT_SRC = "https://telegram.org/js/telegram-widget.js?22";

export interface TelegramLoginButtonProps {
  /**
   * Задача №304 — reports this instance's own signing-in state upward so
   * the caller (SignInMethodsList) can show one clear, hard-to-miss
   * "Входим…" state across the whole list, not a small spinner easy to miss
   * on the widget alone (the previous, harder-to-notice design this
   * replaces).
   */
  onSigningInChange?: (signingIn: boolean) => void;
}

/**
 * Задача №302 — the official Telegram Login Widget (callback mode, not
 * redirect: https://core.telegram.org/widgets/login), embedded by injecting
 * its own `<script>` tag into a container div exactly the way Telegram's
 * own docs show it in plain HTML — the widget script replaces that tag with
 * its own iframe once it loads. It renders its own styled button (Telegram
 * controls that chrome, not this app's Button component); `size`/`radius`
 * only get it as close to this app's own buttons as the widget allows.
 *
 * The global callback name is unique per mounted instance (useId) rather
 * than one shared `window.onTelegramAuth`, so this component stays safe to
 * render more than once on the same page (e.g. a page that could show both
 * AccountMenu's own "Войти" and RegisterPromptDialog's copy at once) without
 * one instance's callback silently overwriting another's.
 *
 * Owns the whole sign-in flow itself (widget → signInWithTelegram()) so
 * every call site just renders this with zero extra wiring, same as
 * dropping in the Google sign-in button.
 *
 * Задача №304 — `inFlightRef` ignores a second callback invocation while
 * one is already being processed. Telegram's widget is documented to fire
 * `data-onauth` exactly once per confirmation, but this app has no way to
 * verify that never regresses (a widget-side bug, or the buyer somehow
 * triggering the flow twice) — without this guard, two concurrent
 * signInWithTelegram() calls with the same payload would each call
 * generateLink() server-side, and the second one silently invalidates the
 * first's token (a real Supabase GoTrue behavior: only the most recently
 * generated link/token stays valid for a given identity), so whichever
 * call's verifyOtp() happened to be holding the now-stale first token would
 * fail — a spurious, confusing error even though the sign-in itself was
 * never actually broken. Ignoring the duplicate outright removes that race
 * entirely instead of trying to make it survive it.
 */
export function TelegramLoginButton({ onSigningInChange }: TelegramLoginButtonProps = {}) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const reactId = useId().replace(/[^a-zA-Z0-9]/g, "");
  const inFlightRef = useRef(false);

  useEffect(() => {
    const globalName = `__telegramLoginCallback_${reactId}`;
    (window as unknown as Record<string, unknown>)[globalName] = (user: TelegramLoginPayload) => {
      if (inFlightRef.current) {
        console.info(
          "[telegram-auth] duplicate widget callback ignored — a sign-in is already in flight",
        );
        return;
      }
      inFlightRef.current = true;
      onSigningInChange?.(true);
      void signInWithTelegram(user).finally(() => {
        inFlightRef.current = false;
        onSigningInChange?.(false);
      });
    };

    const script = document.createElement("script");
    script.src = WIDGET_SCRIPT_SRC;
    script.async = true;
    script.setAttribute("data-telegram-login", TELEGRAM_BOT_USERNAME);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-radius", "8");
    script.setAttribute("data-onauth", `${globalName}(user)`);
    containerRef.current?.appendChild(script);

    return () => {
      delete (window as unknown as Record<string, unknown>)[globalName];
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  }, [reactId, onSigningInChange]);

  return (
    <div
      ref={containerRef}
      className="inline-flex items-center justify-center"
      aria-label={t("auth.signInWithTelegram")}
    />
  );
}
