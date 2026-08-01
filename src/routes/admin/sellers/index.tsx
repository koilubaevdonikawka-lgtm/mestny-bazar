import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { listSellers, rejectSeller, verifySeller } from "@/api/seller-profile";
import { signInWithGoogle } from "@/lib/auth";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { ArrowLeft, Loader2, LogIn, ShieldAlert, Store } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/sellers/")({
  component: AdminSellersPage,
});

const STATUS_LABEL: Record<string, string> = {
  PENDING: "На проверке",
  VERIFIED: "Проверен",
  REJECTED: "Отклонён",
};

function AdminSellersPage() {
  const { isAuthenticated } = useSupabaseSession();
  const queryClient = useQueryClient();

  const {
    data: sellers,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin", "sellers", "list"],
    queryFn: listSellers,
    enabled: isAuthenticated === true,
    retry: false,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["admin", "sellers", "list"] });

  const verifyMutation = useMutation({
    mutationFn: verifySeller,
    onSuccess: () => {
      invalidate();
      toast.success("Продавец проверен");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Не удалось подтвердить продавца"),
  });

  const rejectMutation = useMutation({
    mutationFn: rejectSeller,
    onSuccess: () => {
      invalidate();
      toast.success("Продавец отклонён");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Не удалось отклонить продавца"),
  });

  const handleSignIn = async () => {
    await signInWithGoogle(window.location.origin + "/admin/sellers");
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
          <h1 className="font-serif text-3xl tracking-tight">Продавцы</h1>
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
    const message = error instanceof Error ? error.message : "Не удалось загрузить продавцов";
    const isForbidden =
      message.toLowerCase().includes("access denied") ||
      message.toLowerCase().includes("admin role");

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

        <h1 className="font-serif text-4xl tracking-tight">Продавцы</h1>
        <p className="mt-2 text-muted-foreground">
          Профили продавцов и верификация (см.{" "}
          <code className="text-sm">docs/admin-platform/sellers.md</code>).
        </p>

        <section className="mt-8 rounded-2xl border border-border/60 bg-card p-6">
          {!sellers || sellers.length === 0 ? (
            <div className="py-8 text-center">
              <Store className="h-6 w-6 text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Продавцов пока нет.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {sellers.map((seller) => (
                <li
                  key={seller.userId}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-secondary/40 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="font-medium truncate">{seller.storeName}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {seller.contactPhone ?? "—"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={seller.verificationStatus === "VERIFIED" ? "secondary" : "outline"}
                    >
                      {STATUS_LABEL[seller.verificationStatus]}
                    </Badge>
                    {seller.verificationStatus !== "VERIFIED" && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={verifyMutation.isPending}
                        onClick={() => verifyMutation.mutate(seller.userId)}
                      >
                        Подтвердить
                      </Button>
                    )}
                    {seller.verificationStatus !== "REJECTED" && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={rejectMutation.isPending}
                        onClick={() => rejectMutation.mutate(seller.userId)}
                      >
                        Отклонить
                      </Button>
                    )}
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
