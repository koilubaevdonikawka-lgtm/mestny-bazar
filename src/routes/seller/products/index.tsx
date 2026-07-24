import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createSellerProduct, listSellerProducts } from "@/api/seller";
import { ProductPublicationStatus } from "@shared/contracts/seller-product";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, LogIn, Plus, ShieldAlert, Store } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/seller/products/")({
  component: SellerProductsPage,
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

type ProductFormState = {
  name: string;
  slug: string;
  description: string;
  price: string;
  stock: string;
  unit: string;
  imageUrl: string;
};

const emptyForm = (): ProductFormState => ({
  name: "",
  slug: "",
  description: "",
  price: "",
  stock: "0",
  unit: "",
  imageUrl: "",
});

function SellerProductsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ProductFormState>(emptyForm);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setIsAuthenticated(!!data.session?.user);
    });
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session?.user);
    });
    return () => subscription.unsubscribe();
  }, []);

  const { data: products = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ["seller", "products", "list"],
    queryFn: listSellerProducts,
    enabled: isAuthenticated === true,
    retry: false,
  });

  const createMutation = useMutation({
    mutationFn: createSellerProduct,
    onSuccess: (product) => {
      queryClient.invalidateQueries({ queryKey: ["seller", "products", "list"] });
      setShowForm(false);
      setForm(emptyForm());
      toast.success("Товар создан");
      void navigate({ to: "/seller/products/$id", params: { id: product.id } });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Не удалось создать товар"),
  });

  const handleSignIn = async () => {
    await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/seller/products",
    });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const price = parseFloat(form.price);
    const stock = parseInt(form.stock, 10);
    if (!form.name.trim() || Number.isNaN(price) || Number.isNaN(stock)) {
      toast.error("Заполните обязательные поля");
      return;
    }
    createMutation.mutate({
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
        <div className="max-w-md mx-auto text-center py-24">
          <LogIn className="h-10 w-10 text-primary mx-auto mb-4" />
          <h1 className="font-serif text-3xl tracking-tight">Мои товары</h1>
          <p className="mt-3 text-muted-foreground">Войдите с учётной записью продавца.</p>
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
    const message = error instanceof Error ? error.message : "Не удалось загрузить товары";
    const isForbidden =
      message.toLowerCase().includes("access denied") ||
      message.toLowerCase().includes("seller role");

    return (
      <PageShell>
        <div className="max-w-md mx-auto text-center py-24">
          {isForbidden ? (
            <>
              <ShieldAlert className="h-10 w-10 text-primary mx-auto mb-4" />
              <h1 className="font-serif text-3xl tracking-tight">Доступ запрещён</h1>
              <p className="mt-3 text-muted-foreground">Эта страница доступна только продавцам.</p>
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
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-3xl px-6 py-12">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-4xl tracking-tight">Мои товары</h1>
            <p className="mt-2 text-muted-foreground">Управление только вашими товарами.</p>
          </div>
          {!showForm && (
            <Button className="rounded-full" onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Добавить товар
            </Button>
          )}
        </div>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="mt-8 rounded-2xl border border-border/60 bg-card p-6 space-y-4"
          >
            <h2 className="font-serif text-2xl">Новый товар</h2>
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
                placeholder="авто из названия"
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
                  placeholder="кг, шт…"
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
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Создать"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Отмена
              </Button>
            </div>
          </form>
        )}

        {products.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-dashed border-border py-16 text-center">
            <Store className="h-10 w-10 text-primary mx-auto mb-4" />
            <h2 className="font-serif text-2xl">Товаров пока нет</h2>
          </div>
        ) : (
          <ul className="mt-8 space-y-4">
            {products.map((product) => (
              <li key={product.id}>
                <Link
                  to="/seller/products/$id"
                  params={{ id: product.id }}
                  className="block rounded-2xl border border-border/60 bg-card p-6 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)] hover:border-primary/40"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-serif text-xl">{product.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">{product.slug}</p>
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
                  <p className="mt-4 font-semibold text-lg">
                    {product.price.toFixed(2)} {product.currency}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Остаток: {product.stock}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
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
