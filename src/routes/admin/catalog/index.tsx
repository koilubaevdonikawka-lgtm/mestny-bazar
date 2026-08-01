import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { createCategory, listAdminCategories, updateCategory } from "@/api/category-admin";
import type { AdminCategoryDTO } from "@shared/contracts/category-admin";
import { signInWithGoogle } from "@/lib/auth";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { ArrowLeft, Loader2, LogIn, Pencil, ShieldAlert, Tags } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/catalog/")({
  component: AdminCatalogPage,
});

interface EditForm {
  name: string;
  description: string;
  imageUrl: string;
  nameKg: string;
  sortOrder: string;
}

function toEditForm(category: AdminCategoryDTO): EditForm {
  return {
    name: category.name,
    description: category.description ?? "",
    imageUrl: category.imageUrl ?? "",
    nameKg: category.nameKg ?? "",
    sortOrder: String(category.sortOrder),
  };
}

function AdminCatalogPage() {
  const { isAuthenticated } = useSupabaseSession();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm | null>(null);

  const {
    data: categories,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin", "categories", "list"],
    queryFn: listAdminCategories,
    enabled: isAuthenticated === true,
    retry: false,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["admin", "categories", "list"] });

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      invalidate();
      toast.success("Категория создана");
      setName("");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Не удалось создать категорию"),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: updateCategory,
    onSuccess: () => {
      invalidate();
      toast.success("Категория обновлена");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Не удалось обновить категорию"),
  });

  const saveEditMutation = useMutation({
    mutationFn: updateCategory,
    onSuccess: () => {
      invalidate();
      toast.success("Категория обновлена");
      setEditingId(null);
      setEditForm(null);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Не удалось обновить категорию"),
  });

  const handleSignIn = async () => {
    await signInWithGoogle(window.location.origin + "/admin/catalog");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!name.trim() || name.trim().length < 2) {
      setFormError("Название должно содержать минимум 2 символа");
      return;
    }
    createMutation.mutate({ name: name.trim() });
  };

  const startEdit = (category: AdminCategoryDTO) => {
    setEditingId(category.id);
    setEditForm(toEditForm(category));
  };

  const handleSaveEdit = (id: string) => {
    if (!editForm) return;
    if (!editForm.name.trim() || editForm.name.trim().length < 2) {
      toast.error("Название должно содержать минимум 2 символа");
      return;
    }
    const sortOrder = Number(editForm.sortOrder);
    saveEditMutation.mutate({
      id,
      name: editForm.name.trim(),
      description: editForm.description.trim() || null,
      imageUrl: editForm.imageUrl.trim() || null,
      nameKg: editForm.nameKg.trim() || null,
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : undefined,
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
          <h1 className="font-serif text-3xl tracking-tight">Каталог</h1>
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
    const message = error instanceof Error ? error.message : "Не удалось загрузить категории";
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

        <h1 className="font-serif text-4xl tracking-tight">Каталог — категории</h1>
        <p className="mt-2 text-muted-foreground">
          Управление категориями витрины: название, описание, изображение и кыргызское название
          (заменяет захардкоженные KG_NAME_BY_SLUG/FALLBACK_IMAGE_BY_SLUG на главной странице — см.{" "}
          <code className="text-sm">docs/admin-platform/design.md</code>). Товары и модерация — в
          следующих этапах.
        </p>

        <section className="mt-8 rounded-2xl border border-border/60 bg-card p-6">
          {!categories || categories.length === 0 ? (
            <div className="py-8 text-center">
              <Tags className="h-6 w-6 text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Категорий пока нет.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {categories.map((category) => (
                <li key={category.id} className="rounded-xl bg-secondary/40 px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{category.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {category.slug}
                        {category.nameKg ? ` · ${category.nameKg}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          editingId === category.id ? setEditingId(null) : startEdit(category)
                        }
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={toggleActiveMutation.isPending}
                        onClick={() =>
                          toggleActiveMutation.mutate({
                            id: category.id,
                            isActive: !category.isActive,
                          })
                        }
                      >
                        <Badge variant={category.isActive ? "secondary" : "outline"}>
                          {category.isActive ? "Активна" : "Скрыта"}
                        </Badge>
                      </Button>
                    </div>
                  </div>

                  {editingId === category.id && editForm && (
                    <div className="mt-4 grid gap-3 sm:grid-cols-2 border-t border-border/60 pt-4">
                      <div className="grid gap-2">
                        <Label htmlFor={`edit-name-${category.id}`}>Название</Label>
                        <Input
                          id={`edit-name-${category.id}`}
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          maxLength={200}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor={`edit-namekg-${category.id}`}>Название (кырг.)</Label>
                        <Input
                          id={`edit-namekg-${category.id}`}
                          value={editForm.nameKg}
                          onChange={(e) => setEditForm({ ...editForm, nameKg: e.target.value })}
                          maxLength={200}
                        />
                      </div>
                      <div className="grid gap-2 sm:col-span-2">
                        <Label htmlFor={`edit-desc-${category.id}`}>Описание</Label>
                        <Input
                          id={`edit-desc-${category.id}`}
                          value={editForm.description}
                          onChange={(e) =>
                            setEditForm({ ...editForm, description: e.target.value })
                          }
                          maxLength={2000}
                        />
                      </div>
                      <div className="grid gap-2 sm:col-span-2">
                        <Label htmlFor={`edit-image-${category.id}`}>Ссылка на изображение</Label>
                        <Input
                          id={`edit-image-${category.id}`}
                          value={editForm.imageUrl}
                          onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
                          placeholder="https://..."
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor={`edit-sort-${category.id}`}>Порядок сортировки</Label>
                        <Input
                          id={`edit-sort-${category.id}`}
                          type="number"
                          value={editForm.sortOrder}
                          onChange={(e) => setEditForm({ ...editForm, sortOrder: e.target.value })}
                        />
                      </div>
                      <div className="flex items-end gap-2">
                        <Button
                          type="button"
                          className="h-10 rounded-full"
                          disabled={saveEditMutation.isPending}
                          onClick={() => handleSaveEdit(category.id)}
                        >
                          {saveEditMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Сохранить"
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          className="h-10 rounded-full"
                          onClick={() => setEditingId(null)}
                        >
                          Отмена
                        </Button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mt-6 rounded-2xl border border-border/60 bg-card p-6">
          <h2 className="font-serif text-2xl mb-4">Новая категория</h2>
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
            <div className="grid gap-2">
              <Label htmlFor="category-name">Название</Label>
              <Input
                id="category-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="например: Молочные продукты"
                maxLength={200}
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
