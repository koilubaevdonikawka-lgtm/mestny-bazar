import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CancellationWindowBadge } from "@/components/admin/CancellationWindowBadge";
import { listAdminOrders } from "@/api/admin";
import { signInWithGoogle } from "@/lib/auth";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { useTranslation } from "@/i18n/LanguageProvider";
import {
  formatMoney,
  formatOrderDate,
  formatOrderStatus,
  formatPaymentStatus,
} from "@shared/lib/order-display";
import { OrderStatus } from "@shared/contracts/order";
import { ArrowLeft, ArrowRight, Loader2, LogIn, Package, ShieldAlert } from "lucide-react";

const PAGE_SIZE = 20;

export const Route = createFileRoute("/admin/orders/")({
  component: AdminOrdersPage,
});

function AdminOrdersPage() {
  const { isAuthenticated } = useSupabaseSession();
  const { t } = useTranslation();
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin", "orders", "list", page],
    queryFn: () => listAdminOrders({ page, pageSize: PAGE_SIZE }),
    enabled: isAuthenticated === true,
    retry: false,
  });
  const orders = data?.items ?? [];

  const handleSignIn = async () => {
    await signInWithGoogle();
  };

  if (isAuthenticated === null) {
    return (
      <PageShell>
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PageShell>
    );
  }

  if (!isAuthenticated) {
    return (
      <PageShell>
        <div className="max-w-md mx-auto text-center py-24">
          <div className="mx-auto h-14 w-14 rounded-full bg-secondary flex items-center justify-center mb-4">
            <LogIn className="h-6 w-6 text-primary" />
          </div>
          <h1 className="font-serif text-3xl tracking-tight">{t("admin.orders.title")}</h1>
          <p className="mt-3 text-muted-foreground">{t("admin.common.signInPrompt")}</p>
          <Button size="lg" className="mt-6 h-12 rounded-full" onClick={() => void handleSignIn()}>
            {t("common.signIn")}
          </Button>
        </div>
      </PageShell>
    );
  }

  if (isLoading) {
    return (
      <PageShell>
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PageShell>
    );
  }

  if (isError) {
    const message = error instanceof Error ? error.message : t("admin.orders.loadListError");
    const isForbidden =
      message.toLowerCase().includes("access denied") ||
      message.toLowerCase().includes("admin role");
    const isAuthError =
      message.toLowerCase().includes("authentication") || message.includes("Unauthorized");

    return (
      <PageShell>
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
              {isAuthError ? (
                <Button
                  size="lg"
                  className="mt-6 h-12 rounded-full"
                  onClick={() => void handleSignIn()}
                >
                  {t("common.signInAgain")}
                </Button>
              ) : (
                <Button size="lg" className="mt-6 h-12 rounded-full" onClick={() => void refetch()}>
                  {t("common.retry")}
                </Button>
              )}
            </>
          )}
        </div>
      </PageShell>
    );
  }

  const newOnPage = orders.filter((order) => order.status === OrderStatus.CREATED);
  const total = data?.total ?? 0;

  return (
    <PageShell>
      <div className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="font-serif text-4xl tracking-tight">{t("admin.orders.title")}</h1>
        <p className="mt-2 text-muted-foreground">
          {t("admin.orders.summaryLine", {
            total: String(total),
            newCount: String(newOnPage.length),
          })}
        </p>

        {orders.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-dashed border-border py-16 text-center">
            <div className="mx-auto h-14 w-14 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <h2 className="font-serif text-2xl">{t("admin.orders.emptyState")}</h2>
          </div>
        ) : (
          <ul className="mt-8 space-y-4">
            {orders.map((order) => (
              <li key={order.id}>
                <Link
                  to="/admin/orders/$id"
                  params={{ id: order.id }}
                  className="block rounded-2xl border border-border/60 bg-card p-6 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)] hover:border-primary/40"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-serif text-xl">
                        {t("admin.orders.orderNumberPrefix", { number: String(order.orderNumber) })}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatOrderDate(order.createdAt)} · {order.customerName}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">{formatOrderStatus(order.status)}</Badge>
                      <Badge variant="outline">{formatPaymentStatus(order.paymentStatus)}</Badge>
                      <CancellationWindowBadge order={order} />
                    </div>
                  </div>
                  <p className="mt-4 font-semibold text-lg">
                    {formatMoney(order.total, order.currency)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {(page > 1 || data?.hasMore) && (
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              {t("common.back")}
            </Button>
            <span className="text-sm text-muted-foreground">
              {t("admin.orders.pageLabel", { page: String(page) })}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={!data?.hasMore}
              onClick={() => setPage((p) => p + 1)}
            >
              {t("common.next")}
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </PageShell>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader showSearch={false} showCart={false} showLanguageSwitcher />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
