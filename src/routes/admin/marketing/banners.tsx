import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ImageUploadField } from "@/components/shared/ImageUploadField";
import { createBanner, listBanners, updateBanner } from "@/api/banner";
import type { BannerDTO } from "@shared/contracts/banner";
import { signInWithGoogle } from "@/lib/auth";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { ArrowLeft, Image as ImageIcon, Loader2, LogIn, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/marketing/banners")({
  component: AdminBannersPage,
});

type BannerStatus = "active" | "scheduled" | "expired" | "hidden";

/** Задача №219 — the same isActive+startsAt/endsAt window logic BannerService.listActiveBanners() applies server-side (banner.service.ts), mirrored here purely for the admin's own status label — never used to decide what a buyer sees. */
function bannerStatus(banner: BannerDTO): BannerStatus {
  if (!banner.isActive) return "hidden";
  const now = Date.now();
  if (banner.startsAt && new Date(banner.startsAt).getTime() > now) return "scheduled";
  if (banner.endsAt && new Date(banner.endsAt).getTime() < now) return "expired";
  return "active";
}

const STATUS_LABEL: Record<BannerStatus, string> = {
  active: "Активен сейчас",
  scheduled: "Запланирован",
  expired: "Истёк",
  hidden: "Скрыт",
};

const STATUS_BADGE_VARIANT: Record<BannerStatus, "secondary" | "outline"> = {
  active: "secondary",
  scheduled: "outline",
  expired: "outline",
  hidden: "outline",
};

/** "2026-08-31T00:00:00.000Z" -> "2026-08-31" for a date <input>; null/undefined -> "". */
function toDateInputValue(iso: string | null | undefined): string {
  return iso ? iso.slice(0, 10) : "";
}

/** "2026-08-31" from a date <input> -> a real ISO instant; "" -> null (cleared). */
function fromDateInputValue(value: string): string | null {
  return value ? new Date(value).toISOString() : null;
}

function AdminBannersPage() {
  const { isAuthenticated } = useSupabaseSession();
  const queryClient = useQueryClient();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const {
    data: banners,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin", "marketing", "banners"],
    queryFn: listBanners,
    enabled: isAuthenticated === true,
    retry: false,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["admin", "marketing", "banners"] });

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setSubtitle("");
    setImageUrl("");
    setLinkUrl("");
    setSortOrder("0");
    setStartsAt("");
    setEndsAt("");
    setFormError(null);
  };

  const createMutation = useMutation({
    mutationFn: createBanner,
    onSuccess: () => {
      invalidate();
      toast.success("Баннер создан");
      resetForm();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Не удалось создать баннер"),
  });

  const updateMutation = useMutation({
    mutationFn: updateBanner,
    onSuccess: () => {
      invalidate();
      toast.success("Баннер обновлён");
      resetForm();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Не удалось обновить баннер"),
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

  const openEditBanner = (banner: BannerDTO) => {
    setEditingId(banner.id);
    setTitle(banner.title);
    setSubtitle(banner.subtitle ?? "");
    setImageUrl(banner.imageUrl ?? "");
    setLinkUrl(banner.linkUrl ?? "");
    setSortOrder(String(banner.sortOrder));
    setStartsAt(toDateInputValue(banner.startsAt));
    setEndsAt(toDateInputValue(banner.endsAt));
    setFormError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!title.trim() || title.trim().length < 2) {
      setFormError("Заголовок должен содержать минимум 2 символа");
      return;
    }
    const sortOrderValue = Number(sortOrder);
    if (!Number.isFinite(sortOrderValue) || sortOrderValue < 0) {
      setFormError("Порядок показа должен быть неотрицательным числом");
      return;
    }
    const startsAtIso = fromDateInputValue(startsAt);
    const endsAtIso = fromDateInputValue(endsAt);
    if (startsAtIso && endsAtIso && startsAtIso > endsAtIso) {
      setFormError("Дата окончания не может быть раньше даты начала");
      return;
    }

    const payload = {
      title: title.trim(),
      subtitle: subtitle.trim() || null,
      imageUrl: imageUrl.trim() || null,
      linkUrl: linkUrl.trim() || null,
      sortOrder: sortOrderValue,
      startsAt: startsAtIso,
      endsAt: endsAtIso,
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, ...payload });
      return;
    }
    createMutation.mutate(payload);
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
          <h1 className="font-serif text-3xl tracking-tight">Баннеры</h1>
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
              <Button size="lg" className="mt-6 h-12 rounded-full" onClick={() => void refetch()}>
                Повторить
              </Button>
            </>
          )}
        </div>
      </AdminLayout>
    );
  }

  const sortedBanners = [...(banners ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <AdminLayout>
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Link
          to="/admin/marketing"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Маркетинг
        </Link>
        <h1 className="mt-2 font-serif text-4xl tracking-tight">Баннеры</h1>

        <section className="mt-6 rounded-2xl border border-border/60 bg-card p-6">
          {sortedBanners.length === 0 ? (
            <div className="py-8 text-center">
              <ImageIcon className="h-6 w-6 text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Баннеров пока нет.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {sortedBanners.map((banner) => {
                const status = bannerStatus(banner);
                return (
                  <li
                    key={banner.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/60 bg-card px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="font-medium truncate">
                        {banner.title}{" "}
                        <span className="text-xs text-muted-foreground">
                          (порядок: {banner.sortOrder})
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {banner.subtitle ?? banner.linkUrl ?? "без описания"}
                        {(banner.startsAt || banner.endsAt) &&
                          ` · ${banner.startsAt ? toDateInputValue(banner.startsAt) : "…"} — ${
                            banner.endsAt ? toDateInputValue(banner.endsAt) : "…"
                          }`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={STATUS_BADGE_VARIANT[status]}>{STATUS_LABEL[status]}</Badge>
                      <Button variant="outline" size="sm" onClick={() => openEditBanner(banner)}>
                        Редактировать
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={toggleActiveMutation.isPending}
                        onClick={() =>
                          toggleActiveMutation.mutate({ id: banner.id, isActive: !banner.isActive })
                        }
                      >
                        {banner.isActive ? "Скрыть" : "Показать"}
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="mt-6 rounded-2xl border border-border/60 bg-card p-6">
          <h2 className="font-serif text-2xl mb-4">
            {editingId ? "Редактирование баннера" : "Новый баннер"}
          </h2>
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
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
              <Label htmlFor="banner-subtitle">Подзаголовок</Label>
              <Input
                id="banner-subtitle"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Необязательно"
                maxLength={500}
              />
            </div>
            <div className="grid gap-2 sm:col-span-2">
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
            <div className="grid gap-2">
              <Label htmlFor="banner-sort-order">Порядок показа</Label>
              <Input
                id="banner-sort-order"
                type="number"
                min={0}
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="banner-starts-at">Начало показа</Label>
              <Input
                id="banner-starts-at"
                type="date"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="banner-ends-at">Окончание показа</Label>
              <Input
                id="banner-ends-at"
                type="date"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
              />
            </div>
            <p className="text-xs text-muted-foreground sm:col-span-2">
              Оба поля необязательны — пустая дата начала значит «уже сейчас», пустая дата окончания
              значит «бессрочно».
            </p>
            <div className="flex gap-2 sm:col-span-2">
              <Button
                type="submit"
                className="h-12 rounded-full"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : editingId ? (
                  "Сохранить изменения"
                ) : (
                  "Создать"
                )}
              </Button>
              {editingId && (
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 rounded-full"
                  onClick={resetForm}
                >
                  Отмена
                </Button>
              )}
            </div>
          </form>
          {formError && <p className="mt-2 text-sm text-destructive">{formError}</p>}
        </section>
      </div>
    </AdminLayout>
  );
}
