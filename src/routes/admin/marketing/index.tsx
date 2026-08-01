import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { createCoupon, listCoupons, updateCoupon } from "@/api/marketing";
import type { CouponDiscountType } from "@shared/contracts/coupon";
import { signInWithGoogle } from "@/lib/auth";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { ArrowLeft, Loader2, LogIn, ShieldAlert, Tag } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/marketing/")({
  component: AdminMarketingPage,
});

function AdminMarketingPage() {
  const { isAuthenticated } = useSupabaseSession();
  const queryClient = useQueryClient();
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<CouponDiscountType>("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const {
    data: coupons,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin", "marketing", "coupons"],
    queryFn: listCoupons,
    enabled: isAuthenticated === true,
    retry: false,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["admin", "marketing", "coupons"] });

  const createMutation = useMutation({
    mutationFn: createCoupon,
    onSuccess: () => {
      invalidate();
      toast.success("Купон создан");
      setCode("");
      setDiscountValue("");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Не удалось создать купон"),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: updateCoupon,
    onSuccess: () => {
      invalidate();
      toast.success("Купон обновлён");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Не удалось обновить купон"),
  });

  const handleSignIn = async () => {
    await signInWithGoogle(window.location.origin + "/admin/marketing");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const value = Number(discountValue);
    if (!code.trim() || code.trim().length < 3) {
      setFormError("Код должен содержать минимум 3 символа");
      return;
    }
    if (!value || value <= 0) {
      setFormError("Укажите размер скидки");
      return;
    }
    createMutation.mutate({ code: code.trim(), discountType, discountValue: value });
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
          <h1 className="font-serif text-3xl tracking-tight">Маркетинг</h1>
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
    const message = error instanceof Error ? error.message : "Не удалось загрузить купоны";
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

        <h1 className="font-serif text-4xl tracking-tight">Маркетинг — купоны</h1>
        <p className="mt-2 text-muted-foreground">
          Скидка проверяется и рассчитывается на сервере при оформлении заказа (см.{" "}
          <code className="text-sm">docs/admin-platform/marketing.md</code>). Поле ввода кода купона
          на витрине — следующий этап; сейчас купоны можно применить только через API.
        </p>

        <section className="mt-8 rounded-2xl border border-border/60 bg-card p-6">
          {!coupons || coupons.length === 0 ? (
            <div className="py-8 text-center">
              <Tag className="h-6 w-6 text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Купонов пока нет.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {coupons.map((coupon) => (
                <li
                  key={coupon.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-secondary/40 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="font-medium truncate">{coupon.code}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {coupon.discountType === "PERCENTAGE"
                        ? `${coupon.discountValue}%`
                        : `${coupon.discountValue} сом`}{" "}
                      · использован {coupon.usesCount}
                      {coupon.maxUses ? ` из ${coupon.maxUses}` : ""} раз
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={toggleActiveMutation.isPending}
                    onClick={() =>
                      toggleActiveMutation.mutate({ id: coupon.id, isActive: !coupon.isActive })
                    }
                  >
                    <Badge variant={coupon.isActive ? "secondary" : "outline"}>
                      {coupon.isActive ? "Активен" : "Выключен"}
                    </Badge>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mt-6 rounded-2xl border border-border/60 bg-card p-6">
          <h2 className="font-serif text-2xl mb-4">Новый купон</h2>
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-4 sm:items-end">
            <div className="grid gap-2">
              <Label htmlFor="coupon-code">Код</Label>
              <Input
                id="coupon-code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="LETO2026"
                maxLength={50}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="coupon-type">Тип</Label>
              <select
                id="coupon-type"
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as CouponDiscountType)}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="PERCENTAGE">Процент</option>
                <option value="FIXED">Фиксированная сумма</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="coupon-value">Размер</Label>
              <Input
                id="coupon-value"
                type="number"
                min={0}
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
              />
            </div>
            <Button type="submit" className="h-12 rounded-full" disabled={createMutation.isPending}>
              {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Создать"}
            </Button>
          </form>
          {formError && <p className="mt-2 text-sm text-destructive">{formError}</p>}
        </section>
      </div>
    </AdminLayout>
  );
}
