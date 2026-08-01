import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { completePayout, createPayoutRun, getFinanceOverview, listPayouts } from "@/api/finance";
import { listSellers } from "@/api/seller-profile";
import { signInWithGoogle } from "@/lib/auth";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { ArrowLeft, Banknote, Loader2, LogIn, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/finance/")({
  component: AdminFinancePage,
});

function formatMoney(value: number): string {
  return `${value.toLocaleString("ru-RU")} сом`;
}

function AdminFinancePage() {
  const { isAuthenticated } = useSupabaseSession();
  const queryClient = useQueryClient();
  const [sellerId, setSellerId] = useState("");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ["admin", "finance", "overview"],
    queryFn: getFinanceOverview,
    enabled: isAuthenticated === true,
    retry: false,
  });

  const {
    data: payouts,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin", "finance", "payouts"],
    queryFn: listPayouts,
    enabled: isAuthenticated === true,
    retry: false,
  });

  const { data: sellers } = useQuery({
    queryKey: ["admin", "sellers", "list"],
    queryFn: listSellers,
    enabled: isAuthenticated === true,
    retry: false,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "finance"] });
  };

  const createMutation = useMutation({
    mutationFn: createPayoutRun,
    onSuccess: () => {
      invalidate();
      toast.success("Выплата рассчитана");
      setSellerId("");
      setPeriodStart("");
      setPeriodEnd("");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Не удалось рассчитать выплату"),
  });

  const completeMutation = useMutation({
    mutationFn: completePayout,
    onSuccess: () => {
      invalidate();
      toast.success("Выплата отмечена как завершённая");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Не удалось завершить выплату"),
  });

  const handleSignIn = async () => {
    await signInWithGoogle(window.location.origin + "/admin/finance");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!sellerId) {
      setFormError("Выберите продавца");
      return;
    }
    if (!periodStart || !periodEnd) {
      setFormError("Укажите период");
      return;
    }
    createMutation.mutate({
      sellerId,
      periodStart: new Date(periodStart).toISOString(),
      periodEnd: new Date(periodEnd).toISOString(),
    });
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
          <LogIn className="h-10 w-10 text-primary mx-auto mb-4" />
          <h1 className="font-serif text-3xl tracking-tight">Финансы</h1>
          <p className="mt-3 text-muted-foreground">Войдите с учётной записью администратора.</p>
          <Button size="lg" className="mt-6 h-12 rounded-full" onClick={() => void handleSignIn()}>
            Войти
          </Button>
        </div>
      </AdminLayout>
    );
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  if (isError) {
    const message = error instanceof Error ? error.message : "Не удалось загрузить выплаты";
    const isForbidden =
      message.toLowerCase().includes("access denied") ||
      message.toLowerCase().includes("admin role") ||
      message.toLowerCase().includes("scope");

    return (
      <AdminLayout>
        <div className="max-w-md mx-auto text-center py-24">
          {isForbidden ? (
            <>
              <ShieldAlert className="h-10 w-10 text-primary mx-auto mb-4" />
              <h1 className="font-serif text-3xl tracking-tight">Доступ запрещён</h1>
              <p className="mt-3 text-muted-foreground">
                Эта страница доступна только администраторам.
              </p>
            </>
          ) : (
            <>
              <p className="text-muted-foreground">{message}</p>
              <Button size="lg" className="mt-6 h-12 rounded-full" onClick={() => void refetch()}>
                Повторить
              </Button>
            </>
          )}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Button asChild variant="ghost" className="mb-6 -ml-2 rounded-full">
          <Link to="/admin">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Административная платформа
          </Link>
        </Button>

        <h1 className="font-serif text-4xl tracking-tight">Финансы</h1>
        <p className="mt-2 text-muted-foreground">
          Выплаты продавцам и комиссия платформы (см.{" "}
          <code className="text-sm">docs/admin-platform/finance.md</code>). Сверка с платёжным
          провайдером заблокирована до завершения интеграции Finik.
        </p>

        {!overviewLoading && overview && (
          <div className="mt-8 grid gap-4 grid-cols-2 sm:grid-cols-4">
            <div className="rounded-2xl border border-border/60 bg-card p-6">
              <p className="text-sm text-muted-foreground">Оборот</p>
              <p className="mt-2 font-serif text-2xl">{formatMoney(overview.totalRevenue)}</p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card p-6">
              <p className="text-sm text-muted-foreground">Комиссия</p>
              <p className="mt-2 font-serif text-2xl">{formatMoney(overview.totalCommission)}</p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card p-6">
              <p className="text-sm text-muted-foreground">Выплачено</p>
              <p className="mt-2 font-serif text-2xl">{formatMoney(overview.totalPayouts)}</p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card p-6">
              <p className="text-sm text-muted-foreground">Ожидают</p>
              <p className="mt-2 font-serif text-2xl">{overview.pendingPayoutCount}</p>
            </div>
          </div>
        )}

        <section className="mt-6 rounded-2xl border border-border/60 bg-card p-6">
          {!payouts || payouts.length === 0 ? (
            <div className="py-8 text-center">
              <Banknote className="h-6 w-6 text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Выплат пока нет.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {payouts.map((payout) => (
                <li
                  key={payout.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-secondary/40 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="font-medium">{formatMoney(payout.payoutAmount)}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {new Date(payout.periodStart).toLocaleDateString("ru-RU")} —{" "}
                      {new Date(payout.periodEnd).toLocaleDateString("ru-RU")} · комиссия{" "}
                      {formatMoney(payout.commissionAmount)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={payout.status === "COMPLETED" ? "secondary" : "outline"}>
                      {payout.status === "COMPLETED" ? "Завершена" : "Ожидает"}
                    </Badge>
                    {payout.status === "PENDING" && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={completeMutation.isPending}
                        onClick={() => completeMutation.mutate(payout.id)}
                      >
                        Завершить
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mt-6 rounded-2xl border border-border/60 bg-card p-6">
          <h2 className="font-serif text-2xl mb-4">Рассчитать выплату</h2>
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="payout-seller">Продавец</Label>
              <select
                id="payout-seller"
                value={sellerId}
                onChange={(e) => setSellerId(e.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Выберите продавца</option>
                {(sellers ?? []).map((seller) => (
                  <option key={seller.userId} value={seller.userId}>
                    {seller.storeName}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="payout-start">Начало периода</Label>
              <Input
                id="payout-start"
                type="date"
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="payout-end">Конец периода</Label>
              <Input
                id="payout-end"
                type="date"
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              className="h-12 rounded-full sm:col-span-3"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Рассчитать выплату"
              )}
            </Button>
          </form>
          {formError && <p className="mt-2 text-sm text-destructive">{formError}</p>}
        </section>
      </div>
    </AdminLayout>
  );
}
