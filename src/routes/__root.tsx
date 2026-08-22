import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useCanGoBack,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { Toaster, toast } from "sonner";

import appCss from "../styles.css?url";
import { BRAND } from "@/config/brand";
import { useCartSync } from "@/hooks/useCartSync";
import { useAuthErrorToast } from "@/hooks/useAuthErrorToast";
import { usePlatformNavigationGate } from "@/hooks/usePlatformNavigationGate";
import { useServiceWorkerRegistration } from "@/hooks/useServiceWorkerRegistration";
import { isNativePlatform } from "@/lib/capabilities/platform";
import { LanguageProvider, useTranslation } from "@/i18n/LanguageProvider";

/**
 * Standard Android UX: the hardware/gesture Back button should exit the app
 * from the root screen (with a "press again to confirm" guard against
 * accidental exits), not silently do nothing — it already navigates
 * correctly everywhere there's router history (same canGoBack/history.back()
 * pattern SiteHeader's own "← Назад" button uses). Native-only: the
 * `backButton` event from @capacitor/app never fires on web, so this is a
 * no-op there regardless of the isNativePlatform() guard.
 *
 * canGoBack is read through a ref, not a dependency, so the effect wires the
 * native listener exactly once for the component's lifetime instead of
 * tearing it down and re-subscribing on every navigation — the ref always
 * reflects the latest value by the time a real back-button press reads it.
 */
const EXIT_CONFIRM_WINDOW_MS = 2000;

function useAndroidBackButton(): void {
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const canGoBackRef = useRef(canGoBack);
  canGoBackRef.current = canGoBack;

  useEffect(() => {
    if (!isNativePlatform()) return;

    let cancelled = false;
    let removeListener: (() => void) | null = null;
    let exitPrimed = false;
    let resetTimer: ReturnType<typeof setTimeout> | undefined;

    void import("@capacitor/app").then(({ App }) => {
      if (cancelled) return;
      void App.addListener("backButton", () => {
        if (canGoBackRef.current) {
          router.history.back();
          return;
        }
        if (exitPrimed) {
          void App.exitApp();
          return;
        }
        exitPrimed = true;
        toast("Нажмите «Назад» ещё раз, чтобы выйти");
        resetTimer = setTimeout(() => {
          exitPrimed = false;
        }, EXIT_CONFIRM_WINDOW_MS);
      }).then((listener) => {
        if (cancelled) {
          void listener.remove();
        } else {
          removeListener = () => void listener.remove();
        }
      });
    });

    return () => {
      cancelled = true;
      removeListener?.();
      if (resetTimer) clearTimeout(resetTimer);
    };
  }, [router]);
}

function NotFoundComponent() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">{t("errors.notFoundTitle")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{t("errors.notFoundDescription")}</p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {t("common.home")}
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          {t("errors.genericTitle")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("errors.genericDescription")}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {t("common.retry")}
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            {t("common.home")}
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, viewport-fit=cover",
      },
      { title: BRAND.title },
      { property: "og:title", content: BRAND.title },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: BRAND.title },
      { name: "description", content: BRAND.description },
      { property: "og:description", content: BRAND.description },
      { name: "twitter:description", content: BRAND.description },
      // PWA / installed-app chrome — Capacitor's WebView and mobile browsers
      // both read theme-color for the status bar / task-switcher color.
      { name: "theme-color", content: "#2d5940" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: BRAND.name },
    ],
    links: [
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap",
      },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "icon", href: "/icons/icon-32.png", sizes: "32x32", type: "image/png" },
      { rel: "icon", href: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { rel: "apple-touch-icon", href: "/icons/apple-touch-icon.png" },
      { rel: "manifest", href: "/manifest.webmanifest" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  useCartSync();
  useAuthErrorToast();
  usePlatformNavigationGate();
  useServiceWorkerRegistration();
  useAndroidBackButton();

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
        <Toaster richColors position="top-center" />
      </LanguageProvider>
    </QueryClientProvider>
  );
}
