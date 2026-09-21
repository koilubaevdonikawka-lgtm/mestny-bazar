import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { listSettings, updateSetting } from "@/api/settings";
import {
  ADMIN_CONTACT_PHONE_SETTING_CATEGORY,
  ADMIN_CONTACT_PHONE_SETTING_KEY,
  CONTACT_TELEGRAM_SETTING_KEY,
  CONTACT_WHATSAPP_SETTING_KEY,
  type SettingValue,
} from "@shared/contracts/settings";
import { normalizeTelegramLink, normalizeWhatsappLink } from "@shared/validation/contact-links";
import { signInWithGoogle } from "@/lib/auth";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { useTranslation } from "@/i18n/LanguageProvider";
import { Loader2, LogIn, Settings as SettingsIcon, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/settings/")({
  component: AdminSettingsPage,
});

function AdminSettingsPage() {
  const { isAuthenticated } = useSupabaseSession();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [key, setKey] = useState("");
  const [category, setCategory] = useState("");
  const [valueText, setValueText] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const {
    data: settings,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin", "settings", "list"],
    queryFn: listSettings,
    enabled: isAuthenticated === true,
    retry: false,
  });

  const updateMutation = useMutation({
    mutationFn: updateSetting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "settings", "list"] });
      toast.success(t("admin.settings.savedToast"));
      setKey("");
      setCategory("");
      setValueText("");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : t("admin.settings.saveError")),
  });

  // Задача №274 — dedicated, friendlier field for one specific key, on top
  // of the same generic settings store the raw key/value form above already
  // writes through (ADMIN_CONTACT_PHONE_SETTING_KEY) — kept as its own
  // mutation/local state so saving it never resets the unrelated raw-form
  // fields above (updateMutation's own onSuccess does that for ITS form).
  const [contactPhone, setContactPhone] = useState("");
  useEffect(() => {
    const existing = settings?.find((s) => s.key === ADMIN_CONTACT_PHONE_SETTING_KEY)?.value;
    setContactPhone(typeof existing === "string" ? existing : "");
  }, [settings]);

  const contactPhoneMutation = useMutation({
    mutationFn: (value: string) =>
      updateSetting({
        key: ADMIN_CONTACT_PHONE_SETTING_KEY,
        category: ADMIN_CONTACT_PHONE_SETTING_CATEGORY,
        value,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "settings", "list"] });
      toast.success(t("admin.settings.savedToast"));
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : t("admin.settings.saveError")),
  });

  // Задача №298 — Telegram / WhatsApp links shown on /info, same generic store
  // and category as the phone above. Blank clears the link; anything else must
  // look like a link/number (normalize* returns null for junk) and is saved in
  // its normalized https form, so the admin sees exactly what buyers will open.
  const [telegramLink, setTelegramLink] = useState("");
  const [whatsappLink, setWhatsappLink] = useState("");
  useEffect(() => {
    const read = (settingKey: string) => {
      const existing = settings?.find((s) => s.key === settingKey)?.value;
      return typeof existing === "string" ? existing : "";
    };
    setTelegramLink(read(CONTACT_TELEGRAM_SETTING_KEY));
    setWhatsappLink(read(CONTACT_WHATSAPP_SETTING_KEY));
  }, [settings]);

  const contactLinksMutation = useMutation({
    mutationFn: (values: { telegram: string; whatsapp: string }) =>
      Promise.all([
        updateSetting({
          key: CONTACT_TELEGRAM_SETTING_KEY,
          category: ADMIN_CONTACT_PHONE_SETTING_CATEGORY,
          value: values.telegram,
        }),
        updateSetting({
          key: CONTACT_WHATSAPP_SETTING_KEY,
          category: ADMIN_CONTACT_PHONE_SETTING_CATEGORY,
          value: values.whatsapp,
        }),
      ]),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "settings", "list"] });
      queryClient.invalidateQueries({ queryKey: ["public", "contact-links"] });
      toast.success(t("admin.settings.savedToast"));
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : t("admin.settings.saveError")),
  });

  const handleSaveContactLinks = () => {
    const telegram = telegramLink.trim();
    const whatsapp = whatsappLink.trim();
    const telegramNormalized = telegram ? normalizeTelegramLink(telegram) : "";
    const whatsappNormalized = whatsapp ? normalizeWhatsappLink(whatsapp) : "";
    if (telegramNormalized === null) {
      toast.error(t("admin.settings.contactTelegramInvalid"));
      return;
    }
    if (whatsappNormalized === null) {
      toast.error(t("admin.settings.contactWhatsappInvalid"));
      return;
    }
    contactLinksMutation.mutate({ telegram: telegramNormalized, whatsapp: whatsappNormalized });
  };

  const handleSignIn = async () => {
    await signInWithGoogle();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!key.trim() || !category.trim()) {
      setFormError(t("admin.settings.missingKeyCategoryError"));
      return;
    }
    let value: SettingValue;
    try {
      value = valueText.trim() ? (JSON.parse(valueText) as SettingValue) : null;
    } catch {
      setFormError(t("admin.settings.invalidJsonError"));
      return;
    }
    updateMutation.mutate({ key: key.trim(), category: category.trim(), value });
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
          <div className="mx-auto h-14 w-14 rounded-full bg-secondary flex items-center justify-center mb-4">
            <LogIn className="h-6 w-6 text-primary" />
          </div>
          <h1 className="font-serif text-3xl tracking-tight">{t("admin.settings.title")}</h1>
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
    const message = error instanceof Error ? error.message : t("admin.settings.loadError");
    const isForbidden =
      message.toLowerCase().includes("access denied") ||
      message.toLowerCase().includes("admin role") ||
      message.toLowerCase().includes("permission");
    const isAuthError =
      message.toLowerCase().includes("authentication") || message.includes("Unauthorized");

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
            </>
          )}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="font-serif text-4xl tracking-tight">{t("admin.settings.title")}</h1>

        <section className="mt-8 rounded-2xl border border-border/60 bg-card p-6">
          {!settings || settings.length === 0 ? (
            <div className="py-8 text-center">
              <div className="mx-auto h-14 w-14 rounded-full bg-secondary flex items-center justify-center mb-4">
                <SettingsIcon className="h-6 w-6 text-primary" />
              </div>
              <p className="text-muted-foreground">{t("admin.settings.emptyState")}</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {settings.map((s) => (
                <li
                  key={s.key}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/60 bg-card px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="font-medium truncate">{s.key}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {JSON.stringify(s.value)}
                    </p>
                  </div>
                  <Badge variant="secondary">{s.category}</Badge>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mt-6 rounded-2xl border border-border/60 bg-card p-6">
          <h2 className="font-serif text-2xl mb-2">{t("admin.settings.contactPhoneHeading")}</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            {t("admin.settings.contactPhoneDescription")}
          </p>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="admin-contact-phone">{t("admin.settings.contactPhoneLabel")}</Label>
              <Textarea
                id="admin-contact-phone"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder={t("admin.settings.contactPhonePlaceholder")}
                rows={3}
                className="resize-none"
              />
            </div>
            <Button
              type="button"
              className="h-12 w-full rounded-full sm:w-auto"
              disabled={contactPhoneMutation.isPending}
              onClick={() => contactPhoneMutation.mutate(contactPhone.trim())}
            >
              {contactPhoneMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t("common.save")
              )}
            </Button>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-border/60 bg-card p-6">
          <h2 className="font-serif text-2xl mb-2">{t("admin.settings.contactLinksHeading")}</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            {t("admin.settings.contactLinksDescription")}
          </p>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="contact-telegram">{t("admin.settings.contactTelegramLabel")}</Label>
              <Input
                id="contact-telegram"
                value={telegramLink}
                onChange={(e) => setTelegramLink(e.target.value)}
                placeholder={t("admin.settings.contactTelegramPlaceholder")}
                maxLength={300}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contact-whatsapp">{t("admin.settings.contactWhatsappLabel")}</Label>
              <Input
                id="contact-whatsapp"
                value={whatsappLink}
                onChange={(e) => setWhatsappLink(e.target.value)}
                placeholder={t("admin.settings.contactWhatsappPlaceholder")}
                maxLength={300}
              />
            </div>
            <Button
              type="button"
              className="h-12 w-full rounded-full sm:w-auto"
              disabled={contactLinksMutation.isPending}
              onClick={handleSaveContactLinks}
            >
              {contactLinksMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t("common.save")
              )}
            </Button>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-border/60 bg-card p-6">
          <h2 className="font-serif text-2xl mb-4">{t("admin.settings.addUpdateHeading")}</h2>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="setting-key">{t("admin.settings.keyLabel")}</Label>
                <Input
                  id="setting-key"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder={t("admin.settings.keyPlaceholder")}
                  maxLength={200}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="setting-category">{t("admin.settings.categoryLabel")}</Label>
                <Input
                  id="setting-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder={t("admin.settings.categoryPlaceholder")}
                  maxLength={100}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="setting-value">{t("admin.settings.valueLabel")}</Label>
              <Input
                id="setting-value"
                value={valueText}
                onChange={(e) => setValueText(e.target.value)}
                placeholder={t("admin.settings.valuePlaceholder")}
              />
            </div>
            {formError && <p className="text-sm text-destructive">{formError}</p>}
            <Button type="submit" className="h-12 rounded-full" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t("common.save")
              )}
            </Button>
          </form>
        </section>
      </div>
    </AdminLayout>
  );
}
