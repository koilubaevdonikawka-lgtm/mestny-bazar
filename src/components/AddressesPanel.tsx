import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createAddress,
  deleteAddress,
  listAddresses,
  setDefaultAddress,
  updateAddress,
} from "@/api/addresses";
import { listDeliveryZones } from "@/api/delivery-zone";
import type { AddressDTO, DeliveryZoneDTO } from "@shared/contracts/delivery";
import { Loader2, MapPin, Pencil, Plus, Star, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/i18n/LanguageProvider";
import type { TranslationKey } from "@/i18n/t";
import { LocationPickerDialog } from "@/components/checkout/LocationPickerDialog";

type AddressFormState = {
  label: string;
  fullAddress: string;
  city: string;
  district: string;
  notes: string;
  zoneId: string;
  isDefault: boolean;
  latitude: number | null;
  longitude: number | null;
};

const emptyForm = (): AddressFormState => ({
  label: "",
  fullAddress: "",
  city: "",
  district: "",
  notes: "",
  zoneId: "",
  isDefault: false,
  latitude: null,
  longitude: null,
});

/**
 * Задача №188 — the actual field set, shared by both the "new address" form
 * (above the list) and a single address row's inline edit form (the
 * Редактировать/Сохранить toggle below) so the fields aren't duplicated
 * between the two call sites.
 */
function AddressFormFields({
  form,
  setForm,
  onCancel,
  isSaving,
  submitLabel,
  deliveryZones,
  onOpenMapDialog,
  t,
}: {
  form: AddressFormState;
  setForm: (updater: (prev: AddressFormState) => AddressFormState) => void;
  onCancel: () => void;
  isSaving: boolean;
  submitLabel: string;
  deliveryZones: DeliveryZoneDTO[] | undefined;
  onOpenMapDialog: () => void;
  t: (key: TranslationKey) => string;
}) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="label">{t("addresses.labelField")}</Label>
          <Input
            id="label"
            placeholder={t("addresses.labelPlaceholder")}
            value={form.label}
            onChange={(e) => setForm((prev) => ({ ...prev, label: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">{t("addresses.cityField")}</Label>
          <Input
            id="city"
            value={form.city}
            onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="fullAddress">{t("addresses.fullAddressField")}</Label>
        <Textarea
          id="fullAddress"
          required
          rows={3}
          value={form.fullAddress}
          onChange={(e) => setForm((prev) => ({ ...prev, fullAddress: e.target.value }))}
        />
        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" variant="outline" size="sm" onClick={onOpenMapDialog}>
            <MapPin className="h-3.5 w-3.5 mr-1" />
            {t("addresses.pickOnMapButton")}
          </Button>
          {form.latitude != null && form.longitude != null && (
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              {t("addresses.mapPointSet")}
              <button
                type="button"
                aria-label={t("addresses.mapPointClear")}
                onClick={() => setForm((prev) => ({ ...prev, latitude: null, longitude: null }))}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          )}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="district">{t("addresses.districtField")}</Label>
          <Input
            id="district"
            value={form.district}
            onChange={(e) => setForm((prev) => ({ ...prev, district: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes">{t("addresses.notesField")}</Label>
          <Input
            id="notes"
            placeholder={t("addresses.notesPlaceholder")}
            value={form.notes}
            onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="zone">{t("home.deliveryZoneLabel")}</Label>
        <select
          id="zone"
          value={form.zoneId}
          onChange={(e) => setForm((prev) => ({ ...prev, zoneId: e.target.value }))}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">{t("home.zoneNotSelected")}</option>
          {(deliveryZones ?? []).map((zone) => (
            <option key={zone.id} value={zone.id}>
              {zone.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground">{t("addresses.zoneHint")}</p>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.isDefault}
          onChange={(e) => setForm((prev) => ({ ...prev, isDefault: e.target.checked }))}
        />
        {t("addresses.useAsDefaultLabel")}
      </label>
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : submitLabel}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          {t("common.cancel")}
        </Button>
      </div>
    </>
  );
}

/**
 * The actual address list/create/edit/delete feature — no auth-gate of its
 * own (assumes the caller only mounts this once isAuthenticated === true,
 * same as /profile/addresses.tsx already did before this extraction and
 * the new /profile hub page both do now). Extracted so both routes share
 * one implementation instead of duplicating the CRUD logic (same pattern
 * as CartPanel for /cart + CartDrawer's Sheet).
 */
export function AddressesPanel() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<AddressFormState>(emptyForm);
  const [mapDialogOpen, setMapDialogOpen] = useState(false);

  const {
    data: addresses = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["addresses", "list"],
    queryFn: listAddresses,
    retry: false,
  });

  const { data: deliveryZones } = useQuery({
    queryKey: ["delivery", "zones"],
    queryFn: listDeliveryZones,
    staleTime: 5 * 60 * 1000,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["addresses", "list"] });

  const createMutation = useMutation({
    mutationFn: createAddress,
    onSuccess: () => {
      invalidate();
      resetForm();
      toast.success(t("addresses.createdToast"));
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : t("addresses.createError")),
  });

  const updateMutation = useMutation({
    mutationFn: updateAddress,
    onSuccess: () => {
      invalidate();
      resetForm();
      toast.success(t("addresses.updatedToast"));
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : t("addresses.updateError")),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAddress,
    onSuccess: () => {
      invalidate();
      toast.success(t("addresses.deletedToast"));
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : t("addresses.deleteError")),
  });

  const defaultMutation = useMutation({
    mutationFn: setDefaultAddress,
    onSuccess: () => {
      invalidate();
      toast.success(t("addresses.defaultUpdatedToast"));
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : t("addresses.setDefaultError")),
  });

  const resetForm = () => {
    setEditingId(null);
    setShowForm(false);
    setForm(emptyForm());
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm(), isDefault: addresses.length === 0 });
    setShowForm(true);
  };

  const openEdit = (address: AddressDTO) => {
    setEditingId(address.id);
    setForm({
      label: address.label ?? "",
      fullAddress: address.fullAddress,
      city: address.city ?? "",
      district: address.district ?? "",
      notes: address.notes ?? "",
      zoneId: address.zoneId ?? "",
      isDefault: address.isDefault,
      latitude: address.latitude,
      longitude: address.longitude,
    });
    setShowForm(true);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const payload = {
      label: form.label.trim() || undefined,
      fullAddress: form.fullAddress.trim(),
      city: form.city.trim() || undefined,
      district: form.district.trim() || undefined,
      notes: form.notes.trim() || undefined,
      zoneId: form.zoneId || undefined,
      isDefault: form.isDefault,
      latitude: form.latitude,
      longitude: form.longitude,
    };

    if (payload.fullAddress.length < 5) {
      toast.error(t("addresses.tooShortError"));
      return;
    }

    if (editingId) {
      updateMutation.mutate({ id: editingId, ...payload });
      return;
    }
    createMutation.mutate(payload);
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    const message = error instanceof Error ? error.message : t("addresses.loadError");
    return (
      <div className="max-w-md mx-auto text-center py-24">
        <p className="text-muted-foreground">{message}</p>
        <Button size="lg" className="mt-6 h-12 rounded-full" onClick={() => void refetch()}>
          {t("common.retry")}
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl tracking-tight">{t("addresses.title")}</h1>
          <p className="mt-2 text-muted-foreground">{t("addresses.subtitle")}</p>
        </div>
        {/* Задача №188 — "Добавить адрес" stays its own, separate action: it
            isn't part of the per-row Редактировать/Сохранить toggle below
            (adding a new record isn't "editing" any existing one). Hidden
            while either the new-address form or a row's inline edit form is
            open, same as before. */}
        {!showForm && (
          <Button className="rounded-full" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            {t("addresses.addButton")}
          </Button>
        )}
      </div>

      {showForm && !editingId && (
        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded-2xl border border-border/60 bg-card p-6 space-y-4"
        >
          <h2 className="font-serif text-2xl">{t("addresses.newTitle")}</h2>
          <AddressFormFields
            form={form}
            setForm={setForm}
            onCancel={resetForm}
            isSaving={isSaving}
            submitLabel={t("common.save")}
            deliveryZones={deliveryZones}
            onOpenMapDialog={() => setMapDialogOpen(true)}
            t={t}
          />
        </form>
      )}

      {addresses.length === 0 ? (
        <div className="mt-12 rounded-3xl border border-dashed border-border py-16 text-center">
          <div className="mx-auto h-14 w-14 rounded-full bg-secondary flex items-center justify-center mb-4">
            <MapPin className="h-6 w-6 text-primary" />
          </div>
          <h2 className="font-serif text-2xl">{t("addresses.empty")}</h2>
          <p className="mt-2 text-muted-foreground">{t("addresses.emptyDescription")}</p>
          {!showForm && (
            <Button className="mt-6 h-12 rounded-full" onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" />
              {t("addresses.addButton")}
            </Button>
          )}
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {addresses.map((address) => (
            <li key={address.id} className="rounded-2xl border border-border/60 bg-card p-6">
              {editingId === address.id ? (
                // Задача №188 — this row's own inline edit form, in place of
                // the read-only summary below: the Редактировать/Сохранить
                // toggle button that opened it lives inside AddressFormFields
                // as the submit button (type="submit", label swapped to
                // "Сохранить"). Delete/default-toggle don't apply here (the
                // summary they're attached to isn't shown right now) — only
                // Cancel, a genuinely separate action from saving.
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h2 className="font-serif text-xl">{t("addresses.editTitle")}</h2>
                  <AddressFormFields
                    form={form}
                    setForm={setForm}
                    onCancel={resetForm}
                    isSaving={isSaving}
                    submitLabel={t("profile.saveButton")}
                    deliveryZones={deliveryZones}
                    onOpenMapDialog={() => setMapDialogOpen(true)}
                    t={t}
                  />
                </form>
              ) : (
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-serif text-xl">
                        {address.label || t("addresses.fallbackLabel")}
                      </p>
                      {address.isDefault && (
                        <Badge variant="secondary">{t("addresses.defaultBadge")}</Badge>
                      )}
                    </div>
                    <p className="mt-2 text-muted-foreground">{address.fullAddress}</p>
                    {(address.city || address.district) && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {[address.city, address.district].filter(Boolean).join(", ")}
                      </p>
                    )}
                    {address.zoneId && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {t("addresses.zoneDisplay", {
                          zoneName:
                            deliveryZones?.find((z) => z.id === address.zoneId)?.name ?? "—",
                        })}
                      </p>
                    )}
                    {address.notes && (
                      <p className="text-sm text-muted-foreground mt-1">{address.notes}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {!address.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={defaultMutation.isPending}
                        onClick={() => defaultMutation.mutate(address.id)}
                      >
                        <Star className="h-3.5 w-3.5 mr-1" />
                        {t("addresses.defaultBadge")}
                      </Button>
                    )}
                    {/* Задача №188 — the Редактировать/Сохранить toggle: this
                        is the "Редактировать" half (opens this row's inline
                        form above); the "Сохранить" half is that form's own
                        submit button, not a second button here. */}
                    <Button variant="outline" size="sm" onClick={() => openEdit(address)}>
                      <Pencil className="h-3.5 w-3.5 mr-1" />
                      {t("common.edit")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={deleteMutation.isPending}
                      onClick={() => deleteMutation.mutate(address.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      {t("common.delete")}
                    </Button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <LocationPickerDialog
        open={mapDialogOpen}
        onOpenChange={setMapDialogOpen}
        onConfirm={(location) =>
          setForm((prev) => ({
            ...prev,
            latitude: location.latitude,
            longitude: location.longitude,
            fullAddress: prev.fullAddress.trim() || location.address || prev.fullAddress,
          }))
        }
      />
    </div>
  );
}
