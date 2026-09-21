import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { listCities } from "@/api/city";
import { createStore, listAdminStores, updateStore } from "@/api/store";
import {
  createDeliveryZone,
  deactivateDeliveryZone,
  listAdminDeliveryZones,
  updateDeliveryZone,
} from "@/api/delivery-zone";
import {
  createDeliveryTariff,
  listDeliveryTariffs,
  updateDeliveryTariff,
} from "@/api/delivery-tariff";
import { previewDeliveryFee } from "@/api/delivery-pricing";
import type {
  DeliveryPricingModel,
  DeliveryTariffDTO,
  DeliveryTariffType,
  DeliveryZoneDTO,
  StoreDTO,
} from "@shared/contracts/delivery";
import { signInWithGoogle } from "@/lib/auth";
import {
  DELIVERY_WEIGHT_RULE,
  deriveSimpleDeliverySetup,
  extraFeePerKg,
} from "@/lib/delivery-admin-view";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import {
  Calculator,
  ChevronDown,
  Loader2,
  LogIn,
  MapPinned,
  Pencil,
  ShieldAlert,
  Store as StoreIcon,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/delivery/")({
  component: AdminDeliveryPage,
});

const TARIFF_TYPE_LABEL: Record<DeliveryTariffType, string> = {
  STANDARD: "Стандартный",
  HOLIDAY: "Праздничный",
  CORPORATE: "Корпоративный",
  PROMOTIONAL: "Акционный",
};

const PRICING_MODEL_LABEL: Record<DeliveryPricingModel, string> = {
  FIXED: "Фиксированная",
  BY_ZONE: "По зоне",
  BY_DISTANCE: "По расстоянию",
};

/**
 * docs/delivery/delivery-rule-engine.md — static, informational only (mirrors
 * AutomationOverviewService's pattern). Задача №295 — worded for the shop
 * owner: the checks themselves (and their fixed order, top to bottom) live in
 * the delivery rule engine and are unchanged; only the on-screen names are.
 */
const ZONE_POLICY_RULES = [
  { name: "Зона включена", note: "если зона выключена, доставка в неё недоступна" },
  {
    name: "Минимальная сумма заказа",
    note: "если у тарифа задан минимум, заказ на меньшую сумму не принимается",
  },
  { name: "Всё остальное", note: "доставка разрешена" },
];

const TARIFF_POLICY_RULES = [
  { name: "Корпоративный тариф", note: "для корпоративных клиентов" },
  { name: "Праздничный тариф", note: "если дата заказа попадает в его период" },
  { name: "Акционный тариф", note: "если дата заказа попадает в период акции" },
  { name: "Стандартный тариф", note: "во всех остальных случаях — тариф зоны или общий" },
];

function AdminDeliveryPage() {
  const { isAuthenticated } = useSupabaseSession();
  const queryClient = useQueryClient();

  const [editingStoreId, setEditingStoreId] = useState<string | null>(null);
  const [storeName, setStoreName] = useState("");
  const [storeCityId, setStoreCityId] = useState("");
  const [storeAddress, setStoreAddress] = useState("");
  const [storeLat, setStoreLat] = useState("");
  const [storeLng, setStoreLng] = useState("");

  const [editingZoneId, setEditingZoneId] = useState<string | null>(null);
  const [zoneName, setZoneName] = useState("");
  const [zoneCityId, setZoneCityId] = useState("");

  const [editingTariffId, setEditingTariffId] = useState<string | null>(null);
  const [tariffName, setTariffName] = useState("");
  const [tariffZoneId, setTariffZoneId] = useState<string>("");
  const [tariffType, setTariffType] = useState<DeliveryTariffType>("STANDARD");
  const [tariffPricingModel, setTariffPricingModel] = useState<DeliveryPricingModel>("FIXED");
  const [tariffBasePrice, setTariffBasePrice] = useState("");
  const [tariffFreeFrom, setTariffFreeFrom] = useState("");
  const [tariffEtaMin, setTariffEtaMin] = useState("");
  const [tariffEtaMax, setTariffEtaMax] = useState("");

  // Задача №295 — simple view: drafts are null until the owner types, so the
  // fields show the saved values without copying server data into state.
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [zoneNameDraft, setZoneNameDraft] = useState<string | null>(null);
  const [etaDraft, setEtaDraft] = useState<{ min: string; max: string } | null>(null);
  const [storeDraft, setStoreDraft] = useState<{
    name: string;
    address: string;
    lat: string;
    lng: string;
  } | null>(null);

  const [previewZoneId, setPreviewZoneId] = useState("");
  const [previewSubtotal, setPreviewSubtotal] = useState("");
  const [previewDate, setPreviewDate] = useState("");

  const citiesQuery = useQuery({
    queryKey: ["admin", "delivery", "cities"],
    queryFn: listCities,
    enabled: isAuthenticated === true,
    retry: false,
  });

  const storesQuery = useQuery({
    queryKey: ["admin", "delivery", "stores"],
    queryFn: listAdminStores,
    enabled: isAuthenticated === true,
    retry: false,
  });

  const zonesQuery = useQuery({
    queryKey: ["admin", "delivery", "zones"],
    queryFn: listAdminDeliveryZones,
    enabled: isAuthenticated === true,
    retry: false,
  });

  const tariffsQuery = useQuery({
    queryKey: ["admin", "delivery", "tariffs"],
    queryFn: listDeliveryTariffs,
    enabled: isAuthenticated === true,
    retry: false,
  });

  const invalidateStores = () =>
    queryClient.invalidateQueries({ queryKey: ["admin", "delivery", "stores"] });
  const invalidateZones = () =>
    queryClient.invalidateQueries({ queryKey: ["admin", "delivery", "zones"] });
  const invalidateTariffs = () =>
    queryClient.invalidateQueries({ queryKey: ["admin", "delivery", "tariffs"] });

  const resetStoreForm = () => {
    setEditingStoreId(null);
    setStoreName("");
    setStoreCityId("");
    setStoreAddress("");
    setStoreLat("");
    setStoreLng("");
    setStoreDraft(null);
  };

  const createStoreMutation = useMutation({
    mutationFn: createStore,
    onSuccess: () => {
      invalidateStores();
      toast.success("Магазин создан");
      resetStoreForm();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Не удалось создать магазин"),
  });

  const updateStoreMutation = useMutation({
    mutationFn: updateStore,
    onSuccess: () => {
      invalidateStores();
      toast.success("Магазин обновлён");
      resetStoreForm();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Не удалось обновить магазин"),
  });

  const resetZoneForm = () => {
    setEditingZoneId(null);
    setZoneName("");
    setZoneCityId("");
    setZoneNameDraft(null);
  };

  const createZoneMutation = useMutation({
    mutationFn: createDeliveryZone,
    onSuccess: () => {
      invalidateZones();
      toast.success("Зона создана");
      resetZoneForm();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Не удалось создать зону"),
  });

  const updateZoneMutation = useMutation({
    mutationFn: updateDeliveryZone,
    onSuccess: () => {
      invalidateZones();
      toast.success("Зона обновлена");
      resetZoneForm();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Не удалось обновить зону"),
  });

  const deactivateZoneMutation = useMutation({
    mutationFn: deactivateDeliveryZone,
    onSuccess: () => {
      invalidateZones();
      toast.success("Зона деактивирована");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Не удалось деактивировать зону"),
  });

  const resetTariffForm = () => {
    setEditingTariffId(null);
    setTariffName("");
    setTariffZoneId("");
    setTariffType("STANDARD");
    setTariffPricingModel("FIXED");
    setTariffBasePrice("");
    setTariffFreeFrom("");
    setTariffEtaMin("");
    setTariffEtaMax("");
    setEtaDraft(null);
  };

  const createTariffMutation = useMutation({
    mutationFn: createDeliveryTariff,
    onSuccess: () => {
      invalidateTariffs();
      toast.success("Тариф создан");
      resetTariffForm();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Не удалось создать тариф"),
  });

  const updateTariffMutation = useMutation({
    mutationFn: updateDeliveryTariff,
    onSuccess: () => {
      invalidateTariffs();
      toast.success("Тариф обновлён");
      resetTariffForm();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Не удалось обновить тариф"),
  });

  const previewMutation = useMutation({
    mutationFn: previewDeliveryFee,
    onError: (e) => toast.error(e instanceof Error ? e.message : "Не удалось рассчитать стоимость"),
  });

  const handleSignIn = async () => {
    await signInWithGoogle();
  };

  const openEditStore = (store: StoreDTO) => {
    setEditingStoreId(store.id);
    setStoreName(store.name);
    setStoreCityId(store.cityId);
    setStoreAddress(store.address);
    setStoreLat(store.lat != null ? String(store.lat) : "");
    setStoreLng(store.lng != null ? String(store.lng) : "");
  };

  const handleStoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim() || storeName.trim().length < 2) {
      toast.error("Название магазина должно содержать минимум 2 символа");
      return;
    }
    if (!storeCityId) {
      toast.error("Выберите город");
      return;
    }
    if (!storeAddress.trim()) {
      toast.error("Укажите адрес");
      return;
    }
    const lat = storeLat.trim() ? Number(storeLat) : null;
    const lng = storeLng.trim() ? Number(storeLng) : null;
    if ((storeLat.trim() && !Number.isFinite(lat)) || (storeLng.trim() && !Number.isFinite(lng))) {
      toast.error("Координаты должны быть числами");
      return;
    }
    const payload = {
      cityId: storeCityId,
      name: storeName.trim(),
      address: storeAddress.trim(),
      lat,
      lng,
    };
    if (editingStoreId) {
      updateStoreMutation.mutate({ id: editingStoreId, ...payload });
      return;
    }
    createStoreMutation.mutate(payload);
  };

  const openEditZone = (zone: DeliveryZoneDTO) => {
    setEditingZoneId(zone.id);
    setZoneName(zone.name);
    setZoneCityId(zone.cityId);
  };

  const handleZoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!zoneName.trim() || zoneName.trim().length < 2) {
      toast.error("Название зоны должно содержать минимум 2 символа");
      return;
    }
    if (!zoneCityId) {
      toast.error("Выберите город");
      return;
    }
    if (editingZoneId) {
      updateZoneMutation.mutate({ id: editingZoneId, cityId: zoneCityId, name: zoneName.trim() });
      return;
    }
    createZoneMutation.mutate({ cityId: zoneCityId, name: zoneName.trim() });
  };

  const openEditTariff = (tariff: DeliveryTariffDTO) => {
    setEditingTariffId(tariff.id);
    setTariffName(tariff.name);
    setTariffZoneId(tariff.zoneId ?? "");
    setTariffType(tariff.tariffType);
    setTariffPricingModel(tariff.pricingModel);
    setTariffBasePrice(String(tariff.basePrice));
    setTariffFreeFrom(
      tariff.minOrderForFreeDelivery != null ? String(tariff.minOrderForFreeDelivery) : "",
    );
    setTariffEtaMin(tariff.etaMinMinutes != null ? String(tariff.etaMinMinutes) : "");
    setTariffEtaMax(tariff.etaMaxMinutes != null ? String(tariff.etaMaxMinutes) : "");
  };

  const handleTariffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const basePrice = Number(tariffBasePrice);
    if (!tariffName.trim() || tariffName.trim().length < 2) {
      toast.error("Название тарифа должно содержать минимум 2 символа");
      return;
    }
    if (!Number.isFinite(basePrice) || basePrice < 0) {
      toast.error("Укажите базовую стоимость");
      return;
    }
    const payload = {
      zoneId: tariffZoneId || null,
      name: tariffName.trim(),
      tariffType,
      pricingModel: tariffPricingModel,
      basePrice,
      minOrderForFreeDelivery: tariffFreeFrom ? Number(tariffFreeFrom) : null,
      etaMinMinutes: tariffEtaMin ? Number(tariffEtaMin) : null,
      etaMaxMinutes: tariffEtaMax ? Number(tariffEtaMax) : null,
    };
    if (editingTariffId) {
      updateTariffMutation.mutate({ id: editingTariffId, ...payload });
      return;
    }
    createTariffMutation.mutate(payload);
  };

  const handlePreview = (e: React.FormEvent) => {
    e.preventDefault();
    const subtotal = Number(previewSubtotal);
    if (!previewZoneId) {
      toast.error("Выберите зону");
      return;
    }
    if (!Number.isFinite(subtotal) || subtotal < 0) {
      toast.error("Укажите сумму заказа");
      return;
    }
    previewMutation.mutate({
      zoneId: previewZoneId,
      subtotal,
      ...(previewDate ? { orderDate: new Date(previewDate).toISOString() } : {}),
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
          <h1 className="font-serif text-3xl tracking-tight">Доставка</h1>
          <p className="mt-3 text-muted-foreground">Войдите с учётной записью администратора.</p>
          <Button size="lg" className="mt-6 h-12 rounded-full" onClick={() => void handleSignIn()}>
            Войти
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const isLoading =
    zonesQuery.isLoading ||
    tariffsQuery.isLoading ||
    citiesQuery.isLoading ||
    storesQuery.isLoading;
  const queryError =
    zonesQuery.error ?? tariffsQuery.error ?? citiesQuery.error ?? storesQuery.error;

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  if (queryError) {
    const message =
      queryError instanceof Error ? queryError.message : "Не удалось загрузить данные";
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
            <p className="text-muted-foreground">{message}</p>
          )}
        </div>
      </AdminLayout>
    );
  }

  const cities = citiesQuery.data ?? [];
  const stores = storesQuery.data ?? [];
  const zones = zonesQuery.data ?? [];
  const tariffs = tariffsQuery.data ?? [];
  const cityName = (id: string) => cities.find((c) => c.id === id)?.name ?? id;
  const zoneName2 = (id: string | null) =>
    id ? (zones.find((z) => z.id === id)?.name ?? id) : "Все зоны";

  // Задача №295 — with exactly one city / active zone / tariff (and at most
  // one dispatch point) the screen shows plain cards; any second one brings
  // the full list interface back by itself. "Расширенные настройки" lets the
  // owner open the full interface on demand.
  const simple = deriveSimpleDeliverySetup({ cities, stores, zones, tariffs });
  const simpleView = simple !== null && !showAdvanced;

  const handleSimpleZoneSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simple) return;
    const name = (zoneNameDraft ?? simple.zone.name).trim();
    if (name.length < 2) {
      toast.error("Название зоны должно содержать минимум 2 символа");
      return;
    }
    updateZoneMutation.mutate({ id: simple.zone.id, cityId: simple.zone.cityId, name });
  };

  const simpleEta = simple
    ? (etaDraft ?? {
        min: simple.tariff.etaMinMinutes != null ? String(simple.tariff.etaMinMinutes) : "",
        max: simple.tariff.etaMaxMinutes != null ? String(simple.tariff.etaMaxMinutes) : "",
      })
    : { min: "", max: "" };

  const handleSimpleEtaSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simple) return;
    const min = simpleEta.min.trim();
    const max = simpleEta.max.trim();
    if ((min === "") !== (max === "")) {
      toast.error("Укажите время «от» и «до» или оставьте оба поля пустыми");
      return;
    }
    if (min !== "" && (!Number.isFinite(Number(min)) || !Number.isFinite(Number(max)))) {
      toast.error("Время должно быть числом");
      return;
    }
    if (min !== "" && Number(min) > Number(max)) {
      toast.error("Время «от» не может быть больше «до»");
      return;
    }
    updateTariffMutation.mutate({
      id: simple.tariff.id,
      etaMinMinutes: min === "" ? null : Number(min),
      etaMaxMinutes: max === "" ? null : Number(max),
    });
  };

  const simpleStore = storeDraft ?? {
    name: simple?.store?.name ?? "",
    address: simple?.store?.address ?? "",
    lat: simple?.store?.lat != null ? String(simple.store.lat) : "",
    lng: simple?.store?.lng != null ? String(simple.store.lng) : "",
  };

  const handleSimpleStoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simple) return;
    if (simpleStore.name.trim().length < 2) {
      toast.error("Название должно содержать минимум 2 символа");
      return;
    }
    if (!simpleStore.address.trim()) {
      toast.error("Укажите адрес");
      return;
    }
    const lat = simpleStore.lat.trim() ? Number(simpleStore.lat) : null;
    const lng = simpleStore.lng.trim() ? Number(simpleStore.lng) : null;
    if (
      (simpleStore.lat.trim() && !Number.isFinite(lat)) ||
      (simpleStore.lng.trim() && !Number.isFinite(lng))
    ) {
      toast.error("Координаты должны быть числами");
      return;
    }
    const payload = {
      cityId: simple.city.id,
      name: simpleStore.name.trim(),
      address: simpleStore.address.trim(),
      lat,
      lng,
    };
    if (simple.store) {
      updateStoreMutation.mutate({ id: simple.store.id, ...payload });
      return;
    }
    createStoreMutation.mutate(payload);
  };

  const handleSimplePreview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simple) return;
    const subtotal = Number(previewSubtotal);
    if (!Number.isFinite(subtotal) || subtotal < 0) {
      toast.error("Укажите сумму заказа");
      return;
    }
    previewMutation.mutate({ zoneId: simple.zone.id, subtotal });
  };

  return (
    <AdminLayout>
      <div className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="font-serif text-4xl tracking-tight">Доставка</h1>
        <p className="mt-2 text-muted-foreground">
          Куда и как вы доставляете заказы: зона, стоимость и время доставки.
        </p>

        {simple && simpleView ? (
          <>
            {/* Куда доставляем */}
            <section className="mt-8 rounded-2xl border border-border/60 bg-card p-6">
              <h2 className="font-serif text-2xl mb-1">Куда доставляем</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Зона, в которую вы принимаете заказы.
              </p>
              <form
                onSubmit={handleSimpleZoneSave}
                className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end"
              >
                <div className="grid gap-2">
                  <Label htmlFor="simple-zone-name">Название зоны</Label>
                  <Input
                    id="simple-zone-name"
                    value={zoneNameDraft ?? simple.zone.name}
                    onChange={(e) => setZoneNameDraft(e.target.value)}
                  />
                </div>
                <Button
                  type="submit"
                  className="h-12 rounded-full"
                  disabled={updateZoneMutation.isPending}
                >
                  {updateZoneMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Сохранить"
                  )}
                </Button>
              </form>
              <p className="mt-3 text-xs text-muted-foreground">
                Город: {simple.city.name} · Доставка в эту зону включена
                {simple.hiddenInactiveZones > 0 &&
                  ` · выключенных зон: ${simple.hiddenInactiveZones} (они видны в расширенных настройках)`}
              </p>
            </section>

            {/* Стоимость доставки */}
            <section className="mt-6 rounded-2xl border border-border/60 bg-card p-6">
              <h2 className="font-serif text-2xl mb-3">Стоимость доставки</h2>
              <ul className="space-y-1 text-sm">
                <li>
                  Заказ весом до {DELIVERY_WEIGHT_RULE.includedKg} кг —{" "}
                  <strong>{DELIVERY_WEIGHT_RULE.baseFee} сом</strong>.
                </li>
                <li>
                  За каждый следующий килограмм —{" "}
                  <strong>+{extraFeePerKg(simple.tariff)} сом</strong>.
                </li>
              </ul>
              <p className="mt-2 text-xs text-muted-foreground">
                Стоимость считается автоматически по весу товаров в заказе. Цифры{" "}
                {DELIVERY_WEIGHT_RULE.baseFee} сом и {DELIVERY_WEIGHT_RULE.includedKg} кг заданы в
                системе — чтобы их изменить, обратитесь к разработчику.
              </p>

              <form onSubmit={handleSimpleEtaSave} className="mt-5 border-t border-border/60 pt-5">
                <Label htmlFor="simple-eta-min">Время доставки, минут</Label>
                <div className="mt-2 flex flex-wrap items-end gap-3">
                  <div className="grid gap-1">
                    <span className="text-xs text-muted-foreground">от</span>
                    <Input
                      id="simple-eta-min"
                      type="number"
                      min={0}
                      className="w-24"
                      value={simpleEta.min}
                      onChange={(e) => setEtaDraft({ ...simpleEta, min: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-1">
                    <span className="text-xs text-muted-foreground">до</span>
                    <Input
                      id="simple-eta-max"
                      type="number"
                      min={0}
                      aria-label="Время доставки до, минут"
                      className="w-24"
                      value={simpleEta.max}
                      onChange={(e) => setEtaDraft({ ...simpleEta, max: e.target.value })}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="h-12 rounded-full"
                    disabled={updateTariffMutation.isPending}
                  >
                    {updateTariffMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Сохранить"
                    )}
                  </Button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Покупатель видит это время в корзине. Поля можно оставить пустыми.
                </p>
              </form>
            </section>

            {/* Откуда доставляем — collapsed by default; the data is kept for
                the future distance-based pricing. */}
            <details className="group mt-6 rounded-2xl border border-border/60 bg-card">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-6 [&::-webkit-details-marker]:hidden">
                <span className="font-serif text-2xl">Откуда доставляем</span>
                <span className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
                  <span className="truncate">
                    {simple.store ? `${simple.store.name} · ${simple.store.address}` : "не указано"}
                  </span>
                  <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" />
                </span>
              </summary>
              <form
                onSubmit={handleSimpleStoreSubmit}
                className="grid gap-4 border-t border-border/60 p-6 sm:grid-cols-2"
              >
                <p className="text-sm text-muted-foreground sm:col-span-2">
                  Склад или магазин, откуда вы отправляете заказы. Сейчас эти данные только
                  хранятся; когда стоимость начнёт считаться по расстоянию, по ним будет
                  определяться путь до покупателя.
                </p>
                <div className="grid gap-2">
                  <Label htmlFor="simple-store-name">Название</Label>
                  <Input
                    id="simple-store-name"
                    value={simpleStore.name}
                    onChange={(e) => setStoreDraft({ ...simpleStore, name: e.target.value })}
                    placeholder="Склад на базаре"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="simple-store-address">Адрес</Label>
                  <Input
                    id="simple-store-address"
                    value={simpleStore.address}
                    onChange={(e) => setStoreDraft({ ...simpleStore, address: e.target.value })}
                    placeholder="Кант, базар"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="simple-store-lat">Широта (необязательно)</Label>
                  <Input
                    id="simple-store-lat"
                    type="number"
                    step="0.000001"
                    value={simpleStore.lat}
                    onChange={(e) => setStoreDraft({ ...simpleStore, lat: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="simple-store-lng">Долгота (необязательно)</Label>
                  <Input
                    id="simple-store-lng"
                    type="number"
                    step="0.000001"
                    value={simpleStore.lng}
                    onChange={(e) => setStoreDraft({ ...simpleStore, lng: e.target.value })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Button
                    type="submit"
                    className="h-12 rounded-full"
                    disabled={createStoreMutation.isPending || updateStoreMutation.isPending}
                  >
                    {createStoreMutation.isPending || updateStoreMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Сохранить"
                    )}
                  </Button>
                </div>
              </form>
            </details>

            {/* Проверить стоимость — a secondary tool, collapsed at the bottom */}
            <details className="group mt-6 rounded-2xl border border-border/60 bg-card">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-6 [&::-webkit-details-marker]:hidden">
                <span className="flex items-center gap-2 font-serif text-2xl">
                  <Calculator className="h-5 w-5" /> Проверить стоимость доставки
                </span>
                <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" />
              </summary>
              <div className="border-t border-border/60 p-6">
                <form
                  onSubmit={handleSimplePreview}
                  className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end"
                >
                  <div className="grid gap-2">
                    <Label htmlFor="simple-preview-subtotal">Сумма заказа, сом</Label>
                    <Input
                      id="simple-preview-subtotal"
                      type="number"
                      min={0}
                      value={previewSubtotal}
                      onChange={(e) => setPreviewSubtotal(e.target.value)}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="h-12 rounded-full"
                    disabled={previewMutation.isPending}
                  >
                    {previewMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Проверить"
                    )}
                  </Button>
                </form>
                {previewMutation.data && (
                  <div className="mt-4 rounded-xl border border-border/60 bg-card p-4 text-sm">
                    <p>
                      Стоимость доставки:{" "}
                      <strong>
                        {previewMutation.data.isFree
                          ? "Бесплатно"
                          : `${previewMutation.data.fee} сом`}
                      </strong>
                    </p>
                    {previewMutation.data.eta.minMinutes != null && (
                      <p>
                        Время доставки: {previewMutation.data.eta.minMinutes}–
                        {previewMutation.data.eta.maxMinutes} мин
                      </p>
                    )}
                  </div>
                )}
                <p className="mt-3 text-xs text-muted-foreground">
                  Показана стоимость для заказа до {DELIVERY_WEIGHT_RULE.includedKg} кг. Доплата за
                  вес добавляется при оформлении заказа — по реальному весу товаров.
                </p>
              </div>
            </details>

            {/* Как это работает — plain-language replacement for the rule overview */}
            <details className="group mt-6 rounded-2xl border border-border/60 bg-card">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-6 [&::-webkit-details-marker]:hidden">
                <span className="font-serif text-2xl">Как это работает</span>
                <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" />
              </summary>
              <ul className="list-disc space-y-2 border-t border-border/60 p-6 pl-10 text-sm text-muted-foreground">
                <li>Если зона выключена, доставка в неё недоступна.</li>
                <li>
                  Если у тарифа задана минимальная сумма заказа, заказ на меньшую сумму не
                  принимается.
                </li>
                <li>
                  Обычно действует стандартный тариф. Праздничные, акционные и корпоративные тарифы
                  включаются сами: в свои даты или для своих клиентов.
                </li>
              </ul>
            </details>

            <div className="mt-8 text-center">
              <Button
                variant="ghost"
                className="rounded-full"
                onClick={() => setShowAdvanced(true)}
              >
                Расширенные настройки
              </Button>
              <p className="mt-1 text-xs text-muted-foreground">
                Если понадобится несколько зон, тарифов или складов
              </p>
            </div>
          </>
        ) : (
          <>
            {simple && (
              <Button
                variant="ghost"
                className="mt-4 -ml-3 rounded-full"
                onClick={() => setShowAdvanced(false)}
              >
                ← Вернуться к простому виду
              </Button>
            )}

            {/* Stores — Подэтап 0 (delivery-future-roadmap.md): origin point for
            BY_DISTANCE. Координаты не используются в расчёте стоимости пока
            не подключён провайдер геокодирования — это только хранение. */}
            <section className="mt-8 rounded-2xl border border-border/60 bg-card p-6">
              <h2 className="font-serif text-2xl mb-4">Откуда доставляем (склады и магазины)</h2>
              {stores.length === 0 ? (
                <div className="py-6 text-center">
                  <StoreIcon className="h-6 w-6 text-primary mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    Пока не указано, откуда вы отправляете заказы.
                  </p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {stores.map((store) => (
                    <li
                      key={store.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/60 bg-card px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="font-medium truncate">{store.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {cityName(store.cityId)} · {store.address}
                          {store.lat != null &&
                            store.lng != null &&
                            ` · ${store.lat}, ${store.lng}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEditStore(store)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={updateStoreMutation.isPending}
                          onClick={() =>
                            updateStoreMutation.mutate({ id: store.id, isActive: !store.isActive })
                          }
                        >
                          <Badge variant={store.isActive ? "secondary" : "outline"}>
                            {store.isActive ? "Активен" : "Выключен"}
                          </Badge>
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <form onSubmit={handleStoreSubmit} className="mt-6 grid gap-4 sm:grid-cols-3">
                {editingStoreId && (
                  <p className="sm:col-span-3 text-sm text-muted-foreground">
                    Редактирование магазина
                  </p>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="store-name">Название</Label>
                  <Input
                    id="store-name"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="Склад на Токтогула"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="store-city">Город</Label>
                  <select
                    id="store-city"
                    value={storeCityId}
                    onChange={(e) => setStoreCityId(e.target.value)}
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">Выберите город</option>
                    {cities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="store-address">Адрес</Label>
                  <Input
                    id="store-address"
                    value={storeAddress}
                    onChange={(e) => setStoreAddress(e.target.value)}
                    placeholder="ул. Токтогула, 1"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="store-lat">Широта (необязательно)</Label>
                  <Input
                    id="store-lat"
                    type="number"
                    step="0.000001"
                    value={storeLat}
                    onChange={(e) => setStoreLat(e.target.value)}
                    placeholder="42.874621"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="store-lng">Долгота (необязательно)</Label>
                  <Input
                    id="store-lng"
                    type="number"
                    step="0.000001"
                    value={storeLng}
                    onChange={(e) => setStoreLng(e.target.value)}
                    placeholder="74.596824"
                  />
                </div>
                <div className="flex gap-2 sm:items-end">
                  <Button
                    type="submit"
                    className="h-12 rounded-full"
                    disabled={createStoreMutation.isPending || updateStoreMutation.isPending}
                  >
                    {createStoreMutation.isPending || updateStoreMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : editingStoreId ? (
                      "Сохранить изменения"
                    ) : (
                      "Создать магазин"
                    )}
                  </Button>
                  {editingStoreId && (
                    <Button
                      type="button"
                      variant="outline"
                      className="h-12 rounded-full"
                      onClick={resetStoreForm}
                    >
                      Отмена
                    </Button>
                  )}
                </div>
              </form>
            </section>

            {/* Zones */}
            <section className="mt-6 rounded-2xl border border-border/60 bg-card p-6">
              <h2 className="font-serif text-2xl mb-4">Куда доставляем (зоны)</h2>
              {zones.length === 0 ? (
                <div className="py-6 text-center">
                  <MapPinned className="h-6 w-6 text-primary mx-auto mb-3" />
                  <p className="text-muted-foreground">Зон пока нет.</p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {zones.map((zone) => (
                    <li
                      key={zone.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/60 bg-card px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="font-medium truncate">{zone.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {cityName(zone.cityId)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEditZone(zone)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={updateZoneMutation.isPending}
                          onClick={() =>
                            updateZoneMutation.mutate({ id: zone.id, isActive: !zone.isActive })
                          }
                        >
                          <Badge variant={zone.isActive ? "secondary" : "outline"}>
                            {zone.isActive ? "Активна" : "Выключена"}
                          </Badge>
                        </Button>
                        {zone.isActive && (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={deactivateZoneMutation.isPending}
                            onClick={() => deactivateZoneMutation.mutate(zone.id)}
                          >
                            Удалить
                          </Button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <form
                onSubmit={handleZoneSubmit}
                className="mt-6 grid gap-4 sm:grid-cols-3 sm:items-end"
              >
                {editingZoneId && (
                  <p className="sm:col-span-3 text-sm text-muted-foreground">Редактирование зоны</p>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="zone-name">Название зоны</Label>
                  <Input
                    id="zone-name"
                    value={zoneName}
                    onChange={(e) => setZoneName(e.target.value)}
                    placeholder="Центр"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="zone-city">Город</Label>
                  <select
                    id="zone-city"
                    value={zoneCityId}
                    onChange={(e) => setZoneCityId(e.target.value)}
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">Выберите город</option>
                    {cities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    className="h-12 rounded-full"
                    disabled={createZoneMutation.isPending || updateZoneMutation.isPending}
                  >
                    {createZoneMutation.isPending || updateZoneMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : editingZoneId ? (
                      "Сохранить изменения"
                    ) : (
                      "Создать зону"
                    )}
                  </Button>
                  {editingZoneId && (
                    <Button
                      type="button"
                      variant="outline"
                      className="h-12 rounded-full"
                      onClick={resetZoneForm}
                    >
                      Отмена
                    </Button>
                  )}
                </div>
              </form>
            </section>

            {/* Tariffs */}
            <section className="mt-6 rounded-2xl border border-border/60 bg-card p-6">
              <h2 className="font-serif text-2xl mb-2">Стоимость доставки (тарифы)</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Сейчас цена доставки считается по весу заказа. Поля «Базовая стоимость» и «Бесплатно
                от» сохраняются, но в расчёте не участвуют; время доставки покупатель видит в
                корзине.
              </p>
              {tariffs.length === 0 ? (
                <p className="text-muted-foreground py-4 text-center">Тарифов пока нет.</p>
              ) : (
                <ul className="space-y-2">
                  {tariffs.map((tariff) => (
                    <li
                      key={tariff.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/60 bg-card px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="font-medium truncate">
                          {tariff.name}{" "}
                          <span className="text-xs text-muted-foreground">
                            ({TARIFF_TYPE_LABEL[tariff.tariffType]},{" "}
                            {PRICING_MODEL_LABEL[tariff.pricingModel]})
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {zoneName2(tariff.zoneId)} · базовая {tariff.basePrice} сом
                          {tariff.minOrderForFreeDelivery != null &&
                            ` · бесплатно от ${tariff.minOrderForFreeDelivery}`}
                          {tariff.etaMinMinutes != null &&
                            ` · время доставки ${tariff.etaMinMinutes}–${tariff.etaMaxMinutes} мин`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEditTariff(tariff)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={updateTariffMutation.isPending}
                          onClick={() =>
                            updateTariffMutation.mutate({
                              id: tariff.id,
                              isActive: !tariff.isActive,
                            })
                          }
                        >
                          <Badge variant={tariff.isActive ? "secondary" : "outline"}>
                            {tariff.isActive ? "Активен" : "Выключен"}
                          </Badge>
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <form onSubmit={handleTariffSubmit} className="mt-6 grid gap-4 sm:grid-cols-3">
                {editingTariffId && (
                  <p className="sm:col-span-3 text-sm text-muted-foreground">
                    Редактирование тарифа
                  </p>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="tariff-name">Название</Label>
                  <Input
                    id="tariff-name"
                    value={tariffName}
                    onChange={(e) => setTariffName(e.target.value)}
                    placeholder="Стандартный"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tariff-zone">Зона</Label>
                  <select
                    id="tariff-zone"
                    value={tariffZoneId}
                    onChange={(e) => setTariffZoneId(e.target.value)}
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">Все зоны (по умолчанию)</option>
                    {zones.map((zone) => (
                      <option key={zone.id} value={zone.id}>
                        {zone.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tariff-type">Тип тарифа</Label>
                  <select
                    id="tariff-type"
                    value={tariffType}
                    onChange={(e) => setTariffType(e.target.value as DeliveryTariffType)}
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {Object.entries(TARIFF_TYPE_LABEL).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tariff-pricing-model">Способ расчёта</Label>
                  <select
                    id="tariff-pricing-model"
                    value={tariffPricingModel}
                    onChange={(e) => setTariffPricingModel(e.target.value as DeliveryPricingModel)}
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {Object.entries(PRICING_MODEL_LABEL).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tariff-base-price">Базовая стоимость</Label>
                  <Input
                    id="tariff-base-price"
                    type="number"
                    min={0}
                    value={tariffBasePrice}
                    onChange={(e) => setTariffBasePrice(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tariff-free-from">Бесплатно от (сумма)</Label>
                  <Input
                    id="tariff-free-from"
                    type="number"
                    min={0}
                    value={tariffFreeFrom}
                    onChange={(e) => setTariffFreeFrom(e.target.value)}
                    placeholder="Необязательно"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tariff-eta-min">Время доставки от, мин.</Label>
                  <Input
                    id="tariff-eta-min"
                    type="number"
                    min={0}
                    value={tariffEtaMin}
                    onChange={(e) => setTariffEtaMin(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tariff-eta-max">Время доставки до, мин.</Label>
                  <Input
                    id="tariff-eta-max"
                    type="number"
                    min={0}
                    value={tariffEtaMax}
                    onChange={(e) => setTariffEtaMax(e.target.value)}
                  />
                </div>
                <div className="flex gap-2 sm:col-span-3">
                  <Button
                    type="submit"
                    className="h-12 rounded-full"
                    disabled={createTariffMutation.isPending || updateTariffMutation.isPending}
                  >
                    {createTariffMutation.isPending || updateTariffMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : editingTariffId ? (
                      "Сохранить изменения"
                    ) : (
                      "Создать тариф"
                    )}
                  </Button>
                  {editingTariffId && (
                    <Button
                      type="button"
                      variant="outline"
                      className="h-12 rounded-full"
                      onClick={resetTariffForm}
                    >
                      Отмена
                    </Button>
                  )}
                </div>
              </form>
            </section>

            {/* Rule Engine — read-only overview (Задача №295: worded for the owner) */}
            <section className="mt-6 rounded-2xl border border-border/60 bg-card p-6">
              <h2 className="font-serif text-2xl mb-2">Как выбирается доставка (справка)</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Проверки выполняются в этом порядке, сверху вниз. Здесь они показаны только для
                справки: менять их нельзя.
              </p>
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <h3 className="font-medium mb-2">Можно ли доставить</h3>
                  <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
                    {ZONE_POLICY_RULES.map((rule) => (
                      <li key={rule.name}>
                        <span className="text-foreground">{rule.name}</span>: {rule.note}
                      </li>
                    ))}
                  </ol>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Какой тариф применить</h3>
                  <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
                    {TARIFF_POLICY_RULES.map((rule) => (
                      <li key={rule.name}>
                        <span className="text-foreground">{rule.name}</span>: {rule.note}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </section>

            {/* Preview calculator */}
            <section className="mt-6 rounded-2xl border border-border/60 bg-card p-6">
              <h2 className="font-serif text-2xl mb-4 flex items-center gap-2">
                <Calculator className="h-5 w-5" /> Проверить стоимость доставки
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Показана стоимость для заказа до {DELIVERY_WEIGHT_RULE.includedKg} кг. Доплата за
                вес добавляется при оформлении заказа — по реальному весу товаров.
              </p>
              <form onSubmit={handlePreview} className="grid gap-4 sm:grid-cols-4 sm:items-end">
                <div className="grid gap-2">
                  <Label htmlFor="preview-zone">Зона</Label>
                  <select
                    id="preview-zone"
                    value={previewZoneId}
                    onChange={(e) => setPreviewZoneId(e.target.value)}
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">Выберите зону</option>
                    {zones.map((zone) => (
                      <option key={zone.id} value={zone.id}>
                        {zone.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="preview-subtotal">Сумма заказа</Label>
                  <Input
                    id="preview-subtotal"
                    type="number"
                    min={0}
                    value={previewSubtotal}
                    onChange={(e) => setPreviewSubtotal(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="preview-date">
                    Дата заказа (для праздничных и акционных тарифов)
                  </Label>
                  <Input
                    id="preview-date"
                    type="date"
                    value={previewDate}
                    onChange={(e) => setPreviewDate(e.target.value)}
                  />
                </div>
                <Button
                  type="submit"
                  className="h-12 rounded-full"
                  disabled={previewMutation.isPending}
                >
                  {previewMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Проверить"
                  )}
                </Button>
              </form>

              {previewMutation.data && (
                <div className="mt-4 rounded-xl border border-border/60 bg-card p-4 text-sm">
                  <p>
                    Применён тариф: <strong>{previewMutation.data.tariffName}</strong>
                  </p>
                  <p>
                    Стоимость доставки:{" "}
                    <strong>
                      {previewMutation.data.isFree
                        ? "Бесплатно"
                        : `${previewMutation.data.fee} сом`}
                    </strong>
                  </p>
                  {previewMutation.data.eta.minMinutes != null && (
                    <p>
                      Время доставки: {previewMutation.data.eta.minMinutes}–
                      {previewMutation.data.eta.maxMinutes} мин
                    </p>
                  )}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
