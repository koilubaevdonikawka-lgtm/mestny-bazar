import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
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
import type { AddressDTO } from "@shared/contracts/delivery";
import { signInWithGoogle } from "@/lib/auth";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { Loader2, LogIn, MapPin, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/i18n/LanguageProvider";

export const Route = createFileRoute("/profile/addresses")({
  component: ProfileAddressesPage,
});

type AddressFormState = {
  label: string;
  fullAddress: string;
  city: string;
  district: string;
  notes: string;
  zoneId: string;
  isDefault: boolean;
};

const emptyForm = (): AddressFormState => ({
  label: "",
  fullAddress: "",
  city: "",
  district: "",
  notes: "",
  zoneId: "",
  isDefault: false,
});

function ProfileAddressesPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useSupabaseSession();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<AddressFormState>(emptyForm);

  const {
    data: addresses = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["addresses", "list"],
    queryFn: listAddresses,
    enabled: isAuthenticated === true,
    retry: false,
  });

  const { data: deliveryZones } = useQuery({
    queryKey: ["delivery", "zones"],
    queryFn: listDeliveryZones,
    enabled: isAuthenticated === true,
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

  const handleSignIn = async () => {
    await signInWithGoogle();
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

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
          <div className="mx-auto h-14 w-14 rounded-full bg-secondary flex items-center justify-center mb-4">
            <LogIn className="h-6 w-6 text-primary" />
          </div>
          <h1 className="font-serif text-3xl tracking-tight">{t("addresses.title")}</h1>
          <p className="mt-3 text-muted-foreground">{t("addresses.signInPrompt")}</p>
          <Button size="lg" className="mt-6 h-12 rounded-full" onClick={() => void handleSignIn()}>
            {t("common.signIn")}
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
    const message = error instanceof Error ? error.message : t("addresses.loadError");
    const isAuthError =
      message.toLowerCase().includes("authentication") || message.includes("Unauthorized");
    return (
      <PageShell>
        <div className="max-w-md mx-auto text-center py-24">
          <p className="text-muted-foreground">{message}</p>
          {isAuthError ? (
            <Button
              size="lg"
              className="mt-6 h-12 rounded-full"
              onClick={() => void handleSignIn()}
            >
              {t("common.signInAgain")}
            </Button>
          ) : (
            <Button size="lg" className="mt-6 h-12 rounded-full" onClick={() => void refetch()}>
              {t("common.retry")}
            </Button>
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
            <h1 className="font-serif text-4xl tracking-tight">{t("addresses.title")}</h1>
            <p className="mt-2 text-muted-foreground">{t("addresses.subtitle")}</p>
          </div>
          {!showForm && (
            <Button className="rounded-full" onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" />
              {t("addresses.addButton")}
            </Button>
          )}
        </div>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="mt-8 rounded-2xl border border-border/60 bg-card p-6 space-y-4"
          >
            <h2 className="font-serif text-2xl">
              {editingId ? t("addresses.editTitle") : t("addresses.newTitle")}
            </h2>
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
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : t("common.save")}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                {t("common.cancel")}
              </Button>
            </div>
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
      <SiteHeader showLanguageSwitcher safeAreaTop />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
