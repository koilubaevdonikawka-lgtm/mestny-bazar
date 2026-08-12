import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ImageUploadField } from "@/components/shared/ImageUploadField";
import { MultiImageUploadField } from "@/components/shared/MultiImageUploadField";
import {
  createCategory,
  deleteCategory,
  listAdminCategories,
  updateCategory,
} from "@/api/category-admin";
import {
  createAdminProduct,
  deleteAdminProduct,
  listAdminProducts,
  updateAdminProduct,
} from "@/api/product-admin";
import type { AdminCategoryDTO } from "@shared/contracts/category-admin";
import type { SellerProductDTO } from "@shared/contracts/seller-product";
import { ProductPublicationStatus } from "@shared/contracts/seller-product";
import { signInWithGoogle } from "@/lib/auth";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { useTranslation } from "@/i18n/LanguageProvider";
import type { TranslationKey } from "@/i18n/t";
import {
  ArrowLeft,
  ChevronDown,
  Eye,
  EyeOff,
  Loader2,
  LogIn,
  Package,
  Pencil,
  ShieldAlert,
  Tags,
  Trash2,
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
  const [imageUrl, setImageUrl] = useState<string | null>(null);
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

  // Каталог → Категории → Подкатегории → Товары — строгая последовательная
  // навигация (Этап №2 подкатегорий). null/null = список основных категорий;
  // viewCategoryId set = подкатегории этой категории; viewSubcategoryId set =
  // товары этой подкатегории. Один и тот же экран/компонент для категорий и
  // подкатегорий — это одна и та же сущность (categories.parent_id), не две
  // параллельные системы.
  const [viewCategoryId, setViewCategoryId] = useState<string | null>(null);
  const [viewSubcategoryId, setViewSubcategoryId] = useState<string | null>(null);

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

  const topLevelCategories = useMemo(
    () => (categories ?? []).filter((c) => c.parentId === null),
    [categories],
  );
  const viewCategory = useMemo(
    () => categories?.find((c) => c.id === viewCategoryId) ?? null,
    [categories, viewCategoryId],
  );
  const subcategoriesOfViewCategory = useMemo(
    () => (categories ?? []).filter((c) => c.parentId === viewCategoryId),
    [categories, viewCategoryId],
  );
  const viewSubcategory = useMemo(
    () => categories?.find((c) => c.id === viewSubcategoryId) ?? null,
    [categories, viewSubcategoryId],
  );

  const drillIntoCategory = (id: string) => {
    setViewCategoryId(id);
    setViewSubcategoryId(null);
  };
  const drillIntoSubcategory = (id: string) => setViewSubcategoryId(id);
  const goBackToCategories = () => {
    setViewCategoryId(null);
    setViewSubcategoryId(null);
  };
  const goBackToSubcategories = () => setViewSubcategoryId(null);

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
      setImageUrl(null);
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

  const deleteCategoryMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: (_void, deletedId) => {
      invalidate();
      toast.success(t("admin.catalog.categoryDeletedToast"));
      // Если удалили именно то, что сейчас просматриваем — подняться на
      // уровень выше, а не остаться на экране только что удалённой записи.
      if (deletedId === viewSubcategoryId) setViewSubcategoryId(null);
      else if (deletedId === viewCategoryId) goBackToCategories();
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : t("admin.catalog.categoryDeleteError")),
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

  // Тот же updateAdminProduct, что и полное редактирование — только меняет
  // publicationStatus, без открытия формы (быстрое действие, п.7 задачи).
  const toggleProductStatusMutation = useMutation({
    mutationFn: updateAdminProduct,
    onSuccess: (product) => {
      setProducts((prev) => prev.map((p) => (p.id === product.id ? product : p)));
      invalidateProducts();
      toast.success(t("admin.catalog.productUpdatedToast"));
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : t("admin.catalog.productUpdateError")),
  });

  const deleteProductMutation = useMutation({
    mutationFn: deleteAdminProduct,
    onSuccess: (_void, deletedId) => {
      setProducts((prev) => prev.filter((p) => p.id !== deletedId));
      invalidateProducts();
      toast.success(t("admin.catalog.productDeletedToast"));
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : t("admin.catalog.productDeleteError")),
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
    // viewCategoryId — null на экране основных категорий (создаётся
    // категория верхнего уровня), либо id просматриваемой категории на
    // экране подкатегорий (создаётся подкатегория с этим parentId).
    createMutation.mutate({ name: name.trim(), parentId: viewCategoryId, imageUrl });
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

  // Общая карточка — используется и для основных категорий, и для
  // подкатегорий (одна и та же сущность categories, различается только
  // тем, что передано в onDrillIn/drillLabel). Не дублирует JSX между
  // двумя уровнями. Компактный стиль — как у карточки товара: фото сверху
  // (кликабельно, вход в подкатегории/товары), название в середине,
  // кнопки управления внизу (Этап: адаптивная сетка админ-каталога).
  //
  // Товары этой категории здесь намеренно НЕ отображаются (ни на уровне
  // основных категорий, ни на уровне подкатегорий) — страница категорий и
  // страница подкатегорий показывают только сами категории/подкатегории,
  // товары видны исключительно на отдельной странице товаров (Уровень 3).
  const renderCategoryRow = (
    category: AdminCategoryDTO,
    options: { onDrillIn: () => void; drillLabel: string },
  ) => (
    <div
      key={category.id}
      className="flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card"
    >
      {/* Верхняя часть — фото категории, целиком кликабельная кнопка входа
          в подкатегории/товары этой категории. */}
      <button
        type="button"
        onClick={options.onDrillIn}
        aria-label={options.drillLabel}
        className="group aspect-square w-full overflow-hidden bg-secondary/40"
      >
        {category.imageUrl ? (
          <img
            src={category.imageUrl}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <Tags className="h-5 w-5" />
          </div>
        )}
      </button>

      {/* Середина — название категории. */}
      <div className="min-w-0 px-2 pt-1.5 pb-1">
        <p className="truncate text-sm font-medium">{category.name}</p>
        {category.nameKg && (
          <p className="truncate text-[11px] text-muted-foreground">{category.nameKg}</p>
        )}
      </div>

      {/* Низ — кнопки управления: Редактировать, Удалить,
          Активировать/Скрыть, Открыть подкатегории. */}
      <div className="mt-auto flex flex-wrap items-center gap-0.5 border-t border-border/60 px-1 py-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          aria-label={t("admin.catalog.editButton")}
          onClick={() => (editingId === category.id ? setEditingId(null) : startEdit(category))}
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-destructive hover:text-destructive"
              aria-label={t("common.delete")}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("admin.catalog.deleteCategoryConfirmTitle")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("admin.catalog.deleteCategoryConfirmDescription", { name: category.name })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
              <AlertDialogAction onClick={() => deleteCategoryMutation.mutate(category.id)}>
                {t("common.delete")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Button
          variant="outline"
          size="sm"
          className="h-7 px-1.5"
          disabled={toggleActiveMutation.isPending}
          onClick={() =>
            toggleActiveMutation.mutate({ id: category.id, isActive: !category.isActive })
          }
        >
          <Badge variant={category.isActive ? "secondary" : "outline"} className="text-[10px]">
            {category.isActive ? t("admin.catalog.statusActive") : t("admin.catalog.statusHidden")}
          </Badge>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto h-7 w-7 p-0"
          onClick={options.onDrillIn}
          aria-label={options.drillLabel}
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </Button>
      </div>

      {editingId === category.id && editForm && (
        <div className="grid gap-3 border-t border-border/60 p-3 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor={`edit-name-${category.id}`}>{t("admin.catalog.nameLabel")}</Label>
            <Input
              id={`edit-name-${category.id}`}
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              maxLength={200}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`edit-namekg-${category.id}`}>{t("admin.catalog.nameKgLabel")}</Label>
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
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
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
            <Label htmlFor={`edit-sort-${category.id}`}>{t("admin.catalog.sortOrderLabel")}</Label>
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
    </div>
  );

  // Компактная карточка товара — та же структура, что у карточки
  // категории (фото сверху / название и цена в середине / кнопки внизу),
  // для единой адаптивной сетки на всех трёх уровнях каталога (Этап:
  // адаптивная сетка админ-каталога). Показывается только на странице
  // товаров (Уровень 3) — не смешивается с категориями/подкатегориями.
  const renderProductGridCard = (product: SellerProductDTO) => (
    <div
      key={product.id}
      className="flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card"
    >
      {editingProductId === product.id && editProductForm ? (
        <div className="space-y-3 p-3">
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
        <>
          <div className="aspect-square w-full overflow-hidden bg-secondary/40">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <Package className="h-5 w-5" />
              </div>
            )}
          </div>
          <div className="min-w-0 px-2 pt-1.5 pb-1">
            <p className="truncate text-sm font-medium">{product.name}</p>
            <p className="text-sm font-semibold">
              {product.price.toFixed(2)} {product.currency}
            </p>
          </div>
          <div className="mt-auto flex flex-wrap items-center gap-0.5 border-t border-border/60 px-1 py-1">
            <Badge
              variant={
                product.publicationStatus === ProductPublicationStatus.PUBLISHED
                  ? "secondary"
                  : "outline"
              }
              className="text-[10px]"
            >
              {t(publicationStatusKey(product.publicationStatus))}
            </Badge>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="ml-auto h-7 w-7 p-0"
              onClick={() => startEditProduct(product)}
              aria-label={t("admin.catalog.editButton")}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              disabled={toggleProductStatusMutation.isPending}
              aria-label={
                product.publicationStatus === ProductPublicationStatus.HIDDEN
                  ? t("admin.catalog.activateProductButton")
                  : t("admin.catalog.hideProductButton")
              }
              onClick={() =>
                toggleProductStatusMutation.mutate({
                  id: product.id,
                  publicationStatus:
                    product.publicationStatus === ProductPublicationStatus.HIDDEN
                      ? ProductPublicationStatus.PUBLISHED
                      : ProductPublicationStatus.HIDDEN,
                })
              }
            >
              {product.publicationStatus === ProductPublicationStatus.HIDDEN ? (
                <Eye className="h-3.5 w-3.5" />
              ) : (
                <EyeOff className="h-3.5 w-3.5" />
              )}
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                  aria-label={t("common.delete")}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {t("admin.catalog.deleteProductConfirmTitle")}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("admin.catalog.deleteProductConfirmDescription", { name: product.name })}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deleteProductMutation.mutate(product.id)}>
                    {t("common.delete")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </>
      )}
    </div>
  );

  // Форма создания категории/подкатегории — общая для обоих уровней,
  // parentId уже подставлен в handleSubmit через viewCategoryId.
  const renderCreateCategoryForm = (heading: string) => (
    <section className="mt-6 rounded-2xl border border-border/60 bg-card p-6">
      <h2 className="font-serif text-2xl mb-4">{heading}</h2>
      <form onSubmit={handleSubmit} className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
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
        </div>
        <ImageUploadField value={imageUrl} onChange={setImageUrl} context="category" />
        <Button
          type="submit"
          className="h-12 w-fit rounded-full"
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            t("admin.catalog.createButton")
          )}
        </Button>
      </form>
      {formError && <p className="mt-2 text-sm text-destructive">{formError}</p>}
    </section>
  );

  const renderNewProductSection = (categoryId: string) => (
    <>
      {addingProductCategoryId !== categoryId && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => startAddProduct(categoryId)}
        >
          {t("admin.catalog.addProductButton")}
        </Button>
      )}
      {addingProductCategoryId === categoryId && (
        <div className="mt-3 w-full rounded-lg border border-dashed border-primary/40 bg-background/60 p-4">
          <h3 className="font-medium mb-3">{t("admin.catalog.newProductHeading")}</h3>
          <ProductFormFields
            form={productForm}
            setForm={setProductForm}
            idPrefix={`new-product-${categoryId}`}
          />
          <div className="flex flex-wrap gap-2 pt-3">
            <Button
              type="button"
              className="h-10 rounded-full"
              disabled={createProductMutation.isPending}
              onClick={() => handleCreateProduct(categoryId, false)}
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
              onClick={() => handleCreateProduct(categoryId, true)}
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
    </>
  );

  return (
    <AdminLayout>
      <div className="mx-auto max-w-6xl px-6 py-12">
        <Button asChild variant="ghost" className="mb-6 -ml-2 rounded-full">
          <Link to="/admin">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("admin.common.backToHub")}
          </Link>
        </Button>

        <h1 className="font-serif text-4xl tracking-tight">{t("admin.catalog.title")}</h1>

        {/* Уровень 3: товары выбранной подкатегории (Каталог → Категории →
            Подкатегории → Товары). */}
        {viewSubcategory ? (
          <>
            <Button
              variant="ghost"
              className="mt-6 -ml-2 rounded-full"
              onClick={goBackToSubcategories}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("admin.catalog.backButton")}
            </Button>
            <h2 className="mt-2 font-serif text-2xl">
              {viewCategory?.name} / {viewSubcategory.name}
            </h2>
            <section className="mt-4 rounded-2xl border border-border/60 bg-card p-6">
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-muted-foreground">
                  {t("admin.catalog.productsHeading")}{" "}
                  {(productsByCategory.get(viewSubcategory.id)?.length ?? 0) > 0 &&
                    `(${productsByCategory.get(viewSubcategory.id)?.length})`}
                </p>
                {renderNewProductSection(viewSubcategory.id)}
              </div>
              {(productsByCategory.get(viewSubcategory.id) ?? []).length === 0 &&
                addingProductCategoryId !== viewSubcategory.id && (
                  <p className="text-sm text-muted-foreground">
                    {t("admin.catalog.noProductsInCategory")}
                  </p>
                )}
              {(productsByCategory.get(viewSubcategory.id) ?? []).length > 0 && (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {(productsByCategory.get(viewSubcategory.id) ?? []).map((product) =>
                    renderProductGridCard(product),
                  )}
                </div>
              )}
            </section>
          </>
        ) : viewCategory ? (
          /* Уровень 2: подкатегории выбранной основной категории. */
          <>
            <Button
              variant="ghost"
              className="mt-6 -ml-2 rounded-full"
              onClick={goBackToCategories}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("admin.catalog.backButton")}
            </Button>
            <h2 className="mt-2 font-serif text-2xl">{viewCategory.name}</h2>
            <section className="mt-4 rounded-2xl border border-border/60 bg-card p-6">
              {subcategoriesOfViewCategory.length === 0 ? (
                <div className="py-8 text-center">
                  <Tags className="h-6 w-6 text-primary mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {t("admin.catalog.noSubcategoriesInCategory")}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {subcategoriesOfViewCategory.map((sub) =>
                    renderCategoryRow(sub, {
                      onDrillIn: () => drillIntoSubcategory(sub.id),
                      drillLabel: t("admin.catalog.viewProductsButton"),
                    }),
                  )}
                </div>
              )}
            </section>
            {renderCreateCategoryForm(t("admin.catalog.newSubcategoryHeading"))}
          </>
        ) : (
          /* Уровень 1: основные категории. */
          <>
            <section className="mt-8 rounded-2xl border border-border/60 bg-card p-6">
              {!categories || topLevelCategories.length === 0 ? (
                <div className="py-8 text-center">
                  <Tags className="h-6 w-6 text-primary mx-auto mb-4" />
                  <p className="text-muted-foreground">{t("admin.catalog.emptyState")}</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {topLevelCategories.map((category) =>
                    renderCategoryRow(category, {
                      onDrillIn: () => drillIntoCategory(category.id),
                      drillLabel: t("admin.catalog.viewSubcategoriesButton"),
                    }),
                  )}
                </div>
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

            {renderCreateCategoryForm(t("admin.catalog.newCategoryHeading"))}
          </>
        )}
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
