import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ImageUploadField } from "@/components/shared/ImageUploadField";
import { createBanner, listBanners, updateBanner } from "@/api/design";
import { signInWithGoogle } from "@/lib/auth";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { ArrowLeft, Image as ImageIcon, Loader2, LogIn, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/design/")({
  component: AdminDesignPage,
});

function AdminDesignPage() {
  const { isAuthenticated } = useSupabaseSession();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const {
    data: banners,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin", "design", "banners"],
    queryFn: listBanners,
    enabled: isAuthenticated === true,
    retry: false,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["admin", "design", "banners"] });

  const createMutation = useMutation({
    mutationFn: createBanner,
    onSuccess: () => {
      invalidate();
      toast.success("Баннер создан");
      setTitle("");
      setImageUrl("");
      setLinkUrl("");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Не удалось создать баннер"),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: updateBanner,
    onSuccess: () => {
      invalidate();
      toast.success("Баннер обновлён");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Не удалось обновить баннер"),
  });

  const handleSignIn = async () => {
    await signInWithGoogle();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!title.trim() || title.trim().length < 2) {
      setFormError("Заголовок должен содержать минимум 2 символа");
      return;
    }
    createMutation.mutate({
      title: title.trim(),
      imageUrl: imageUrl.trim() || null,
      linkUrl: linkUrl.trim() || null,
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
          <h1 className="font-serif text-3xl tracking-tight">Оформление</h1>
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
    const message = error instanceof Error ? error.message : "Не удалось загрузить баннеры";
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

        <h1 className="font-serif text-4xl tracking-tight">Оформление — баннеры</h1>

        <section className="mt-8 rounded-2xl border border-border/60 bg-card p-6">
          {!banners || banners.length === 0 ? (
            <div className="py-8 text-center">
              <ImageIcon className="h-6 w-6 text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Баннеров пока нет.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {banners.map((banner) => (
                <li
                  key={banner.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-secondary/40 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="font-medium truncate">{banner.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {banner.linkUrl ?? "без ссылки"}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={toggleActiveMutation.isPending}
                    onClick={() =>
                      toggleActiveMutation.mutate({ id: banner.id, isActive: !banner.isActive })
                    }
                  >
                    <Badge variant={banner.isActive ? "secondary" : "outline"}>
                      {banner.isActive ? "Активен" : "Скрыт"}
                    </Badge>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mt-6 rounded-2xl border border-border/60 bg-card p-6">
          <h2 className="font-serif text-2xl mb-4">Новый баннер</h2>
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="banner-title">Заголовок</Label>
              <Input
                id="banner-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
              />
            </div>
            <div className="grid gap-2">
              <ImageUploadField
                value={imageUrl || null}
                onChange={(url) => setImageUrl(url ?? "")}
                context="banner"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="banner-link">Ссылка перехода</Label>
              <Input
                id="banner-link"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="/#products"
              />
            </div>
            <Button
              type="submit"
              className="h-12 rounded-full sm:col-span-3"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Создать"}
            </Button>
          </form>
          {formError && <p className="mt-2 text-sm text-destructive">{formError}</p>}
        </section>
      </div>
    </AdminLayout>
  );
}
