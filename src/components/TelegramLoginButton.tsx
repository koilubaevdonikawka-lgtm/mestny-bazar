import { useEffect, useId, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { signInWithTelegram } from "@/lib/auth";
import { useTranslation } from "@/i18n/LanguageProvider";
import type { TelegramLoginPayload } from "@shared/contracts/telegram-login";

/** Public bot username (no "@") — safe to ship in client code; the bot's own secret token never leaves the server (verified in server/functions/telegram-login.executor.ts). */
const TELEGRAM_BOT_USERNAME = "MestnyBazar_Bot";
const WIDGET_SCRIPT_SRC = "https://telegram.org/js/telegram-widget.js?22";

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
 */
export function TelegramLoginButton() {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const reactId = useId().replace(/[^a-zA-Z0-9]/g, "");
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    const globalName = `__telegramLoginCallback_${reactId}`;
    (window as unknown as Record<string, unknown>)[globalName] = (user: TelegramLoginPayload) => {
      setIsSigningIn(true);
      void signInWithTelegram(user).finally(() => setIsSigningIn(false));
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
  }, [reactId]);

  return (
    <div
      className="relative inline-flex items-center justify-center"
      aria-label={t("auth.signInWithTelegram")}
    >
      <div ref={containerRef} className={isSigningIn ? "opacity-40" : undefined} />
      {isSigningIn && <Loader2 className="absolute h-4 w-4 animate-spin text-muted-foreground" />}
    </div>
  );
}
