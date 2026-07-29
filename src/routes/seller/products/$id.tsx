import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  getSellerProduct,
  hideSellerProduct,
  publishSellerProduct,
  updateSellerProduct,
} from "@/api/seller";
import { ProductPublicationStatus } from "@shared/contracts/seller-product";
import { signInWithGoogle } from "@/lib/auth";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { ArrowLeft, EyeOff, Loader2, LogIn, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/seller/products/$id")({
  component: SellerProductDetailPage,
});

function formatPublicationStatus(status: ProductPublicationStatus): string {
  switch (status) {
    case ProductPublicationStatus.DRAFT:
      return "Черновик";
    case ProductPublicationStatus.PUBLISHED:
      return "Опубликован";
    case ProductPublicationStatus.HIDDEN:
      return "Скрыт";
  }
}

function SellerProductDetailPage() {
  const { id } = Route.useParams();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useSupabaseSession();

  const {
    data: product,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["seller", "products", id],
    queryFn: () => getSellerProduct(id),
    enabled: isAuthenticated === true,
    retry: false,
  });

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    price: "",
    stock: "",
    unit: "",
    imageUrl: "",
  });

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        slug: product.slug,
        description: product.description ?? "",
        price: String(product.price),
        stock: String(product.stock),
        unit: product.unit ?? "",
        imageUrl: product.imageUrl ?? "",
      });
    }
  }, [product]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["seller", "products", id] });
    queryClient.invalidateQueries({ queryKey: ["seller", "products", "list"] });
  };

  const updateMutation = useMutation({
    mutationFn: updateSellerProduct,
    onSuccess: () => {
      invalidate();
      toast.success("Товар обновлён");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Не удалось обновить товар"),
  });

  const publishMutation = useMutation({
    mutationFn: () => publishSellerProduct(id),
    onSuccess: () => {
      invalidate();
      toast.success("Товар опубликован");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Не удалось опубликовать товар"),
  });

  const hideMutation = useMutation({
    mutationFn: () => hideSellerProduct(id),
    onSuccess: () => {
      invalidate();
      toast.success("Товар скрыт");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Не удалось скрыть товар"),
  });

  const handleSignIn = async () => {
    await signInWithGoogle(window.location.origin + `/seller/products/${id}`);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const price = parseFloat(form.price);
    const stock = parseInt(form.stock, 10);
    if (!form.name.trim() || Number.isNaN(price) || Number.isNaN(stock)) {
      toast.error("Заполните обязательные поля");
      return;
    }
    updateMutation.mutate({
      id,
      name: form.name.trim(),
      slug: form.slug.trim() || undefined,
      description: form.description.trim() || undefined,
      price,
      stock,
      unit: form.unit.trim() || undefined,
      imageUrl: form.imageUrl.trim() || undefined,
    });
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
        <div className="max-w-md mx-auto text-center py-24 px-6">
          <LogIn className="h-10 w-10 text-primary mx-auto mb-4" />
          <h1 className="font-serif text-3xl tracking-tight">Войдите в аккаунт</h1>
          <p className="mt-3 text-muted-foreground">Нужна авторизация продавца.</p>
          <Button size="lg" className="mt-6 h-12 rounded-full" onClick={() => void handleSignIn()}>
            Войти
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
    const message = error instanceof Error ? error.message : "Не удалось загрузить товар";
    if (message.includes("not found") || message.includes("Product not found")) {
      throw notFound();
    }
    const isForbidden =
      message.toLowerCase().includes("access denied") ||
      message.toLowerCase().includes("seller role");

    return (
      <PageShell>
        <div className="max-w-md mx-auto text-center py-24 px-6">
          {isForbidden ? (
            <>
              <ShieldAlert className="h-10 w-10 text-primary mx-auto mb-4" />
              <h1 className="font-serif text-3xl tracking-tight">Доступ запрещён</h1>
              <p className="mt-3 text-muted-foreground">Эта страница доступна только продавцам.</p>
            </>
          ) : (
            <p className="text-muted-foreground">{message}</p>
          )}
          <Button asChild size="lg" className="mt-6 h-12 rounded-full">
            <Link to="/seller/products">К списку товаров</Link>
          </Button>
        </div>
      </PageShell>
    );
  }

  if (!product) {
    throw notFound();
  }

  const isBusy = updateMutation.isPending || publishMutation.isPending || hideMutation.isPending;
  const canPublish =
    product.publicationStatus === ProductPublicationStatus.DRAFT ||
    product.publicationStatus === ProductPublicationStatus.HIDDEN;
  const canHide = product.publicationStatus === ProductPublicationStatus.PUBLISHED;

  return (
    <PageShell>
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Button asChild variant="ghost" className="mb-6 -ml-2 rounded-full">
          <Link to="/seller/products">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Мои товары
          </Link>
        </Button>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-4xl tracking-tight">{product.name}</h1>
            <p className="mt-2 text-muted-foreground">{product.slug}</p>
          </div>
          <Badge
            variant={
              product.publicationStatus === ProductPublicationStatus.PUBLISHED
                ? "secondary"
                : "outline"
            }
          >
            {formatPublicationStatus(product.publicationStatus)}
          </Badge>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {canPublish && (
            <Button disabled={isBusy} onClick={() => publishMutation.mutate()}>
              {publishMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Опубликовать"
              )}
            </Button>
          )}
          {canHide && (
            <Button variant="outline" disabled={isBusy} onClick={() => hideMutation.mutate()}>
              {hideMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Скрыть
                </>
              )}
            </Button>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-6 rounded-2xl border border-border/60 bg-card p-6 space-y-4"
        >
          <h2 className="font-serif text-2xl">Редактирование</h2>
          <div className="space-y-2">
            <Label htmlFor="name">Название *</Label>
            <Input
              id="name"
              required
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={form.slug}
              onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              rows={3}
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="price">Цена (KGS) *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                required
                value={form.price}
                onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Остаток *</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                required
                value={form.stock}
                onChange={(e) => setForm((prev) => ({ ...prev, stock: e.target.value }))}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="unit">Единица</Label>
              <Input
                id="unit"
                value={form.unit}
                onChange={(e) => setForm((prev) => ({ ...prev, unit: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="imageUrl">URL изображения</Label>
              <Input
                id="imageUrl"
                value={form.imageUrl}
                onChange={(e) => setForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
              />
            </div>
          </div>
          <Button type="submit" disabled={isBusy}>
            {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Сохранить"}
          </Button>
        </form>
      </div>
    </PageShell>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
