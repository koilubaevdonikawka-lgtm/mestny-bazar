import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { signInWithGoogle } from "@/lib/auth";
import { useTranslation } from "@/i18n/LanguageProvider";
import type { TranslationKey } from "@/i18n/t";
import {
  Banknote,
  BarChart3,
  Bike,
  Bot,
  FileText,
  Image as ImageIcon,
  LayoutDashboard,
  Loader2,
  LogIn,
  Lock,
  MapPinned,
  Package,
  Plug,
  Settings,
  Shield,
  Store,
  Tag,
  Tags,
  Truck,
  Users,
  Warehouse,
  Zap,
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
  labelKey: TranslationKey;
  to?:
    | "/admin/dashboard"
    | "/admin/orders"
    | "/admin/catalog"
    | "/admin/warehouse"
    | "/admin/sellers"
    | "/admin/suppliers"
    | "/admin/users"
    | "/admin/couriers"
    | "/admin/delivery"
    | "/admin/analytics"
    | "/admin/finance"
    | "/admin/marketing"
    | "/admin/design"
    | "/admin/settings"
    | "/admin/automation"
    | "/admin/integrations"
    | "/admin/ai"
    | "/admin/security"
    | "/admin/logs"
    | "/admin/permissions";
  icon: LucideIcon;
}

const NAV_ENTRIES: NavEntry[] = [
  { labelKey: "admin.hub.navDashboard", to: "/admin/dashboard", icon: LayoutDashboard },
  { labelKey: "admin.hub.navOrders", to: "/admin/orders", icon: Package },
  { labelKey: "admin.hub.navCatalog", to: "/admin/catalog", icon: Tags },
  { labelKey: "admin.hub.navWarehouse", to: "/admin/warehouse", icon: Warehouse },
  { labelKey: "admin.hub.navSellers", to: "/admin/sellers", icon: Store },
  { labelKey: "admin.hub.navSuppliers", to: "/admin/suppliers", icon: Truck },
  { labelKey: "admin.hub.navUsers", to: "/admin/users", icon: Users },
  { labelKey: "admin.hub.navCouriers", to: "/admin/couriers", icon: Bike },
  { labelKey: "admin.hub.navDelivery", to: "/admin/delivery", icon: MapPinned },
  { labelKey: "admin.hub.navAnalytics", to: "/admin/analytics", icon: BarChart3 },
  { labelKey: "admin.hub.navFinance", to: "/admin/finance", icon: Banknote },
  { labelKey: "admin.hub.navMarketing", to: "/admin/marketing", icon: Tag },
  { labelKey: "admin.hub.navAi", to: "/admin/ai", icon: Bot },
  { labelKey: "admin.hub.navIntegrations", to: "/admin/integrations", icon: Plug },
  { labelKey: "admin.hub.navAutomation", to: "/admin/automation", icon: Zap },
  { labelKey: "admin.hub.navDesign", to: "/admin/design", icon: ImageIcon },
  { labelKey: "admin.hub.navSettings", to: "/admin/settings", icon: Settings },
  { labelKey: "admin.hub.navPermissions", to: "/admin/permissions", icon: Lock },
  { labelKey: "admin.hub.navLogs", to: "/admin/logs", icon: FileText },
  { labelKey: "admin.hub.navSecurity", to: "/admin/security", icon: Shield },
];

function AdminPlatformHome() {
  const { isAuthenticated } = useSupabaseSession();
  const { t } = useTranslation();

  const handleSignIn = async () => {
    await signInWithGoogle();
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
          <h1 className="font-serif text-3xl tracking-tight">{t("admin.hub.title")}</h1>
          <p className="mt-3 text-muted-foreground">{t("admin.common.signInPrompt")}</p>
          <Button size="lg" className="mt-6 h-12 rounded-full" onClick={() => void handleSignIn()}>
            {t("common.signIn")}
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="font-serif text-4xl tracking-tight">{t("admin.hub.title")}</h1>

        <div className="mt-8 grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {NAV_ENTRIES.map((entry) => {
            const Icon = entry.icon;
            const label = t(entry.labelKey);
            const content = (
              <>
                <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="mt-4 font-serif text-lg">{label}</p>
                {!entry.to && (
                  <p className="mt-1 text-xs text-muted-foreground">{t("admin.hub.comingSoon")}</p>
                )}
              </>
            );

            if (entry.to) {
              return (
                <Link
                  key={entry.labelKey}
                  to={entry.to}
                  className="rounded-2xl border border-border/60 bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-card)] hover:border-primary/40"
                >
                  {content}
                </Link>
              );
            }

            return (
              <div
                key={entry.labelKey}
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
