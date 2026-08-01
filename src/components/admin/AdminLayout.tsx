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
 */
export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
