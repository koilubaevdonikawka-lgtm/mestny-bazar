import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  cancelSupply,
  confirmSupply,
  createSupplier,
  createSupply,
  listSuppliers,
  listSupplies,
  receiveSupply,
  sendSupply,
} from "@/api/supplier";
import { signInWithGoogle } from "@/lib/auth";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { ArrowLeft, Loader2, LogIn, ShieldAlert, Truck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/suppliers/")({
  component: AdminSuppliersPage,
});

function AdminSuppliersPage() {
  const { isAuthenticated } = useSupabaseSession();
  const queryClient = useQueryClient();
  const [supplierName, setSupplierName] = useState("");
  const [supplyForm, setSupplyForm] = useState({
    supplierId: "",
    productId: "",
    quantity: "",
    purchasePrice: "",
  });

  const suppliersQuery = useQuery({
    queryKey: ["admin", "suppliers", "list"],
    queryFn: listSuppliers,
    enabled: isAuthenticated === true,
    retry: false,
  });

  const suppliesQuery = useQuery({
    queryKey: ["admin", "supplies", "list"],
    queryFn: listSupplies,
    enabled: isAuthenticated === true,
    retry: false,
  });

  const invalidateSuppliers = () =>
    queryClient.invalidateQueries({ queryKey: ["admin", "suppliers", "list"] });
  const invalidateSupplies = () =>
    queryClient.invalidateQueries({ queryKey: ["admin", "supplies", "list"] });

  const createSupplierMutation = useMutation({
    mutationFn: createSupplier,
    onSuccess: () => {
      invalidateSuppliers();
      toast.success("Поставщик добавлен");
      setSupplierName("");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Не удалось добавить поставщика"),
  });

  const createSupplyMutation = useMutation({
    mutationFn: createSupply,
    onSuccess: () => {
      invalidateSupplies();
      toast.success("Заявка на поставку создана");
      setSupplyForm({ supplierId: "", productId: "", quantity: "", purchasePrice: "" });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Не удалось создать заявку"),
  });

  const sendMutation = useMutation({
    mutationFn: sendSupply,
    onSuccess: () => {
      invalidateSupplies();
      toast.success("Заявка отправлена поставщику");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Не удалось отправить заявку"),
  });

  const confirmMutation = useMutation({
    mutationFn: confirmSupply,
    onSuccess: () => {
      invalidateSupplies();
      toast.success("Заявка подтверждена");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Не удалось подтвердить заявку"),
  });

  const receiveMutation = useMutation({
    mutationFn: receiveSupply,
    onSuccess: () => {
      invalidateSupplies();
      toast.success("Поставка принята — остатки обновлены");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Не удалось принять поставку"),
  });

  const cancelMutation = useMutation({
    mutationFn: cancelSupply,
    onSuccess: () => {
      invalidateSupplies();
      toast.success("Заявка отменена");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Не удалось отменить заявку"),
  });

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
          <LogIn className="h-10 w-10 text-primary mx-auto mb-4" />
          <h1 className="font-serif text-3xl tracking-tight">Поставщики</h1>
          <p className="mt-3 text-muted-foreground">
            Войдите с учётной записью администратора или склада.
          </p>
          <Button size="lg" className="mt-6 h-12 rounded-full" onClick={() => void handleSignIn()}>
            Войти
          </Button>
        </div>
      </AdminLayout>
    );
  }

  if (suppliersQuery.isLoading || suppliesQuery.isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  const anyError = suppliersQuery.error ?? suppliesQuery.error;
  if (anyError) {
    const message = anyError instanceof Error ? anyError.message : "Не удалось загрузить данные";
    const isForbidden =
      message.toLowerCase().includes("access denied") ||
      message.toLowerCase().includes("admin role") ||
      message.toLowerCase().includes("warehouse role");

    return (
      <AdminLayout>
        <div className="max-w-md mx-auto text-center py-24">
          {isForbidden ? (
            <>
              <ShieldAlert className="h-10 w-10 text-primary mx-auto mb-4" />
              <h1 className="font-serif text-3xl tracking-tight">Доступ запрещён</h1>
              <p className="mt-3 text-muted-foreground">
                Список поставщиков доступен администраторам; заявки на поставку — администраторам и
                складу.
              </p>
            </>
          ) : (
            <p className="text-muted-foreground">{message}</p>
          )}
        </div>
      </AdminLayout>
    );
  }

  const suppliers = suppliersQuery.data ?? [];
  const supplies = suppliesQuery.data ?? [];

  return (
    <AdminLayout>
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Button asChild variant="ghost" className="mb-6 -ml-2 rounded-full">
          <Link to="/admin">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Административная платформа
          </Link>
        </Button>

        <h1 className="font-serif text-4xl tracking-tight">Поставщики</h1>
        <p className="mt-2 text-muted-foreground">
          Список поставщиков и заявки на пополнение (см.{" "}
          <code className="text-sm">docs/admin-platform/suppliers.md</code>).
        </p>

        <section className="mt-8 rounded-2xl border border-border/60 bg-card p-6">
          <h2 className="font-serif text-2xl mb-4">Поставщики</h2>
          {suppliers.length === 0 ? (
            <div className="py-6 text-center text-muted-foreground">
              <Truck className="h-6 w-6 text-primary mx-auto mb-3" />
              Поставщиков пока нет.
            </div>
          ) : (
            <ul className="space-y-2 mb-4">
              {suppliers.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between rounded-xl bg-secondary/40 px-4 py-3"
                >
                  <span className="truncate">{s.name}</span>
                  <Badge variant={s.isActive ? "secondary" : "outline"}>
                    {s.isActive ? "Активен" : "Неактивен"}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!supplierName.trim() || supplierName.trim().length < 2) {
                toast.error("Название должно содержать минимум 2 символа");
                return;
              }
              createSupplierMutation.mutate({ name: supplierName.trim() });
            }}
            className="flex flex-wrap gap-3"
          >
            <Input
              value={supplierName}
              onChange={(e) => setSupplierName(e.target.value)}
              placeholder="Новый поставщик"
              className="flex-1 min-w-[200px]"
            />
            <Button type="submit" disabled={createSupplierMutation.isPending}>
              {createSupplierMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Добавить"
              )}
            </Button>
          </form>
        </section>

        <section className="mt-6 rounded-2xl border border-border/60 bg-card p-6">
          <h2 className="font-serif text-2xl mb-4">Заявки на поставку</h2>
          {supplies.length === 0 ? (
            <p className="text-muted-foreground py-4">Заявок пока нет.</p>
          ) : (
            <ul className="space-y-3 mb-6">
              {supplies.map((supply) => (
                <li key={supply.id} className="rounded-xl bg-secondary/40 px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm">
                      {supply.items.length} {supply.items.length === 1 ? "позиция" : "позиций"}
                    </span>
                    <Badge variant="outline">{supply.status}</Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {supply.status === "DRAFT" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => sendMutation.mutate(supply.id)}
                      >
                        Отправить
                      </Button>
                    )}
                    {supply.status === "SENT" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => confirmMutation.mutate(supply.id)}
                      >
                        Подтвердить
                      </Button>
                    )}
                    {(supply.status === "DRAFT" ||
                      supply.status === "SENT" ||
                      supply.status === "CONFIRMED") && (
                      <Button size="sm" onClick={() => receiveMutation.mutate(supply.id)}>
                        Принять поставку
                      </Button>
                    )}
                    {supply.status !== "RECEIVED" && supply.status !== "CANCELLED" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => cancelMutation.mutate(supply.id)}
                      >
                        Отменить
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const quantity = Number(supplyForm.quantity);
              const purchasePrice = Number(supplyForm.purchasePrice);
              if (
                !supplyForm.supplierId.trim() ||
                !supplyForm.productId.trim() ||
                !Number.isInteger(quantity) ||
                quantity <= 0 ||
                !Number.isFinite(purchasePrice) ||
                purchasePrice < 0
              ) {
                toast.error(
                  "Заполните ID поставщика, ID товара, количество и закупочную цену корректно",
                );
                return;
              }
              createSupplyMutation.mutate({
                supplierId: supplyForm.supplierId.trim(),
                items: [{ productId: supplyForm.productId.trim(), quantity, purchasePrice }],
              });
            }}
            className="grid gap-3 sm:grid-cols-2"
          >
            <div className="grid gap-2">
              <Label htmlFor="supply-supplier">ID поставщика</Label>
              <Input
                id="supply-supplier"
                value={supplyForm.supplierId}
                onChange={(e) => setSupplyForm((p) => ({ ...p, supplierId: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="supply-product">ID товара</Label>
              <Input
                id="supply-product"
                value={supplyForm.productId}
                onChange={(e) => setSupplyForm((p) => ({ ...p, productId: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="supply-quantity">Количество</Label>
              <Input
                id="supply-quantity"
                type="number"
                min={1}
                value={supplyForm.quantity}
                onChange={(e) => setSupplyForm((p) => ({ ...p, quantity: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="supply-price">Закупочная цена</Label>
              <Input
                id="supply-price"
                type="number"
                min={0}
                step="0.01"
                value={supplyForm.purchasePrice}
                onChange={(e) => setSupplyForm((p) => ({ ...p, purchasePrice: e.target.value }))}
              />
            </div>
            <Button
              type="submit"
              className="sm:col-span-2"
              disabled={createSupplyMutation.isPending}
            >
              {createSupplyMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Создать заявку"
              )}
            </Button>
          </form>
        </section>
      </div>
    </AdminLayout>
  );
}
