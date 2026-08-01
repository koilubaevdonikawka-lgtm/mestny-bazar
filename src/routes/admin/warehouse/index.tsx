import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { adjustStock, listStock, setStockThreshold } from "@/api/warehouse-admin";
import { signInWithGoogle } from "@/lib/auth";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { ArrowLeft, Loader2, LogIn, ShieldAlert, Warehouse as WarehouseIcon } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/warehouse/")({
  component: AdminWarehousePage,
});

const STATUS_LABEL: Record<string, string> = {
  ok: "В норме",
  low: "Низкий остаток",
  depleted: "Нет в наличии",
};

function AdminWarehousePage() {
  const { isAuthenticated } = useSupabaseSession();
  const queryClient = useQueryClient();
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [thresholdEdits, setThresholdEdits] = useState<Record<string, string>>({});

  const {
    data: items,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin", "warehouse", "stock"],
    queryFn: listStock,
    enabled: isAuthenticated === true,
    retry: false,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["admin", "warehouse", "stock"] });

  const adjustMutation = useMutation({
    mutationFn: adjustStock,
    onSuccess: () => {
      invalidate();
      toast.success("Остаток обновлён");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Не удалось обновить остаток"),
  });

  const thresholdMutation = useMutation({
    mutationFn: setStockThreshold,
    onSuccess: () => {
      invalidate();
      toast.success("Порог обновлён");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Не удалось обновить порог"),
  });

  const handleSignIn = async () => {
    await signInWithGoogle(window.location.origin + "/admin/warehouse");
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
          <h1 className="font-serif text-3xl tracking-tight">Склад</h1>
          <p className="mt-3 text-muted-foreground">Войдите с учётной записью склада.</p>
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
    const message = error instanceof Error ? error.message : "Не удалось загрузить остатки";
    const isForbidden =
      message.toLowerCase().includes("access denied") ||
      message.toLowerCase().includes("warehouse role") ||
      message.toLowerCase().includes("admin role");

    return (
      <AdminLayout>
        <div className="max-w-md mx-auto text-center py-24">
          {isForbidden ? (
            <>
              <ShieldAlert className="h-10 w-10 text-primary mx-auto mb-4" />
              <h1 className="font-serif text-3xl tracking-tight">Доступ запрещён</h1>
              <p className="mt-3 text-muted-foreground">
                Эта страница доступна только сотрудникам склада.
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

        <h1 className="font-serif text-4xl tracking-tight">Склад — остатки</h1>
        <p className="mt-2 text-muted-foreground">
          Ручная корректировка остатка и пороги предупреждения (см.{" "}
          <code className="text-sm">docs/admin-platform/warehouse.md</code>).
        </p>

        <section className="mt-8 rounded-2xl border border-border/60 bg-card p-6">
          {!items || items.length === 0 ? (
            <div className="py-8 text-center">
              <WarehouseIcon className="h-6 w-6 text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Товаров пока нет.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((item) => (
                <li key={item.productId} className="rounded-xl bg-secondary/40 px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium truncate">{item.name}</p>
                    <Badge variant={item.status === "ok" ? "secondary" : "destructive"}>
                      {STATUS_LABEL[item.status]}
                    </Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Input
                      className="w-24"
                      type="number"
                      min={0}
                      placeholder={String(item.stock)}
                      value={edits[item.productId] ?? ""}
                      onChange={(e) =>
                        setEdits((prev) => ({ ...prev, [item.productId]: e.target.value }))
                      }
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={adjustMutation.isPending || !edits[item.productId]}
                      onClick={() => {
                        const value = Number(edits[item.productId]);
                        if (!Number.isInteger(value) || value < 0) {
                          toast.error("Остаток должен быть неотрицательным целым числом");
                          return;
                        }
                        adjustMutation.mutate({ productId: item.productId, stock: value });
                      }}
                    >
                      Скорректировать остаток
                    </Button>
                    <Input
                      className="w-24"
                      type="number"
                      min={0}
                      placeholder={`порог: ${item.effectiveThreshold}`}
                      value={thresholdEdits[item.productId] ?? ""}
                      onChange={(e) =>
                        setThresholdEdits((prev) => ({ ...prev, [item.productId]: e.target.value }))
                      }
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={thresholdMutation.isPending || !thresholdEdits[item.productId]}
                      onClick={() => {
                        const value = Number(thresholdEdits[item.productId]);
                        if (!Number.isInteger(value) || value < 0) {
                          toast.error("Порог должен быть неотрицательным целым числом");
                          return;
                        }
                        thresholdMutation.mutate({ productId: item.productId, threshold: value });
                      }}
                    >
                      Задать порог
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AdminLayout>
  );
}
