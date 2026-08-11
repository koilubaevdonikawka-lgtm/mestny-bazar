import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDashboardSummary } from "@/api/dashboard";
import { signInWithGoogle } from "@/lib/auth";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { formatMoney } from "@shared/lib/order-display";
import { useTranslation } from "@/i18n/LanguageProvider";
import { AlertTriangle, ArrowLeft, Loader2, LogIn, ShieldAlert } from "lucide-react";

const REFETCH_INTERVAL_MS = 30_000;

export const Route = createFileRoute("/admin/dashboard/")({
  component: AdminDashboardPage,
});

function AdminDashboardPage() {
  const { isAuthenticated } = useSupabaseSession();
  const { t } = useTranslation();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: getDashboardSummary,
    enabled: isAuthenticated === true,
    retry: false,
    refetchInterval: REFETCH_INTERVAL_MS,
  });

  const handleSignIn = async () => {
    await signInWithGoogle();
  };

  if (isAuthenticated === null || (isAuthenticated && isLoading)) {
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
          <LogIn className="h-10 w-10 text-primary mx-auto mb-4" />
          <h1 className="font-serif text-3xl tracking-tight">{t("admin.dashboard.title")}</h1>
          <p className="mt-3 text-muted-foreground">{t("admin.common.signInPrompt")}</p>
          <Button size="lg" className="mt-6 h-12 rounded-full" onClick={() => void handleSignIn()}>
            {t("common.signIn")}
          </Button>
        </div>
      </AdminLayout>
    );
  }

  if (isError) {
    const message = error instanceof Error ? error.message : t("admin.dashboard.loadError");
    const isForbidden =
      message.toLowerCase().includes("access denied") ||
      message.toLowerCase().includes("admin role");

    return (
      <AdminLayout>
        <div className="max-w-md mx-auto text-center py-24">
          {isForbidden ? (
            <>
              <ShieldAlert className="h-10 w-10 text-primary mx-auto mb-4" />
              <h1 className="font-serif text-3xl tracking-tight">
                {t("admin.common.accessDeniedTitle")}
              </h1>
              <p className="mt-3 text-muted-foreground">{t("admin.common.adminOnlyMessage")}</p>
            </>
          ) : (
            <>
              <p className="text-muted-foreground">{message}</p>
              <Button size="lg" className="mt-6 h-12 rounded-full" onClick={() => void refetch()}>
                {t("common.retry")}
              </Button>
            </>
          )}
        </div>
      </AdminLayout>
    );
  }

  if (!data) return null;

  return (
    <AdminLayout>
      <div className="mx-auto max-w-5xl px-6 py-12">
        <Button asChild variant="ghost" className="mb-6 -ml-2 rounded-full">
          <Link to="/admin">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("admin.common.backToHub")}
          </Link>
        </Button>

        <h1 className="font-serif text-4xl tracking-tight">{t("admin.dashboard.title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("admin.dashboard.subtitle")}</p>

        <div className="mt-8 grid gap-4 grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label={t("admin.dashboard.newOrdersToday")}
            value={String(data.kpi.newOrdersToday)}
          />
          <KpiCard label={t("admin.dashboard.assembling")} value={String(data.kpi.assembling)} />
          <KpiCard label={t("admin.dashboard.inDelivery")} value={String(data.kpi.inDelivery)} />
          <KpiCard
            label={t("admin.dashboard.revenueToday")}
            value={formatMoney(data.kpi.revenueToday, data.kpi.currency)}
          />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <section className="rounded-2xl border border-border/60 bg-card p-6">
            <h2 className="font-serif text-2xl mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
              {t("admin.dashboard.attentionHeading")}
            </h2>
            {data.attention.length === 0 ? (
              <p className="text-muted-foreground">{t("admin.dashboard.noLowStock")}</p>
            ) : (
              <ul className="space-y-2">
                {data.attention.map((item) => (
                  <li
                    key={item.productId}
                    className="flex items-center justify-between gap-2 rounded-xl bg-secondary/40 px-4 py-3"
                  >
                    <span className="truncate">{item.name}</span>
                    <Badge variant={item.status === "depleted" ? "destructive" : "secondary"}>
                      {item.status === "depleted"
                        ? t("admin.dashboard.outOfStock")
                        : t("admin.dashboard.stockWithThreshold", {
                            stock: String(item.stock),
                            threshold: String(item.effectiveThreshold),
                          })}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border border-border/60 bg-card p-6">
            <h2 className="font-serif text-2xl mb-4">
              {t("admin.dashboard.warehouseQueueHeading")}
            </h2>
            <ul className="space-y-2">
              <li className="flex items-center justify-between rounded-xl bg-secondary/40 px-4 py-3">
                <span>{t("admin.dashboard.confirmedAwaitingAssembly")}</span>
                <Badge variant="secondary">{data.warehouseQueue.confirmed}</Badge>
              </li>
              <li className="flex items-center justify-between rounded-xl bg-secondary/40 px-4 py-3">
                <span>{t("admin.dashboard.assembling")}</span>
                <Badge variant="secondary">{data.warehouseQueue.assembling}</Badge>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </AdminLayout>
  );
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 font-serif text-3xl tracking-tight">{value}</p>
    </div>
  );
}
