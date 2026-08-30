import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getBroadcastAudience, sendPushBroadcast } from "@/api/push-broadcast";
import { signInWithGoogle } from "@/lib/auth";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { ArrowLeft, Bell, LogIn, ShieldAlert, Users, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/marketing/broadcast")({
  component: AdminPushBroadcastPage,
});

const TITLE_MAX = 80;
const BODY_MAX = 180;

function AdminPushBroadcastPage() {
  const { isAuthenticated } = useSupabaseSession();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const audienceQuery = useQuery({
    queryKey: ["admin", "marketing", "broadcast-audience"],
    queryFn: getBroadcastAudience,
    enabled: isAuthenticated === true,
    retry: false,
    // Задача №218 — while a cooldown from a just-sent broadcast is active, poll
    // so the countdown/unlock is accurate without the admin needing to refresh.
    refetchInterval: (query) => (query.state.data?.cooldownRemainingSeconds != null ? 5000 : false),
  });

  const invalidateAudience = () =>
    queryClient.invalidateQueries({ queryKey: ["admin", "marketing", "broadcast-audience"] });

  const sendMutation = useMutation({
    mutationFn: sendPushBroadcast,
    onSuccess: (result) => {
      invalidateAudience();
      toast.success(`Отправлено ${result.recipientCount} покупателям`);
      setTitle("");
      setBody("");
      setConfirmOpen(false);
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : "Не удалось отправить рассылку");
      setConfirmOpen(false);
    },
  });

  const handleSignIn = async () => {
    await signInWithGoogle();
  };

  const trimmedTitle = title.trim();
  const trimmedBody = body.trim();
  const audience = audienceQuery.data;
  const isOnCooldown = !!audience && audience.cooldownRemainingSeconds != null;
  const formValid =
    trimmedTitle.length >= 2 &&
    trimmedTitle.length <= TITLE_MAX &&
    trimmedBody.length >= 2 &&
    trimmedBody.length <= BODY_MAX;

  const handleOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValid) return;
    setConfirmOpen(true);
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
          <h1 className="font-serif text-3xl tracking-tight">Массовая рассылка push</h1>
          <p className="mt-3 text-muted-foreground">Войдите с учётной записью администратора.</p>
          <Button size="lg" className="mt-6 h-12 rounded-full" onClick={() => void handleSignIn()}>
            Войти
          </Button>
        </div>
      </AdminLayout>
    );
  }

  if (audienceQuery.isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  if (audienceQuery.isError) {
    const message =
      audienceQuery.error instanceof Error
        ? audienceQuery.error.message
        : "Не удалось загрузить данные";
    const isForbidden =
      message.toLowerCase().includes("access denied") ||
      message.toLowerCase().includes("admin role") ||
      message.toLowerCase().includes("scope") ||
      message.toLowerCase().includes("permission");

    return (
      <AdminLayout>
        <div className="max-w-md mx-auto text-center py-24">
          {isForbidden ? (
            <>
              <ShieldAlert className="h-10 w-10 text-primary mx-auto mb-4" />
              <h1 className="font-serif text-3xl tracking-tight">Доступ запрещён</h1>
              <p className="mt-3 text-muted-foreground">
                Эта страница доступна только администраторам с доступом к маркетингу.
              </p>
            </>
          ) : (
            <>
              <p className="text-muted-foreground">{message}</p>
              <Button
                size="lg"
                className="mt-6 h-12 rounded-full"
                onClick={() => void audienceQuery.refetch()}
              >
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
      <div className="mx-auto max-w-2xl px-6 py-12">
        <Link
          to="/admin/marketing"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Маркетинг
        </Link>
        <h1 className="mt-2 font-serif text-4xl tracking-tight">Массовая рассылка push</h1>
        <p className="mt-2 text-muted-foreground">
          Одно push-уведомление сразу всем покупателям с включёнными уведомлениями (курьеры, склад и
          администраторы в рассылку не входят).
        </p>

        <section className="mt-6 flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-4">
          <Users className="h-5 w-5 shrink-0 text-primary" />
          <p className="text-sm">
            Сейчас получат уведомление: <strong>{audience?.customerCount ?? 0}</strong>{" "}
            {audience?.customerCount === 1 ? "покупатель" : "покупателей"}
          </p>
        </section>

        {isOnCooldown && (
          <p className="mt-3 text-sm text-muted-foreground">
            Рассылка недавно отправлялась — повторная отправка будет доступна через{" "}
            {audience!.cooldownRemainingSeconds} сек. Это защита от случайного повторного нажатия.
          </p>
        )}

        <form
          onSubmit={handleOpenConfirm}
          className="mt-6 grid gap-4 rounded-2xl border border-border/60 bg-card p-6"
        >
          <div className="grid gap-2">
            <Label htmlFor="broadcast-title">Заголовок</Label>
            <Input
              id="broadcast-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Скидка на выходные"
              maxLength={TITLE_MAX}
            />
            <p className="text-xs text-muted-foreground text-right">
              {title.trim().length}/{TITLE_MAX}
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="broadcast-body">Текст акции</Label>
            <Textarea
              id="broadcast-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="В эти выходные скидка 10% на всю молочную продукцию!"
              maxLength={BODY_MAX}
              rows={4}
            />
            <p className="text-xs text-muted-foreground text-right">
              {body.trim().length}/{BODY_MAX}
            </p>
          </div>
          <Button
            type="submit"
            className="h-12 rounded-full"
            disabled={!formValid || isOnCooldown || sendMutation.isPending}
          >
            <Bell className="h-4 w-4" /> Отправить всем покупателям
          </Button>
        </form>

        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Отправить push всем покупателям?</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-3 text-left">
                  <p>
                    Уведомление получат <strong>{audience?.customerCount ?? 0}</strong>{" "}
                    {audience?.customerCount === 1 ? "покупатель" : "покупателей"}. Это действие
                    нельзя отменить после отправки.
                  </p>
                  <div className="rounded-lg border border-border/60 bg-muted/40 p-3">
                    <p className="font-medium text-foreground">{trimmedTitle}</p>
                    <p className="text-sm text-foreground/80">{trimmedBody}</p>
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={sendMutation.isPending}>Отмена</AlertDialogCancel>
              <AlertDialogAction
                disabled={sendMutation.isPending}
                onClick={() => sendMutation.mutate({ title: trimmedTitle, body: trimmedBody })}
              >
                {sendMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Отправить"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}
