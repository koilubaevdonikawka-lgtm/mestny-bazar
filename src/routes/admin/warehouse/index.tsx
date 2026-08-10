import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  adjustStock,
  listStock,
  recordStockReceipt,
  recordStockReturn,
  setStockThreshold,
} from "@/api/warehouse-admin";
import { listSuppliers } from "@/api/supplier";
import { createCategory, listAdminCategories } from "@/api/category-admin";
import { createAdminProduct, listAdminProducts, updateAdminProduct } from "@/api/product-admin";
import { signInWithGoogle } from "@/lib/auth";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { useTranslation } from "@/i18n/LanguageProvider";
import {
  ArrowLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  Folder,
  Loader2,
  LogIn,
  Package,
  PackagePlus,
  Pencil,
  Plus,
  RotateCcw,
  ShieldAlert,
  Trash2,
  Warehouse as WarehouseIcon,
} from "lucide-react";
import { toast } from "sonner";
import type { TranslationKey } from "@/i18n/t";
import type { StockItemDTO } from "@shared/contracts/stock";
import { ProductPublicationStatus, type SellerProductDTO } from "@shared/contracts/seller-product";
// Задача этапа №2/№4 — та же форма товара, что и в admin/catalog. Импорт
// напрямую из существующего маршрута, без копирования полей/JSX.
import {
  emptyProductForm,
  ProductFormFields,
  publicationStatusKey,
  toProductForm,
  type ProductFormState,
} from "@/routes/admin/catalog/index";

/** Products-per-fetch cap for the admin product list — same "candidate cap"
 * idiom already used elsewhere in the project (e.g. product page's sibling
 * fetch), large enough to cover any real catalog without pagination UI. */
const ADMIN_PRODUCTS_PAGE_SIZE = 500;

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export const Route = createFileRoute("/admin/warehouse/")({
  component: AdminWarehousePage,
});

const STATUS_LABEL_KEY = {
  ok: "admin.warehouse.statusOk",
  low: "admin.warehouse.statusLow",
  depleted: "admin.warehouse.statusDepleted",
} as const satisfies Record<string, TranslationKey>;

const emptyReceiptForm = () => ({
  quantity: "",
  movementDate: todayIsoDate(),
  purchasePrice: "",
  supplierId: "",
});

const emptyReturnForm = () => ({
  quantity: "",
  movementDate: todayIsoDate(),
  note: "",
});

function AdminWarehousePage() {
  const { isAuthenticated } = useSupabaseSession();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [thresholdEdits, setThresholdEdits] = useState<Record<string, string>>({});

  const [receiptProductId, setReceiptProductId] = useState<string | null>(null);
  const [receiptForm, setReceiptForm] = useState(emptyReceiptForm);
  const [returnProductId, setReturnProductId] = useState<string | null>(null);
  const [returnForm, setReturnForm] = useState(emptyReturnForm);

  // Задача №3 — mirrors the customer catalog's Category → Subcategory →
  // Product drill-down (same shape as category.$slug.tsx's own ancestry
  // handling), entirely client-side over data already fetched for admin
  // purposes elsewhere (admin/catalog uses the exact same
  // listAdminCategories/listAdminProducts calls) — no new query, no new
  // endpoint. `categoryPath` is the stack of category ids drilled into so
  // far; `selectedProductId` opens the movement card for one product.
  const [categoryPath, setCategoryPath] = useState<string[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // Задача этапа №1 — "➕ Добавить подкатегорию": which category's inline
  // subcategory form is open (by id), and the name being typed into it. The
  // parent is never shown as an editable field — it's implicit in which
  // tile's "+" was pressed, which is what "поле родительской категории
  // автоматически заполняется" means here (same createCategory call
  // admin/catalog uses, just with parentId supplied programmatically).
  const [subcategoryFormParentId, setSubcategoryFormParentId] = useState<string | null>(null);
  const [newSubcategoryName, setNewSubcategoryName] = useState("");

  // Задача этапа №2 — "➕ Добавить товар": which subcategory's product
  // form is open, and the form state itself. Reuses ProductFormState /
  // emptyProductForm from admin/catalog unchanged — the category is never
  // an editable field in that form; it's passed in separately, exactly the
  // same way admin/catalog's own handleCreateProduct(categoryId, ...) does.
  const [addingProductCategoryId, setAddingProductCategoryId] = useState<string | null>(null);
  const [newProductForm, setNewProductForm] = useState<ProductFormState>(emptyProductForm);

  // Задача этапа №4 — редактирование товара прямо с карточки движения.
  // Та же ProductFormState/ProductFormFields/toProductForm, что и
  // admin/catalog. editingProductId открыт только для одного товара за
  // раз, как и в admin/catalog.
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editProductForm, setEditProductForm] = useState<ProductFormState | null>(null);

  // Задача этапа №7 — фильтр по статусу публикации над списком товаров
  // подкатегории. Использует уже существующий слот `filters` компонента
  // AdminDataTable (RULE-002: сначала проверено, что такой слот уже есть,
  // прежде чем добавлять что-то новое) — чисто клиентская фильтрация уже
  // загруженных данных, как и поиск/сортировка из Задачи этапа №6.
  const [productStatusFilter, setProductStatusFilter] = useState<ProductPublicationStatus | "all">(
    "all",
  );

  const {
    data: items,
    isLoading: isStockLoading,
    isError: isStockError,
    error: stockError,
    refetch: refetchStock,
  } = useQuery({
    queryKey: ["admin", "warehouse", "stock"],
    queryFn: listStock,
    enabled: isAuthenticated === true,
    retry: false,
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ["admin", "warehouse", "suppliers"],
    queryFn: listSuppliers,
    enabled: isAuthenticated === true,
    retry: false,
  });

  // Same admin-facing category/product reads admin/catalog already uses —
  // reused here purely to build the browsing structure, not to duplicate
  // their CRUD (category/product management stays exclusively in
  // admin/catalog, per this stage's own scope).
  //
  // Задача этапа №7 — раньше эти два запроса не отдавали
  // isLoading/isError/refetch наружу вообще: если остатки (items)
  // успевали загрузиться, а категории или товары — ещё грузились
  // или упали с ошибкой, экран молча показывал пустые
  // категории/товары без единого индикатора. Ниже — тот же самый
  // существующий паттерн загрузки/ошибки/повтора, что уже
  // применён к items, просто распространён на все три запроса,
  // от которых зависит список товаров.
  const {
    data: adminCategories = [],
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
    error: categoriesError,
    refetch: refetchCategories,
  } = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: listAdminCategories,
    enabled: isAuthenticated === true,
    retry: false,
  });

  const {
    data: adminProductsResult,
    isLoading: isProductsLoading,
    isError: isProductsError,
    error: productsError,
    refetch: refetchProducts,
  } = useQuery({
    queryKey: ["admin", "products", "warehouse-browse"],
    queryFn: () => listAdminProducts({ pageSize: ADMIN_PRODUCTS_PAGE_SIZE }),
    enabled: isAuthenticated === true,
    retry: false,
  });

  const isLoading = isStockLoading || isCategoriesLoading || isProductsLoading;
  const isError = isStockError || isCategoriesError || isProductsError;
  const error = stockError ?? categoriesError ?? productsError;
  const refetch = () => {
    void refetchStock();
    void refetchCategories();
    void refetchProducts();
  };
  const adminProducts = useMemo(() => adminProductsResult?.items ?? [], [adminProductsResult]);

  const stockByProductId = useMemo(
    () => new Map((items ?? []).map((i) => [i.productId, i])),
    [items],
  );
  const categoriesById = useMemo(
    () => new Map(adminCategories.map((c) => [c.id, c])),
    [adminCategories],
  );

  const currentParentId = categoryPath[categoryPath.length - 1] ?? null;
  const childCategories = useMemo(
    () => adminCategories.filter((c) => c.parentId === currentParentId),
    [adminCategories, currentParentId],
  );
  // A leaf category (no subcategories) shows its products directly — same
  // "drill until there's nothing left to drill into" rule the customer
  // category page already follows for its own subcategory tiles.
  const productsInCurrentCategory = useMemo(
    () =>
      currentParentId === null ? [] : adminProducts.filter((p) => p.categoryId === currentParentId),
    [adminProducts, currentParentId],
  );
  // Задача этапа №7 — статус-фильтр применяется поверх productsInCurrentCategory,
  // перед тем как список уходит в AdminDataTable (которая сама уже
  // делает поиск/сортировку над тем, что ей передали).
  const productsForList = useMemo(
    () =>
      productStatusFilter === "all"
        ? productsInCurrentCategory
        : productsInCurrentCategory.filter((p) => p.publicationStatus === productStatusFilter),
    [productsInCurrentCategory, productStatusFilter],
  );

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["admin", "warehouse", "stock"] });

  // Задача этапа №1 — тот же createCategory, что использует admin/catalog
  // (server/functions/category-admin.executor.ts -> categoryAdminService),
  // без единой новой строки бэкенд-кода. После успеха: подкатегория сразу
  // видна, т.к. adminCategories перезапрашивается, и мы сразу открываем
  // созданную родительскую категорию, чтобы список подкатегорий был виден
  // без дополнительного клика.
  const createCategoryMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: (_created, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      toast.success(t("admin.catalog.categoryCreatedToast"));
      setSubcategoryFormParentId(null);
      setNewSubcategoryName("");
      if (variables.parentId) {
        setSelectedProductId(null);
        setCategoryPath((prev) =>
          prev[prev.length - 1] === variables.parentId ? prev : [...prev, variables.parentId!],
        );
      }
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : t("admin.catalog.categoryCreateError")),
  });

  const startAddSubcategory = (parentId: string) => {
    setSubcategoryFormParentId(parentId);
    setNewSubcategoryName("");
  };
  const cancelAddSubcategory = () => {
    setSubcategoryFormParentId(null);
    setNewSubcategoryName("");
  };
  const submitAddSubcategory = (parentId: string) => {
    if (!newSubcategoryName.trim() || newSubcategoryName.trim().length < 2) {
      toast.error(t("admin.catalog.nameMinLengthError"));
      return;
    }
    createCategoryMutation.mutate({ name: newSubcategoryName.trim(), parentId });
  };

  // Задача этапа №2 — тот же createAdminProduct, что вызывает форма товара
  // в admin/catalog (server/functions/product-admin.executor.ts ->
  // sellerProductService.createProduct(null, ...)). Ни новой бизнес-логики,
  // ни нового API — только вызов из другого места интерфейса.
  const createProductMutation = useMutation({
    mutationFn: createAdminProduct,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["admin", "products", "warehouse-browse"],
      });
      invalidate();
      toast.success(t("admin.catalog.productCreatedToast"));
      setAddingProductCategoryId(null);
      setNewProductForm(emptyProductForm());
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : t("admin.catalog.productCreateError")),
  });

  const startAddProduct = (categoryId: string) => {
    setSelectedProductId(null);
    setAddingProductCategoryId(categoryId);
    setNewProductForm(emptyProductForm());
    setCategoryPath((prev) =>
      prev[prev.length - 1] === categoryId ? prev : [...prev, categoryId],
    );
  };
  const cancelAddProduct = () => {
    setAddingProductCategoryId(null);
    setNewProductForm(emptyProductForm());
  };
  const submitAddProduct = (categoryId: string) => {
    const price = parseFloat(newProductForm.price);
    if (!newProductForm.name.trim() || newProductForm.name.trim().length < 2) {
      toast.error(t("admin.catalog.productNameMinLengthError"));
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      toast.error(t("admin.catalog.invalidPriceError"));
      return;
    }
    createProductMutation.mutate({
      categoryId,
      name: newProductForm.name.trim(),
      description: newProductForm.description.trim() || undefined,
      price,
      unit: newProductForm.unit.trim() || undefined,
      manufacturer: newProductForm.manufacturer.trim() || undefined,
      countryOfOrigin: newProductForm.countryOfOrigin.trim() || undefined,
      sku: newProductForm.sku.trim() || undefined,
      publicationStatus: newProductForm.publicationStatus,
      imageUrls: newProductForm.imageUrls,
    });
  };

  // Задача этапа №4 — тот же updateAdminProduct, что вызывает форма
  // редактирования в admin/catalog (server/functions/product-admin.executor.ts
  // -> sellerProductService.updateProduct). Инвалидируем оба списка товаров
  // (Каталог и Склад используют разные ключи запроса на один и тот же
  // источник данных), чтобы карточка и списки обновились сами, без
  // рассинхронизации между разделами.
  const updateProductMutation = useMutation({
    mutationFn: updateAdminProduct,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      invalidate();
      toast.success(t("admin.catalog.productUpdatedToast"));
      setEditingProductId(null);
      setEditProductForm(null);
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : t("admin.catalog.productUpdateError")),
  });

  const startEditProduct = (product: SellerProductDTO) => {
    setEditingProductId(product.id);
    setEditProductForm(toProductForm(product));
  };
  const cancelEditProduct = () => {
    setEditingProductId(null);
    setEditProductForm(null);
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

  const adjustMutation = useMutation({
    mutationFn: adjustStock,
    onSuccess: () => {
      invalidate();
      toast.success(t("admin.warehouse.stockUpdatedToast"));
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : t("admin.warehouse.stockUpdateError")),
  });

  const receiptMutation = useMutation({
    mutationFn: recordStockReceipt,
    onSuccess: () => {
      invalidate();
      toast.success(t("admin.warehouse.receiptSuccessToast"));
      setReceiptProductId(null);
      setReceiptForm(emptyReceiptForm());
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : t("admin.warehouse.receiptErrorToast")),
  });

  const returnMutation = useMutation({
    mutationFn: recordStockReturn,
    onSuccess: () => {
      invalidate();
      toast.success(t("admin.warehouse.returnSuccessToast"));
      setReturnProductId(null);
      setReturnForm(emptyReturnForm());
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : t("admin.warehouse.returnErrorToast")),
  });

  const thresholdMutation = useMutation({
    mutationFn: setStockThreshold,
    onSuccess: () => {
      invalidate();
      toast.success(t("admin.warehouse.thresholdUpdatedToast"));
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : t("admin.warehouse.thresholdUpdateError")),
  });

  const handleSignIn = async () => {
    await signInWithGoogle();
  };

  const startReceipt = (productId: string) => {
    setReturnProductId(null);
    setReceiptProductId(productId);
    setReceiptForm(emptyReceiptForm());
  };

  const cancelReceipt = () => {
    setReceiptProductId(null);
    setReceiptForm(emptyReceiptForm());
  };

  const handleReceiptSubmit = (productId: string) => {
    const quantity = Number(receiptForm.quantity);
    if (!Number.isInteger(quantity) || quantity <= 0) {
      toast.error(t("admin.warehouse.quantityPositiveError"));
      return;
    }
    if (!receiptForm.movementDate) {
      toast.error(t("admin.warehouse.dateRequiredReceiptError"));
      return;
    }
    receiptMutation.mutate({
      productId,
      quantity,
      movementDate: receiptForm.movementDate,
      purchasePrice: receiptForm.purchasePrice ? Number(receiptForm.purchasePrice) : null,
      supplierId: receiptForm.supplierId || null,
    });
  };

  const startReturn = (productId: string) => {
    setReceiptProductId(null);
    setReturnProductId(productId);
    setReturnForm(emptyReturnForm());
  };

  const cancelReturn = () => {
    setReturnProductId(null);
    setReturnForm(emptyReturnForm());
  };

  const handleReturnSubmit = (productId: string) => {
    const quantity = Number(returnForm.quantity);
    if (!Number.isInteger(quantity) || quantity <= 0) {
      toast.error(t("admin.warehouse.quantityPositiveError"));
      return;
    }
    if (!returnForm.movementDate) {
      toast.error(t("admin.warehouse.dateRequiredReturnError"));
      return;
    }
    returnMutation.mutate({
      productId,
      quantity,
      movementDate: returnForm.movementDate,
      note: returnForm.note.trim() || null,
    });
  };

  const enterCategory = (categoryId: string) => setCategoryPath((prev) => [...prev, categoryId]);
  const goToBreadcrumbIndex = (index: number) => {
    // index -1 = root (Категории), 0..n = that position in the path.
    setCategoryPath((prev) => prev.slice(0, index + 1));
    setSelectedProductId(null);
  };
  // Задача этапа №5 — явная кнопка «Назад» на уровнях
  // Категория/Подкатегория, в дополнение к уже существующим
  // хлебным крошкам. Тот же механизм (goToBreadcrumbIndex),
  // просто вызванный с индексом на один уровень выше —
  // никакой новой логики навигации.
  const goBackOneLevel = () => goToBreadcrumbIndex(categoryPath.length - 2);
  const openProduct = (productId: string) => {
    setReceiptProductId(null);
    setReturnProductId(null);
    cancelEditProduct();
    setSelectedProductId(productId);
  };
  const closeProduct = () => {
    cancelEditProduct();
    setSelectedProductId(null);
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
          <h1 className="font-serif text-3xl tracking-tight">{t("admin.warehouse.title")}</h1>
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
    const message = error instanceof Error ? error.message : t("admin.warehouse.loadError");
    const isForbidden =
      message.toLowerCase().includes("access denied") ||
      message.toLowerCase().includes("warehouse role") ||
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

  // Задача №3, п.3/4/5/6 — the "product movement card": the exact same
  // controls (adjust/threshold/receipt/return, still-disabled write-off)
  // that used to sit inline in the flat list, now shown for a single
  // product reached via the category drill-down. Same mutations, same
  // recording mechanism (InventoryService, unchanged) — only reachable
  // through a different navigation path.
  const renderMovementCard = (item: StockItemDTO, product: SellerProductDTO) => (
    <div className="rounded-2xl border border-border/60 bg-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xl font-medium">{item.name}</p>
        <div className="flex shrink-0 items-center gap-1">
          <Badge variant={item.status === "ok" ? "secondary" : "destructive"}>
            {t(STATUS_LABEL_KEY[item.status as keyof typeof STATUS_LABEL_KEY])}
          </Badge>
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
      </div>

      {/* Задача этапа №4 — просмотр и редактирование товара прямо с
          карточки движения, тем же ProductFormFields/toProductForm/
          updateAdminProduct, что и в admin/catalog. Ни новой формы, ни
          новой бизнес-логики — только другое место вызова. */}
      {editingProductId === product.id && editProductForm ? (
        <div className="mt-4 space-y-3 border-t border-border/60 pt-4">
          <ProductFormFields
            form={editProductForm}
            setForm={setEditProductForm}
            idPrefix={`wh-edit-product-${product.id}`}
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
        <div className="mt-3 flex flex-wrap items-start justify-between gap-2 border-t border-border/60 pt-3">
          <div className="min-w-0">
            <p className="font-semibold">
              {product.price.toFixed(2)} {product.currency}
            </p>
            {product.description && (
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                {product.description}
              </p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              {[
                product.unit && t("admin.catalog.unitCharacteristic", { unit: product.unit }),
                product.manufacturer &&
                  t("admin.catalog.manufacturerCharacteristic", { value: product.manufacturer }),
                product.countryOfOrigin &&
                  t("admin.catalog.countryCharacteristic", { value: product.countryOfOrigin }),
                product.sku && t("admin.catalog.skuCharacteristic", { value: product.sku }),
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
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
              onClick={() => startEditProduct(product)}
              aria-label={t("admin.catalog.editButton")}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Задача №4 — the current/new stock, shown as a clear standalone
          number (not just an input placeholder, which used to be the only
          place it appeared and disappears the moment the field is edited). */}
      <p className="mt-3 text-sm text-muted-foreground">
        {t("admin.warehouse.currentStockLabel")}:{" "}
        <span className="text-2xl font-serif font-semibold text-foreground">{item.stock}</span>{" "}
        {item.unit ?? ""}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Input
          className="w-24"
          type="number"
          min={0}
          placeholder={String(item.stock)}
          value={edits[item.productId] ?? ""}
          onChange={(e) => setEdits((prev) => ({ ...prev, [item.productId]: e.target.value }))}
        />
        <Button
          size="sm"
          variant="outline"
          disabled={adjustMutation.isPending || !edits[item.productId]}
          onClick={() => {
            const value = Number(edits[item.productId]);
            if (!Number.isInteger(value) || value < 0) {
              toast.error(t("admin.warehouse.adjustStockError"));
              return;
            }
            adjustMutation.mutate({ productId: item.productId, stock: value });
          }}
        >
          {t("admin.warehouse.adjustStockButton")}
        </Button>
        <Input
          className="w-24"
          type="number"
          min={0}
          placeholder={t("admin.warehouse.thresholdPlaceholder", {
            threshold: String(item.effectiveThreshold),
          })}
          value={thresholdEdits[item.productId] ?? ""}
          onChange={(e) =>
            setThresholdEdits((prev) => ({ ...prev, [item.productId]: e.target.value }))
          }
        />
        <Button
          size="sm"
          variant="outline"
          disabled={thresholdMutation.isPending || !thresholdEdits[item.productId]}
          onClick={() => {
            const value = Number(thresholdEdits[item.productId]);
            if (!Number.isInteger(value) || value < 0) {
              toast.error(t("admin.warehouse.setThresholdError"));
              return;
            }
            thresholdMutation.mutate({ productId: item.productId, threshold: value });
          }}
        >
          {t("admin.warehouse.setThresholdButton")}
        </Button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/60 pt-4">
        <span className="text-xs font-medium text-muted-foreground">
          {t("admin.warehouse.movementHeading")}
        </span>
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            receiptProductId === item.productId ? cancelReceipt() : startReceipt(item.productId)
          }
        >
          <PackagePlus className="h-3.5 w-3.5 mr-1.5" />
          {t("admin.warehouse.receiptButton")}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            returnProductId === item.productId ? cancelReturn() : startReturn(item.productId)
          }
        >
          <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
          {t("admin.warehouse.returnButton")}
        </Button>
        <Button size="sm" variant="outline" disabled title={t("admin.warehouse.writeOffTooltip")}>
          <Trash2 className="h-3.5 w-3.5 mr-1.5" />
          {t("admin.warehouse.writeOffButton")}
        </Button>
      </div>

      {/* Задача этапа №3 — история движения этого товара уже
          существует в проекте как общий журнал аудита
          (/admin/logs, entityType=product, entityId=товар).
          Здесь — просто прямая ссылка с предзаполненным
          фильтром, а не новая реализация истории. */}
      <div className="mt-3">
        <Link
          to="/admin/logs"
          search={{ entityType: "product", entityId: item.productId }}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary"
        >
          <FileText className="h-3.5 w-3.5" />
          {t("admin.warehouse.movementHistoryLink")}
        </Link>
      </div>

      {receiptProductId === item.productId && (
        <div className="mt-4 grid gap-3 rounded-xl border border-dashed border-primary/40 bg-background/60 p-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor={`receipt-qty-${item.productId}`}>
              {item.unit
                ? t("admin.warehouse.quantityWithUnitLabel", { unit: item.unit })
                : t("admin.warehouse.quantityLabel")}
            </Label>
            <Input
              id={`receipt-qty-${item.productId}`}
              type="number"
              min={1}
              value={receiptForm.quantity}
              onChange={(e) => setReceiptForm({ ...receiptForm, quantity: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`receipt-date-${item.productId}`}>
              {t("admin.warehouse.dateLabel")}
            </Label>
            <Input
              id={`receipt-date-${item.productId}`}
              type="date"
              value={receiptForm.movementDate}
              onChange={(e) => setReceiptForm({ ...receiptForm, movementDate: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`receipt-price-${item.productId}`}>
              {t("admin.warehouse.purchasePriceLabel")}
            </Label>
            <Input
              id={`receipt-price-${item.productId}`}
              type="number"
              min={0}
              step="0.01"
              value={receiptForm.purchasePrice}
              onChange={(e) => setReceiptForm({ ...receiptForm, purchasePrice: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`receipt-supplier-${item.productId}`}>
              {t("admin.warehouse.supplierLabel")}
            </Label>
            <select
              id={`receipt-supplier-${item.productId}`}
              value={receiptForm.supplierId}
              onChange={(e) => setReceiptForm({ ...receiptForm, supplierId: e.target.value })}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">{t("admin.warehouse.noSupplierOption")}</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 sm:col-span-2">
            <Button
              type="button"
              size="sm"
              disabled={receiptMutation.isPending}
              onClick={() => handleReceiptSubmit(item.productId)}
            >
              {receiptMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t("admin.warehouse.saveReceiptButton")
              )}
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={cancelReceipt}>
              {t("common.cancel")}
            </Button>
          </div>
        </div>
      )}

      {returnProductId === item.productId && (
        <div className="mt-4 grid gap-3 rounded-xl border border-dashed border-primary/40 bg-background/60 p-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor={`return-qty-${item.productId}`}>
              {item.unit
                ? t("admin.warehouse.quantityWithUnitLabel", { unit: item.unit })
                : t("admin.warehouse.quantityLabel")}
            </Label>
            <Input
              id={`return-qty-${item.productId}`}
              type="number"
              min={1}
              value={returnForm.quantity}
              onChange={(e) => setReturnForm({ ...returnForm, quantity: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`return-date-${item.productId}`}>
              {t("admin.warehouse.dateLabel")}
            </Label>
            <Input
              id={`return-date-${item.productId}`}
              type="date"
              value={returnForm.movementDate}
              onChange={(e) => setReturnForm({ ...returnForm, movementDate: e.target.value })}
            />
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor={`return-note-${item.productId}`}>
              {t("admin.warehouse.commentLabel")}
            </Label>
            <Input
              id={`return-note-${item.productId}`}
              value={returnForm.note}
              onChange={(e) => setReturnForm({ ...returnForm, note: e.target.value })}
              placeholder={t("admin.warehouse.commentPlaceholder")}
            />
          </div>
          <div className="flex gap-2 sm:col-span-2">
            <Button
              type="button"
              size="sm"
              disabled={returnMutation.isPending}
              onClick={() => handleReturnSubmit(item.productId)}
            >
              {returnMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t("admin.warehouse.saveReturnButton")
              )}
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={cancelReturn}>
              {t("common.cancel")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  // Задача этапа №8 — аудит нашёл два реальных недочёта в полноте
  // навигации/действий для категории:
  // 1. Если у категории уже есть хотя бы одна подкатегория, экран
  //    плиток не давал добавить ЕЩЁ одну подкатегорию (кнопка "+"
  //    была только на каждой существующей плитке — добавляла
  //    внучатую категорию, а не сестринскую).
  // 2. Товары, у которых categoryId указывает на категорию, ИМЕЮЩУЮ
  //    подкатегории (не обязательно на лист дерева — так уже
  //    допускает и модель данных, и форма товара в Каталоге),
  //    были не видны нигде в Складе: экран плиток их не показывал,
  //    а список товаров рендерился только для категорий без детей.
  //
  // Обе проблемы закрываются одним и тем же уже существующим блоком
  // (кнопки добавления подкатегории/товара + AdminDataTable из
  // Задачи этапа №6/№7), который раньше был только частью "листовой"
  // ветки рендера. Вынесен в отдельную функцию и вызывается из ОБЕИХ
  // веток (плитки и лист), а не продублирован — RULE-002,
  // "отсутствие дублирования функций" из чек-листа этого этапа.
  const renderCategoryWorkspace = (showHeading: boolean) => (
    <>
      {showHeading && (
        <h2 className="mb-3 mt-6 border-t border-border/60 pt-6 text-sm font-medium text-muted-foreground">
          {t("admin.warehouse.categoryOwnSectionHeading")}
        </h2>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        {subcategoryFormParentId !== currentParentId && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => startAddSubcategory(currentParentId!)}
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            {t("admin.warehouse.addSubcategoryButton")}
          </Button>
        )}
        {addingProductCategoryId !== currentParentId && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => startAddProduct(currentParentId!)}
          >
            <PackagePlus className="h-3.5 w-3.5 mr-1.5" />
            {t("admin.warehouse.addProductButton")}
          </Button>
        )}
      </div>

      {subcategoryFormParentId === currentParentId && (
        <div className="mb-4 flex items-center gap-1.5">
          <Input
            autoFocus
            value={newSubcategoryName}
            onChange={(e) => setNewSubcategoryName(e.target.value)}
            placeholder={t("admin.catalog.namePlaceholder")}
            className="h-9 text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter") submitAddSubcategory(currentParentId!);
            }}
          />
          <Button
            type="button"
            size="sm"
            className="h-9 shrink-0 px-2.5"
            disabled={createCategoryMutation.isPending}
            onClick={() => submitAddSubcategory(currentParentId!)}
          >
            {createCategoryMutation.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              t("admin.catalog.createButton")
            )}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-9 shrink-0"
            onClick={cancelAddSubcategory}
          >
            {t("common.cancel")}
          </Button>
        </div>
      )}

      {addingProductCategoryId === currentParentId && (
        <div className="mb-4 rounded-xl border border-dashed border-primary/40 bg-background/60 p-4">
          <ProductFormFields
            form={newProductForm}
            setForm={setNewProductForm}
            idPrefix="wh-new-product"
          />
          <div className="mt-3 flex gap-2">
            <Button
              type="button"
              size="sm"
              disabled={createProductMutation.isPending}
              onClick={() => submitAddProduct(currentParentId!)}
            >
              {createProductMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t("admin.catalog.createButton")
              )}
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={cancelAddProduct}>
              {t("common.cancel")}
            </Button>
          </div>
        </div>
      )}

      <p className="mb-2 text-sm text-muted-foreground">
        {t(
          productsInCurrentCategory.length === 1
            ? "admin.warehouse.productsCountOne"
            : "admin.warehouse.productsCountMany",
          { count: productsInCurrentCategory.length },
        )}
      </p>
      <AdminDataTable
        rows={productsForList}
        getRowId={(p) => p.id}
        searchFn={(p, q) =>
          p.name.toLowerCase().includes(q) || (p.sku ?? "").toLowerCase().includes(q)
        }
        searchPlaceholder={t("admin.warehouse.productSearchPlaceholder")}
        filters={
          <select
            value={productStatusFilter}
            onChange={(e) =>
              setProductStatusFilter(e.target.value as ProductPublicationStatus | "all")
            }
            aria-label={t("admin.warehouse.statusFilterLabel")}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="all">{t("admin.warehouse.allStatusesOption")}</option>
            <option value={ProductPublicationStatus.PUBLISHED}>
              {t(publicationStatusKey(ProductPublicationStatus.PUBLISHED))}
            </option>
            <option value={ProductPublicationStatus.DRAFT}>
              {t(publicationStatusKey(ProductPublicationStatus.DRAFT))}
            </option>
            <option value={ProductPublicationStatus.HIDDEN}>
              {t(publicationStatusKey(ProductPublicationStatus.HIDDEN))}
            </option>
          </select>
        }
        emptyState={({ query }) => (
          <>
            <Package className="h-6 w-6 text-primary mx-auto mb-4" />
            <p>
              {query
                ? t("admin.warehouse.noSearchResults", { query })
                : t("admin.warehouse.noProductsInCategory")}
            </p>
          </>
        )}
        columns={[
          {
            key: "name",
            header: t("admin.warehouse.productColumnName"),
            sortable: true,
            sortValue: (p) => p.name,
            render: (p) => (
              <span className="flex min-w-0 items-center gap-3">
                <Package className="h-4 w-4 shrink-0 text-primary" />
                <span className="min-w-0">
                  <span className="block truncate font-medium">{p.name}</span>
                  {p.sku && (
                    <span className="block truncate text-xs text-muted-foreground">{p.sku}</span>
                  )}
                </span>
              </span>
            ),
          },
          {
            key: "status",
            header: t("admin.warehouse.productColumnStatus"),
            className: "w-28 shrink-0",
            sortable: true,
            sortValue: (p) => p.publicationStatus,
            render: (p) => (
              <Badge
                variant={
                  p.publicationStatus === ProductPublicationStatus.PUBLISHED
                    ? "secondary"
                    : "outline"
                }
              >
                {t(publicationStatusKey(p.publicationStatus))}
              </Badge>
            ),
          },
          {
            key: "price",
            header: t("admin.warehouse.productColumnPrice"),
            className: "w-28 shrink-0",
            sortable: true,
            sortValue: (p) => p.price,
            render: (p) => (
              <span className="text-sm font-medium tabular-nums">
                {p.price.toFixed(2)} {p.currency}
              </span>
            ),
          },
          {
            key: "unit",
            header: t("admin.warehouse.productColumnUnit"),
            className: "w-20 shrink-0",
            sortable: true,
            sortValue: (p) => p.unit ?? "",
            render: (p) => <span className="text-sm text-muted-foreground">{p.unit || "—"}</span>,
          },
          {
            key: "stock",
            header: t("admin.warehouse.productColumnStock"),
            className: "w-32 shrink-0",
            sortable: true,
            sortValue: (p) => stockByProductId.get(p.id)?.stock ?? 0,
            render: (p) => {
              const stockItem = stockByProductId.get(p.id);
              return stockItem ? (
                <span className="flex items-center gap-2">
                  <span className="text-sm font-medium tabular-nums">{stockItem.stock}</span>
                  <Badge variant={stockItem.status === "ok" ? "secondary" : "destructive"}>
                    {t(STATUS_LABEL_KEY[stockItem.status as keyof typeof STATUS_LABEL_KEY])}
                  </Badge>
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">—</span>
              );
            },
          },
        ]}
        rowActions={(p) => (
          <>
            <Button type="button" variant="outline" size="sm" onClick={() => openProduct(p.id)}>
              {t("admin.warehouse.openProductButton")}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-label={t("admin.warehouse.receiptButton")}
              onClick={() => {
                openProduct(p.id);
                startReceipt(p.id);
              }}
            >
              <PackagePlus className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-label={t("admin.warehouse.returnButton")}
              onClick={() => {
                openProduct(p.id);
                startReturn(p.id);
              }}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </>
        )}
      />
    </>
  );

  const selectedProduct = selectedProductId
    ? adminProducts.find((p) => p.id === selectedProductId)
    : undefined;
  // A product not yet present in listStock() (e.g. just created) still gets
  // a usable card, backed by the product's own stock field instead of
  // blocking navigation on a missing stock row.
  const selectedStockItem: StockItemDTO | undefined = selectedProduct
    ? (stockByProductId.get(selectedProduct.id) ?? {
        productId: selectedProduct.id,
        name: selectedProduct.name,
        stock: selectedProduct.stock,
        lowStockThreshold: null,
        effectiveThreshold: 0,
        status: "ok",
        unit: selectedProduct.unit,
      })
    : undefined;

  return (
    <AdminLayout>
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Button asChild variant="ghost" className="mb-6 -ml-2 rounded-full">
          <Link to="/admin">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("admin.common.backToHub")}
          </Link>
        </Button>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-4xl tracking-tight">{t("admin.warehouse.title")}</h1>
            <p className="mt-2 text-muted-foreground">
              {t("admin.warehouse.descriptionPrefix")}{" "}
              <code className="text-sm">docs/admin-platform/warehouse.md</code>).{" "}
              {t("admin.warehouse.descriptionSuffix")}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link to="/warehouse/orders">{t("admin.warehouse.assemblyQueueLink")}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/admin/logs">{t("admin.warehouse.movementLogLink")}</Link>
            </Button>
          </div>
        </div>

        {/* Задача №3, п.2 — Категория → Подкатегория → Товар breadcrumb,
            same drill-down shape as the customer catalog's own category
            ancestry. */}
        <div className="mt-8 flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
          <button
            type="button"
            onClick={() => goToBreadcrumbIndex(-1)}
            className={
              categoryPath.length === 0 && !selectedProductId
                ? "font-medium text-foreground"
                : "hover:text-foreground"
            }
          >
            {t("admin.warehouse.categoriesRootLabel")}
          </button>
          {categoryPath.map((id, index) => (
            <span key={id} className="flex items-center gap-1">
              <ChevronRight className="h-3.5 w-3.5" />
              <button
                type="button"
                onClick={() => goToBreadcrumbIndex(index)}
                className={
                  index === categoryPath.length - 1 && !selectedProductId
                    ? "font-medium text-foreground"
                    : "hover:text-foreground"
                }
              >
                {categoriesById.get(id)?.name ?? id}
              </button>
            </span>
          ))}
          {selectedProduct && (
            <span className="flex items-center gap-1">
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="font-medium text-foreground">{selectedProduct.name}</span>
            </span>
          )}
        </div>

        <section className="mt-4 rounded-2xl border border-border/60 bg-card p-6">
          {selectedProduct && selectedStockItem ? (
            <>
              <Button variant="ghost" size="sm" className="mb-4 -ml-2" onClick={closeProduct}>
                <ArrowLeft className="h-4 w-4 mr-1.5" />
                {t("common.back")}
              </Button>
              {renderMovementCard(selectedStockItem, selectedProduct)}
            </>
          ) : childCategories.length > 0 ? (
            // Категория / Подкатегория tiles — each one mirrors the customer
            // catalog's own subcategory tiles (Задача №3), plus a "➕
            // Добавить подкатегорию" affordance in its corner (Задача этапа
            // №1). The parent is never a visible/editable field — it's fixed
            // to whichever tile's "+" was pressed.
            <>
              {categoryPath.length > 0 && (
                <Button variant="ghost" size="sm" className="mb-4 -ml-2" onClick={goBackOneLevel}>
                  <ArrowLeft className="h-4 w-4 mr-1.5" />
                  {t("common.back")}
                </Button>
              )}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {childCategories.map((c) => (
                  <div
                    key={c.id}
                    className="relative rounded-xl border border-border/60 bg-secondary/40 p-4 text-center transition-colors hover:border-primary/40"
                  >
                    <button
                      type="button"
                      onClick={() => enterCategory(c.id)}
                      className="flex w-full flex-col items-center gap-2"
                    >
                      <Folder className="h-6 w-6 text-primary" />
                      <span className="text-sm font-medium">{c.name}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        subcategoryFormParentId === c.id
                          ? cancelAddSubcategory()
                          : startAddSubcategory(c.id)
                      }
                      aria-label={t("admin.warehouse.addSubcategoryButton")}
                      className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-background text-primary shadow-sm transition-colors hover:bg-primary hover:text-primary-foreground"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                    {/* Задача этапа №2 — "➕ Добавить товар", только на
                      подкатегориях (c.parentId !== null), не на корневых
                      категориях: иерархия Категория → Подкатегория → Товар.
                      Клик сразу открывает эту подкатегорию и форму товара
                      внутри неё — там же, где новый товар появится. */}
                    {c.parentId !== null && (
                      <button
                        type="button"
                        onClick={() => startAddProduct(c.id)}
                        aria-label={t("admin.warehouse.addProductButton")}
                        className="absolute left-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-background text-primary shadow-sm transition-colors hover:bg-primary hover:text-primary-foreground"
                      >
                        <PackagePlus className="h-4 w-4" />
                      </button>
                    )}
                    {subcategoryFormParentId === c.id && (
                      <div className="mt-3 flex items-center gap-1.5">
                        <Input
                          autoFocus
                          value={newSubcategoryName}
                          onChange={(e) => setNewSubcategoryName(e.target.value)}
                          placeholder={t("admin.catalog.namePlaceholder")}
                          className="h-9 text-sm"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") submitAddSubcategory(c.id);
                          }}
                        />
                        <Button
                          type="button"
                          size="sm"
                          className="h-9 shrink-0 px-2.5"
                          disabled={createCategoryMutation.isPending}
                          onClick={() => submitAddSubcategory(c.id)}
                        >
                          {createCategoryMutation.isPending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            t("admin.catalog.createButton")
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Задача этапа №8 — та же "рабочая область" категории,
                  что и на листовом уровне: без неё нельзя было ни
                  добавить сестринскую подкатегорию, ни увидеть товары,
                  привязанные напрямую к категории с подкатегориями. */}
              {currentParentId !== null && renderCategoryWorkspace(true)}
            </>
          ) : currentParentId === null ? (
            <div className="py-8 text-center">
              <WarehouseIcon className="h-6 w-6 text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">{t("admin.warehouse.emptyState")}</p>
            </div>
          ) : (
            <>
              {/* Задача этапа №5 — явная «Назад» на листовом уровне
                  (список товаров подкатегории), тем же goBackOneLevel. */}
              <Button variant="ghost" size="sm" className="mb-4 -ml-2" onClick={goBackOneLevel}>
                <ArrowLeft className="h-4 w-4 mr-1.5" />
                {t("common.back")}
              </Button>

              {renderCategoryWorkspace(false)}
            </>
          )}
        </section>
      </div>
    </AdminLayout>
  );
}
