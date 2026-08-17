import type { ReactNode } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

interface AdminLayoutProps {
  children: ReactNode;
}

/**
 * Shared chrome for Admin Platform pages (docs/admin-platform/README.md,
 * IMPLEMENTATION_ORDER.md — Этап 1). Existing admin routes predating this
 * stage (/admin/orders/*) keep their own local shell unchanged, per Этап 1's
 * "ни один уже существующий admin-путь не изменён" criterion — this Layout
 * is used by routes introduced in Этап 1 (/admin, /admin/settings) only.
 *
 * showSearch/showCart: false — buyer search and checkout cart have no
 * meaning inside the admin panel (см. отчёт по аудиту административной
 * панели). showLanguageSwitcher: true (Промпт №6) — same existing opt-in
 * mechanism customer pages already use (LanguageProvider is mounted once at
 * __root.tsx, shared by the whole app including /admin/*; only the visible
 * control was previously not rendered here).
 */
export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader showSearch={false} showCart={false} showLanguageSwitcher />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
