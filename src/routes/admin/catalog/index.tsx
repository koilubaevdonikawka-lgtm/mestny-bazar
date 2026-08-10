import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ImageUploadField } from "@/components/shared/ImageUploadField";
import { MultiImageUploadField } from "@/components/shared/MultiImageUploadField";
import { createCategory, listAdminCategories, updateCategory } from "@/api/category-admin";
import { createAdminProduct, listAdminProducts, updateAdminProduct } from "@/api/product-admin";
import type { AdminCategoryDTO } from "@shared/contracts/category-admin";
import type { SellerProductDTO } from "@shared/contracts/seller-product";
import { ProductPublicationStatus } from "@shared/contracts/seller-product";
import { signInWithGoogle } from "@/lib/auth";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { useTranslation } from "@/i18n/LanguageProvider";
import type { TranslationKey } from "@/i18n/t";
import {
  ArrowLeft,
  ExternalLink,
  Loader2,
  LogIn,
  Package,
  Pencil,
  ShieldAlert,
  Tags,
} from "lucide-react";
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

// Задача этапа №2 (Склад) — exported so admin/warehouse can reuse the exact
// same product creation form/state/mutation shape instead of building a
// second one. No behavior change for this file's own usage.
export interface ProductFormState {
  name: string;
  description: string;
  price: string;
  unit: string;
  manufacturer: string;
  countryOfOrigin: string;
  sku: string;
  publicationStatus: ProductPublicationStatus;
  imageUrls: string[];
}

export const emptyProductForm = (): ProductFormState => ({
  name: "",
  description: "",
  price: "",
  unit: "",
  manufacturer: "",
  countryOfOrigin: "",
  sku: "",
  publicationStatus: ProductPublicationStatus.PUBLISHED,
  imageUrls: [],
});

const ADMIN_PRODUCTS_PAGE_SIZE = 50;

export function toProductForm(product: SellerProductDTO): ProductFormState {
  return {
    name: product.name,
    description: product.description ?? "",
    price: String(product.price),
    unit: product.unit ?? "",
    manufacturer: product.manufacturer ?? "",
    countryOfOrigin: product.countryOfOrigin ?? "",
    sku: product.sku ?? "",
    publicationStatus: product.publicationStatus,
    imageUrls: product.imageUrls,
  };
}

export function publicationStatusKey(status: ProductPublicationStatus): TranslationKey {
  switch (status) {
    case ProductPublicationStatus.DRAFT:
      return "admin.catalog.productStatusDraft";
    case ProductPublicationStatus.PUBLISHED:
      return "admin.catalog.productStatusPublished";
    case ProductPublicationStatus.HIDDEN:
      return "admin.catalog.productStatusHidden";
  }
}

function AdminCatalogPage() {
  const { isAuthenticated } = useSupabaseSession();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm | null>(null);

  const [addingProductCategoryId, setAddingProductCategoryId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState<ProductFormState>(emptyProductForm);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editProductForm, setEditProductForm] = useState<ProductFormState | null>(null);

  const [productsPage, setProductsPage] = useState(1);
  const [products, setProducts] = useState<SellerProductDTO[]>([]);
  // Ref, not state — only read inside the mutation's onSuccess callback,
  // never in JSX, so it doesn't need to trigger a re-render when set.
  const createAndEditRef = useRef(false);

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

  const { data: productsPageResult } = useQuery({
    queryKey: ["admin", "products", "list", productsPage],
    queryFn: () => listAdminProducts({ page: productsPage, pageSize: ADMIN_PRODUCTS_PAGE_SIZE }),
    enabled: isAuthenticated === true,
    retry: false,
  });

  // Server-paginated (Промпт №103) — pages accumulate into one list as the
  // admin clicks "Показать ещё"; a create/update refetches the current page
  // and upserts by id, so edited items always reflect the latest fetch.
  useEffect(() => {
    if (!productsPageResult) return;
    setProducts((prev) => {
      const byId = new Map(prev.map((p) => [p.id, p]));
      for (const p of productsPageResult.items) byId.set(p.id, p);
      return Array.from(byId.values());
    });
  }, [productsPageResult]);

  const productsByCategory = useMemo(() => {
    const map = new Map<string, SellerProductDTO[]>();
    for (const product of products) {
      if (!product.categoryId) continue;
      const list = map.get(product.categoryId) ?? [];
      list.push(product);
      map.set(product.categoryId, list);
    }
    return map;
  }, [products]);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["admin", "categories", "list"] });

  const invalidateProducts = () =>
    queryClient.invalidateQueries({ queryKey: ["admin", "products", "list"] });

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      invalidate();
      toast.success(t("admin.catalog.categoryCreatedToast"));
      setName("");
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : t("admin.catalog.categoryCreateError")),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: updateCategory,
    onSuccess: () => {
      invalidate();
      toast.success(t("admin.catalog.categoryUpdatedToast"));
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : t("admin.catalog.categoryUpdateError")),
  });

  const saveEditMutation = useMutation({
    mutationFn: updateCategory,
    onSuccess: () => {
      invalidate();
      toast.success(t("admin.catalog.categoryUpdatedToast"));
      setEditingId(null);
      setEditForm(null);
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : t("admin.catalog.categoryUpdateError")),
  });

  const createProductMutation = useMutation({
    mutationFn: createAdminProduct,
    onSuccess: (product) => {
      setProducts((prev) => [product, ...prev.filter((p) => p.id !== product.id)]);
      invalidateProducts();
      setAddingProductCategoryId(null);
      setProductForm(emptyProductForm());
      if (createAndEditRef.current && editingProductId === null) {
        // «Изменить» — сохранить и сразу открыть товар для дальнейшего
        // редактирования (п.5 требований). Пропускается, если админ уже
        // открыл другой товар на редактирование, пока запрос был в пути —
        // иначе это молча подменило бы его текущую форму редактирования.
        toast.success(t("admin.catalog.productCreatedAndEditingToast"));
        setEditingProductId(product.id);
        setEditProductForm(toProductForm(product));
      } else {
        toast.success(t("admin.catalog.productCreatedToast"));
      }
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : t("admin.catalog.productCreateError")),
  });

  const updateProductMutation = useMutation({
    mutationFn: updateAdminProduct,
    onSuccess: (product) => {
      setProducts((prev) => prev.map((p) => (p.id === product.id ? product : p)));
      invalidateProducts();
      toast.success(t("admin.catalog.productUpdatedToast"));
      setEditingProductId(null);
      setEditProductForm(null);
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : t("admin.catalog.productUpdateError")),
  });

  const handleSignIn = async () => {
    await signInWithGoogle();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!name.trim() || name.trim().length < 2) {
      setFormError(t("admin.catalog.nameMinLengthError"));
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
      toast.error(t("admin.catalog.nameMinLengthError"));
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

  const startAddProduct = (categoryId: string) => {
    setAddingProductCategoryId(categoryId);
    setProductForm(emptyProductForm());
  };

  const cancelAddProduct = () => {
    setAddingProductCategoryId(null);
    setProductForm(emptyProductForm());
  };

  const startEditProduct = (product: SellerProductDTO) => {
    setEditingProductId(product.id);
    setEditProductForm(toProductForm(product));
  };

  const cancelEditProduct = () => {
    setEditingProductId(null);
    setEditProductForm(null);
  };

  const handleCreateProduct = (categoryId: string, andEdit: boolean) => {
    const price = parseFloat(productForm.price);
    if (!productForm.name.trim() || productForm.name.trim().length < 2) {
      toast.error(t("admin.catalog.productNameMinLengthError"));
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      toast.error(t("admin.catalog.invalidPriceError"));
      return;
    }
    createAndEditRef.current = andEdit;
    createProductMutation.mutate({
      categoryId,
      name: productForm.name.trim(),
      description: productForm.description.trim() || undefined,
      price,
      unit: productForm.unit.trim() || undefined,
      manufacturer: productForm.manufacturer.trim() || undefined,
      countryOfOrigin: productForm.countryOfOrigin.trim() || undefined,
      sku: productForm.sku.trim() || undefined,
      publicationStatus: productForm.publicationStatus,
      imageUrls: productForm.imageUrls,
    });
  };

  const handleSaveProductEdit = (id: string) => {
    if (!editProductForm) return;
    const price = parseFloat(editProductForm.price);
    if (!editProductForm.name.trim() || editProductForm.name.trim().length < 2) {
      toast.error(t("admin.catalog.productNameMinLengthError"));
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      toast.error(t("admin.catalog.invalidPriceError"));
      return;
    }
    updateProductMutation.mutate({
      id,
      name: editProductForm.name.trim(),
      description: editProductForm.description.trim() || undefined,
      price,
      unit: editProductForm.unit.trim() || undefined,
      manufacturer: editProductForm.manufacturer.trim() || undefined,
      countryOfOrigin: editProductForm.countryOfOrigin.trim() || undefined,
      sku: editProductForm.sku.trim() || undefined,
      publicationStatus: editProductForm.publicationStatus,
      imageUrls: editProductForm.imageUrls,
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
          <h1 className="font-serif text-3xl tracking-tight">{t("admin.catalog.title")}</h1>
          <p className="mt-3 text-muted-foreground">{t("admin.common.signInPrompt")}</p>
          <Button size="lg" className="mt-6 h-12 rounded-full" onClick={() => void handleSignIn()}>
            {t("common.signIn")}
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
    const message = error instanceof Error ? error.message : t("admin.catalog.loadError");
    const isForbidden =
      message.toLowerCase().includes("access denied") ||
      message.toLowerCase().includes("admin role");

    return (
      <AdminLayout>
        <div className="max-w-md mx-auto text-center py-24">
          {isForbidden ? (
            <>
              <ShieldAlert className="h-10 w-10 text-primary mx-auto mb-4" />
              <h1 className="font-serif text-3xl tracking-tight">
                {t("admin.common.accessDeniedTitle")}
              </h1>
              <p className="mt-3 text-muted-foreground">{t("admin.common.adminOnlyMessage")}</p>
            </>
          ) : (
            <>
              <p className="text-muted-foreground">{message}</p>
              <Button size="lg" className="mt-6 h-12 rounded-full" onClick={() => void refetch()}>
                {t("common.retry")}
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
            {t("admin.common.backToHub")}
          </Link>
        </Button>

        <h1 className="font-serif text-4xl tracking-tight">{t("admin.catalog.title")}</h1>
        <p className="mt-2 text-muted-foreground">
          {t("admin.catalog.descriptionPrefix")}{" "}
          <code className="text-sm">docs/admin-platform/design.md</code>).{" "}
          {t("admin.catalog.descriptionSuffix")}
        </p>

        <section className="mt-8 rounded-2xl border border-border/60 bg-card p-6">
          {!categories || categories.length === 0 ? (
            <div className="py-8 text-center">
              <Tags className="h-6 w-6 text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">{t("admin.catalog.emptyState")}</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {categories.map((category) => {
                const categoryProducts = productsByCategory.get(category.id) ?? [];
                return (
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
                            {category.isActive
                              ? t("admin.catalog.statusActive")
                              : t("admin.catalog.statusHidden")}
                          </Badge>
                        </Button>
                      </div>
                    </div>

                    {editingId === category.id && editForm && (
                      <div className="mt-4 grid gap-3 sm:grid-cols-2 border-t border-border/60 pt-4">
                        <div className="grid gap-2">
                          <Label htmlFor={`edit-name-${category.id}`}>
                            {t("admin.catalog.nameLabel")}
                          </Label>
                          <Input
                            id={`edit-name-${category.id}`}
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            maxLength={200}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor={`edit-namekg-${category.id}`}>
                            {t("admin.catalog.nameKgLabel")}
                          </Label>
                          <Input
                            id={`edit-namekg-${category.id}`}
                            value={editForm.nameKg}
                            onChange={(e) => setEditForm({ ...editForm, nameKg: e.target.value })}
                            maxLength={200}
                          />
                        </div>
                        <div className="grid gap-2 sm:col-span-2">
                          <Label htmlFor={`edit-desc-${category.id}`}>
                            {t("admin.catalog.descriptionLabel")}
                          </Label>
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
                          <ImageUploadField
                            value={editForm.imageUrl || null}
                            onChange={(url) => setEditForm({ ...editForm, imageUrl: url ?? "" })}
                            context="category"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor={`edit-sort-${category.id}`}>
                            {t("admin.catalog.sortOrderLabel")}
                          </Label>
                          <Input
                            id={`edit-sort-${category.id}`}
                            type="number"
                            value={editForm.sortOrder}
                            onChange={(e) =>
                              setEditForm({ ...editForm, sortOrder: e.target.value })
                            }
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
                              t("common.save")
                            )}
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            className="h-10 rounded-full"
                            onClick={() => setEditingId(null)}
                          >
                            {t("common.cancel")}
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="mt-4 border-t border-border/60 pt-4">
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-muted-foreground">
                          {t("admin.catalog.productsHeading")}{" "}
                          {categoryProducts.length > 0 && `(${categoryProducts.length})`}
                        </p>
                        {addingProductCategoryId !== category.id && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => startAddProduct(category.id)}
                          >
                            {t("admin.catalog.addProductButton")}
                          </Button>
                        )}
                      </div>

                      {categoryProducts.length === 0 && addingProductCategoryId !== category.id && (
                        <p className="text-sm text-muted-foreground">
                          {t("admin.catalog.noProductsInCategory")}
                        </p>
                      )}

                      {categoryProducts.length > 0 && (
                        <ul className="space-y-3">
                          {categoryProducts.map((product) => (
                            <li
                              key={product.id}
                              className="rounded-lg border border-border/60 bg-background/60 p-4"
                            >
                              {editingProductId === product.id && editProductForm ? (
                                <div className="space-y-3">
                                  <ProductFormFields
                                    form={editProductForm}
                                    setForm={setEditProductForm}
                                    idPrefix={`edit-product-${product.id}`}
                                  />
                                  <div className="flex gap-2 pt-1">
                                    <Button
                                      type="button"
                                      className="h-10 rounded-full"
                                      disabled={updateProductMutation.isPending}
                                      onClick={() => handleSaveProductEdit(product.id)}
                                    >
                                      {updateProductMutation.isPending ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        t("common.save")
                                      )}
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      className="h-10 rounded-full"
                                      onClick={cancelEditProduct}
                                    >
                                      {t("common.cancel")}
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <ProductCard
                                  product={product}
                                  categoryName={category.name}
                                  onEdit={() => startEditProduct(product)}
                                />
                              )}
                            </li>
                          ))}
                        </ul>
                      )}

                      {addingProductCategoryId === category.id && (
                        <div className="mt-3 rounded-lg border border-dashed border-primary/40 bg-background/60 p-4">
                          <h3 className="font-medium mb-3">
                            {t("admin.catalog.newProductHeading")}
                          </h3>
                          <ProductFormFields
                            form={productForm}
                            setForm={setProductForm}
                            idPrefix={`new-product-${category.id}`}
                          />
                          <div className="flex flex-wrap gap-2 pt-3">
                            <Button
                              type="button"
                              className="h-10 rounded-full"
                              disabled={createProductMutation.isPending}
                              onClick={() => handleCreateProduct(category.id, false)}
                            >
                              {createProductMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                t("common.save")
                              )}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              className="h-10 rounded-full"
                              disabled={createProductMutation.isPending}
                              onClick={() => handleCreateProduct(category.id, true)}
                            >
                              {createProductMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                t("admin.catalog.editButton")
                              )}
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              className="h-10 rounded-full"
                              onClick={cancelAddProduct}
                            >
                              {t("common.cancel")}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {productsPageResult?.hasMore && (
          <div className="mt-4 flex justify-center">
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={() => setProductsPage((p) => p + 1)}
            >
              {t("admin.catalog.showMoreProductsButton", {
                shown: String(products.length),
                total: String(productsPageResult.total),
              })}
            </Button>
          </div>
        )}

        <section className="mt-6 rounded-2xl border border-border/60 bg-card p-6">
          <h2 className="font-serif text-2xl mb-4">{t("admin.catalog.newCategoryHeading")}</h2>
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
            <div className="grid gap-2">
              <Label htmlFor="category-name">{t("admin.catalog.nameLabel")}</Label>
              <Input
                id="category-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("admin.catalog.namePlaceholder")}
                maxLength={200}
              />
            </div>
            <Button type="submit" className="h-12 rounded-full" disabled={createMutation.isPending}>
              {createMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t("admin.catalog.createButton")
              )}
            </Button>
          </form>
          {formError && <p className="mt-2 text-sm text-destructive">{formError}</p>}
        </section>
      </div>
    </AdminLayout>
  );
}

/** Поля формы товара — общие для создания и редактирования (Промпт №1, новая серия). */
export function ProductFormFields({
  form,
  setForm,
  idPrefix,
}: {
  form: ProductFormState;
  setForm: (form: ProductFormState) => void;
  idPrefix: string;
}) {
  const { t } = useTranslation();
  const nameInputRef = useRef<HTMLInputElement>(null);
  // Форма всегда монтируется заново при открытии (условный рендер в
  // родителе) — переносим фокус на первое поле для клавиатурной навигации,
  // иначе форма появляется без видимой точки входа для не-мышиного ввода.
  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  return (
    <div className="space-y-3">
      <div className="grid gap-2">
        <Label htmlFor={`${idPrefix}-name`}>{t("admin.catalog.productNameLabel")}</Label>
        <Input
          ref={nameInputRef}
          id={`${idPrefix}-name`}
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          maxLength={200}
        />
      </div>

      <MultiImageUploadField
        values={form.imageUrls}
        onChange={(imageUrls) => setForm({ ...form, imageUrls })}
        context="product"
      />

      <div className="grid gap-2">
        <Label htmlFor={`${idPrefix}-description`}>
          {t("admin.catalog.productDescriptionLabel")}
        </Label>
        <Textarea
          id={`${idPrefix}-description`}
          rows={3}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor={`${idPrefix}-price`}>{t("admin.catalog.priceLabel")}</Label>
          <Input
            id={`${idPrefix}-price`}
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`${idPrefix}-unit`}>{t("admin.catalog.unitLabel")}</Label>
          <Input
            id={`${idPrefix}-unit`}
            placeholder={t("admin.catalog.unitPlaceholder")}
            value={form.unit}
            onChange={(e) => setForm({ ...form, unit: e.target.value })}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor={`${idPrefix}-manufacturer`}>{t("admin.catalog.manufacturerLabel")}</Label>
          <Input
            id={`${idPrefix}-manufacturer`}
            value={form.manufacturer}
            onChange={(e) => setForm({ ...form, manufacturer: e.target.value })}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`${idPrefix}-country`}>{t("admin.catalog.countryLabel")}</Label>
          <Input
            id={`${idPrefix}-country`}
            value={form.countryOfOrigin}
            onChange={(e) => setForm({ ...form, countryOfOrigin: e.target.value })}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor={`${idPrefix}-sku`}>{t("admin.catalog.skuLabel")}</Label>
          <Input
            id={`${idPrefix}-sku`}
            value={form.sku}
            onChange={(e) => setForm({ ...form, sku: e.target.value })}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`${idPrefix}-status`}>{t("admin.catalog.publicationStatusLabel")}</Label>
          <select
            id={`${idPrefix}-status`}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            value={form.publicationStatus}
            onChange={(e) =>
              setForm({ ...form, publicationStatus: e.target.value as ProductPublicationStatus })
            }
          >
            <option value={ProductPublicationStatus.DRAFT}>
              {t("admin.catalog.productStatusDraft")}
            </option>
            <option value={ProductPublicationStatus.PUBLISHED}>
              {t("admin.catalog.productStatusPublished")}
            </option>
            <option value={ProductPublicationStatus.HIDDEN}>
              {t("admin.catalog.productStatusHidden")}
            </option>
          </select>
        </div>
      </div>
    </div>
  );
}

/**
 * Карточка товара (Промпт №1, новая серия) — только информация о товаре:
 * название, фото, описание, цена, характеристики, статус публикации.
 * Остатки/поступления/продажи/возвраты/списания сюда сознательно не входят —
 * это отдельная, независимая сущность.
 */
function ProductCard({
  product,
  categoryName,
  onEdit,
}: {
  product: SellerProductDTO;
  categoryName: string;
  onEdit: () => void;
}) {
  const { t } = useTranslation();
  const characteristics = [
    product.unit && t("admin.catalog.unitCharacteristic", { unit: product.unit }),
    product.manufacturer &&
      t("admin.catalog.manufacturerCharacteristic", { value: product.manufacturer }),
    product.countryOfOrigin &&
      t("admin.catalog.countryCharacteristic", { value: product.countryOfOrigin }),
    product.sku && t("admin.catalog.skuCharacteristic", { value: product.sku }),
  ].filter(Boolean) as string[];

  return (
    <div className="flex gap-4">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border/60 bg-secondary/40">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <Package className="h-6 w-6" />
          </div>
        )}
        {product.imageUrls.length > 1 && (
          <span
            aria-hidden="true"
            className="absolute bottom-0 right-0 rounded-tl bg-background/90 px-1 text-[10px] font-medium text-muted-foreground"
          >
            +{product.imageUrls.length - 1}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-medium truncate">{product.name}</p>
          <Badge
            variant={
              product.publicationStatus === ProductPublicationStatus.PUBLISHED
                ? "secondary"
                : "outline"
            }
          >
            {t(publicationStatusKey(product.publicationStatus))}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          {t("admin.catalog.categoryLabelPrefix", { name: categoryName })}
        </p>
        {product.description && (
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{product.description}</p>
        )}
        <p className="mt-2 font-semibold">
          {product.price.toFixed(2)} {product.currency}
        </p>
        {characteristics.length > 0 && (
          <p className="mt-1 text-xs text-muted-foreground">{characteristics.join(" · ")}</p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {/* Only a PUBLISHED product actually has a reachable storefront page
            (Промпт №106's investigation) — linking out for DRAFT/HIDDEN
            products would just land the admin on a 404. */}
        {product.publicationStatus === ProductPublicationStatus.PUBLISHED && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            asChild
            aria-label={t("admin.catalog.viewOnStorefrontButton")}
          >
            <Link
              to="/product/$handle"
              params={{ handle: product.slug }}
              search={{ from: "admin" }}
            >
              <ExternalLink className="h-4 w-4" />
            </Link>
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onEdit}
          aria-label={t("admin.catalog.editButton")}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
