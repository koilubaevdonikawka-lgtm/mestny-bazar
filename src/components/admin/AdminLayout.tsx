import type { ReactNode } from "react";
import { Link, useCanGoBack, useNavigate, useRouter } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/LanguageProvider";
import { ArrowLeft, Home } from "lucide-react";

interface AdminLayoutProps {
  children: ReactNode;
  /**
   * false only on the hub page itself (/admin) — there's nothing to go
   * "back" to or "home" from when you're already home.
   */
  showBackNav?: boolean;
}

/**
 * Shared chrome for Admin Platform pages (docs/admin-platform/README.md,
 * IMPLEMENTATION_ORDER.md — Этап 1). /admin/orders/* used to keep its own
 * local shell (an exact duplicate of this one) rather than use this
 * component — folded into AdminLayout so the Назад/На главную row below
 * doesn't need a third copy.
 *
 * showSearch/showCart: false — buyer search and checkout cart have no
 * meaning inside the admin panel (см. отчёт по аудиту административной
 * панели). showLanguageSwitcher: true (Промпт №6) — same existing opt-in
 * mechanism customer pages already use (LanguageProvider is mounted once at
 * __root.tsx, shared by the whole app including /admin/*; only the visible
 * control was previously not rendered here).
 *
 * Назад/На главную: previously each section page rendered its own
 * "← Административная платформа" link (some via t("admin.common.backToHub"),
 * most as raw hardcoded text) — always a link to the hub, never a real
 * "one step back" action. Centralized here instead of duplicated 19 times,
 * and a genuine "Назад" (router.history.back(), same canGoBack pattern
 * SiteHeader/search.tsx already use for the customer-facing back button)
 * added alongside it.
 */
export function AdminLayout({ children, showBackNav = true }: AdminLayoutProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const navigate = useNavigate();
  const canGoBack = useCanGoBack();

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader showSearch={false} showCart={false} showLanguageSwitcher />
      {showBackNav && (
        <div className="mx-auto flex w-full max-w-5xl items-center gap-1 px-6 pt-6">
          <Button
            type="button"
            variant="ghost"
            className="-ml-2 rounded-full"
            onClick={() => {
              if (canGoBack) {
                router.history.back();
              } else {
                void navigate({ to: "/admin" });
              }
            }}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("common.back")}
          </Button>
          <Button asChild variant="ghost" className="rounded-full">
            <Link to="/admin">
              <Home className="h-4 w-4 mr-2" />
              {t("admin.common.backToHub")}
            </Link>
          </Button>
        </div>
      )}
      <main className="flex-1">{children}</main>
    </div>
  );
}
