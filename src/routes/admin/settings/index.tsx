import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { listSettings, updateSetting } from "@/api/settings";
import type { SettingValue } from "@shared/contracts/settings";
import { signInWithGoogle } from "@/lib/auth";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { useTranslation } from "@/i18n/LanguageProvider";
import { ArrowLeft, Loader2, LogIn, Settings as SettingsIcon, ShieldAlert } from "lucide-react";
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
        <Button asChild variant="ghost" className="mb-6 -ml-2 rounded-full">
          <Link to="/admin">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("admin.common.backToHub")}
          </Link>
        </Button>

        <h1 className="font-serif text-4xl tracking-tight">{t("admin.settings.title")}</h1>
        <p className="mt-2 text-muted-foreground">
          {t("admin.settings.descriptionPrefix")}{" "}
          <code className="text-sm">docs/admin-platform/settings.md</code>).
        </p>

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
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-secondary/40 px-4 py-3"
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
