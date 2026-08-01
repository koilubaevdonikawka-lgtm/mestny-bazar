import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { signInWithGoogle } from "@/lib/auth";
import {
  Bike,
  LayoutDashboard,
  Loader2,
  LogIn,
  Package,
  Settings,
  Store,
  Tags,
  Truck,
  Users,
  Warehouse,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminPlatformHome,
});

/**
 * Navigation follows docs/admin-platform/ADMIN_PLATFORM_MASTER_SPEC.md, §4
 * exactly — module list and order are not invented here. Stage 3 activates
 * Продавцы/Поставщики/Покупатели(Пользователи)/Курьеры on top of Stages 1-2's
 * Dashboard/Заказы/Каталог/Склад/Настройки; every other entry is a visible
 * placeholder, not a broken link, matching the modules' documented status
 * (docs/admin-platform/*.md — "не реализовано"/"частично реализовано"). See
 * docs/admin-platform/IMPLEMENTATION_ORDER.md, Этап 3.
 */
interface NavEntry {
  label: string;
  to?:
    | "/admin/dashboard"
    | "/admin/orders"
    | "/admin/catalog"
    | "/admin/warehouse"
    | "/admin/sellers"
    | "/admin/suppliers"
    | "/admin/users"
    | "/admin/couriers"
    | "/admin/settings";
  icon: LucideIcon;
}

const NAV_ENTRIES: NavEntry[] = [
  { label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Заказы", to: "/admin/orders", icon: Package },
  { label: "Каталог", to: "/admin/catalog", icon: Tags },
  { label: "Склад", to: "/admin/warehouse", icon: Warehouse },
  { label: "Продавцы", to: "/admin/sellers", icon: Store },
  { label: "Поставщики", to: "/admin/suppliers", icon: Truck },
  { label: "Покупатели", to: "/admin/users", icon: Users },
  { label: "Курьеры", to: "/admin/couriers", icon: Bike },
  { label: "Аналитика", icon: Package },
  { label: "Финансы", icon: Package },
  { label: "Маркетинг", icon: Package },
  { label: "ИИ-инструменты", icon: Package },
  { label: "Интеграции", icon: Package },
  { label: "Автоматизация", icon: Package },
  { label: "Оформление", icon: Package },
  { label: "Настройки", to: "/admin/settings", icon: Settings },
  { label: "Права доступа", icon: Package },
  { label: "Журналы событий", icon: Package },
  { label: "Безопасность", icon: Package },
];

function AdminPlatformHome() {
  const { isAuthenticated } = useSupabaseSession();

  const handleSignIn = async () => {
    await signInWithGoogle(window.location.origin + "/admin");
  };

  if (isAuthenticated === null) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  if (!isAuthenticated) {
    return (
      <AdminLayout>
        <div className="max-w-md mx-auto text-center py-24">
          <div className="mx-auto h-14 w-14 rounded-full bg-secondary flex items-center justify-center mb-4">
            <LogIn className="h-6 w-6 text-primary" />
          </div>
          <h1 className="font-serif text-3xl tracking-tight">Административная платформа</h1>
          <p className="mt-3 text-muted-foreground">Войдите с учётной записью администратора.</p>
          <Button size="lg" className="mt-6 h-12 rounded-full" onClick={() => void handleSignIn()}>
            Войти
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="font-serif text-4xl tracking-tight">Административная платформа</h1>
        <p className="mt-2 text-muted-foreground">
          «Местный Базар» — единая точка управления. Модули без ссылки ещё не реализованы, см.{" "}
          <code className="text-sm">docs/admin-platform/</code>.
        </p>

        <div className="mt-8 grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {NAV_ENTRIES.map((entry) => {
            const Icon = entry.icon;
            const content = (
              <>
                <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="mt-4 font-serif text-lg">{entry.label}</p>
                {!entry.to && <p className="mt-1 text-xs text-muted-foreground">Скоро</p>}
              </>
            );

            if (entry.to) {
              return (
                <Link
                  key={entry.label}
                  to={entry.to}
                  className="rounded-2xl border border-border/60 bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-card)] hover:border-primary/40"
                >
                  {content}
                </Link>
              );
            }

            return (
              <div
                key={entry.label}
                aria-disabled="true"
                className="rounded-2xl border border-dashed border-border/60 bg-card/50 p-6 opacity-60 cursor-not-allowed"
              >
                {content}
              </div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
}
