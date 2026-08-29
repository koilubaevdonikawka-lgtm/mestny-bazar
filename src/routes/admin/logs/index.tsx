import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { z } from "zod";
import type { AuditLogEntryDTO } from "@shared/contracts/audit-log";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { listAuditLog } from "@/api/logs";
import { signInWithGoogle } from "@/lib/auth";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { useTranslation } from "@/i18n/LanguageProvider";
import type { Language } from "@/i18n/languages";
import type { TranslationKey } from "@/i18n/t";
import {
  getAuditActionLabel,
  getAuditEntityTypeLabel,
  listAuditActionOptions,
  listAuditEntityTypeOptions,
} from "@/i18n/audit-log-labels";
import { FileText, Loader2, LogIn, ShieldAlert } from "lucide-react";

type Translate = (key: TranslationKey, params?: Record<string, string | number>) => string;

/** Sentinel for the "no filter" <SelectItem> — Radix Select rejects an empty-string value, and "all" maps to `undefined` before it reaches the API filter. */
const ALL_FILTER_VALUE = "all";

/** Never renders a bare UUID — falls back to a localized "(unavailable)" using the entity type. */
function entityDisplay(t: Translate, language: Language, entry: AuditLogEntryDTO): string {
  const typeLabel = getAuditEntityTypeLabel(language, entry.entityType);
  if (entry.entityName == null) {
    return t("admin.logs.entityUnavailable", { type: typeLabel });
  }
  if (entry.entityType === "order") {
    return t("admin.orders.orderNumberPrefix", { number: entry.entityName });
  }
  return t("admin.logs.entityWithName", { type: typeLabel, name: entry.entityName });
}

/** Never renders a bare UUID — actorKind tells us why there's no name to show. */
function actorDisplay(t: Translate, entry: AuditLogEntryDTO): string {
  if (entry.actorKind === "resolved" && entry.actorName) return entry.actorName;
  if (entry.actorKind === "system") return t("admin.logs.actorSystem");
  if (entry.actorKind === "unresolved") return t("admin.logs.actorUnavailable");
  return t("admin.logs.actorUnknown");
}

// Задача этапа №3 — entityId/entityType уже поддерживались
// API (AuditLogListParams), но эта страница их не
// принимала из URL. Теперь принимает — так раздел
// «Склад» может дать прямую ссылку на историю
// движения одного товара, без новой реализации.
const logsSearchSchema = z.object({
  entityType: z.string().optional(),
  entityId: z.string().optional(),
});

export const Route = createFileRoute("/admin/logs/")({
  component: AdminLogsPage,
  validateSearch: logsSearchSchema,
});

function AdminLogsPage() {
  const { isAuthenticated } = useSupabaseSession();
  const { t, language } = useTranslation();
  const search = Route.useSearch();
  const [action, setAction] = useState(ALL_FILTER_VALUE);
  const [entityType, setEntityType] = useState(search.entityType ?? ALL_FILTER_VALUE);
  const [entityId, setEntityId] = useState(search.entityId ?? "");
  const [page, setPage] = useState(1);

  const actionOptions = useMemo(() => listAuditActionOptions(language), [language]);
  const entityTypeOptions = useMemo(() => listAuditEntityTypeOptions(language), [language]);

  const filters = {
    action: action === ALL_FILTER_VALUE ? undefined : action,
    entityType: entityType === ALL_FILTER_VALUE ? undefined : entityType,
    entityId: entityId.trim() || undefined,
    page,
    pageSize: 25,
  };

  const {
    data: result,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin", "logs", "list", filters],
    queryFn: () => listAuditLog(filters),
    enabled: isAuthenticated === true,
    retry: false,
  });

  const handleSignIn = async () => {
    await signInWithGoogle();
  };

  const handleFilterChange = () => setPage(1);

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
          <h1 className="font-serif text-3xl tracking-tight">{t("admin.logs.title")}</h1>
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

  if (isError || !result) {
    const message = error instanceof Error ? error.message : t("admin.logs.loadError");
    const isForbidden =
      message.toLowerCase().includes("access denied") ||
      message.toLowerCase().includes("admin role") ||
      message.toLowerCase().includes("scope");

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
      <div className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="font-serif text-4xl tracking-tight">{t("admin.logs.title")}</h1>

        <section className="mt-6 rounded-2xl border border-border/60 bg-card p-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="log-action">{t("admin.logs.actionLabel")}</Label>
              <Select
                value={action}
                onValueChange={(value) => {
                  setAction(value);
                  handleFilterChange();
                }}
              >
                <SelectTrigger id="log-action">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_FILTER_VALUE}>
                    {t("admin.logs.allActionsOption")}
                  </SelectItem>
                  {actionOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="log-entity">{t("admin.logs.entityTypeLabel")}</Label>
              <Select
                value={entityType}
                onValueChange={(value) => {
                  setEntityType(value);
                  handleFilterChange();
                }}
              >
                <SelectTrigger id="log-entity">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_FILTER_VALUE}>
                    {t("admin.logs.allEntityTypesOption")}
                  </SelectItem>
                  {entityTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="log-entity-id">{t("admin.logs.entityIdLabel")}</Label>
              <Input
                id="log-entity-id"
                value={entityId}
                onChange={(e) => {
                  setEntityId(e.target.value);
                  handleFilterChange();
                }}
                placeholder={t("admin.logs.entityIdPlaceholder")}
              />
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-border/60 bg-card p-6">
          {result.items.length === 0 ? (
            <div className="py-8 text-center">
              <FileText className="h-6 w-6 text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">{t("admin.logs.emptyState")}</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {result.items.map((entry) => (
                <li key={entry.id} className="rounded-xl border border-border/60 bg-card px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <p className="text-sm font-medium">
                        {getAuditActionLabel(language, entry.action)}
                      </p>
                      <code className="text-[10px] text-muted-foreground/70">{entry.action}</code>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(entry.occurredAt).toLocaleString("ru-RU")}
                    </p>
                  </div>
                  <div className="mt-1 flex flex-wrap items-baseline gap-2">
                    <p className="text-sm">{entityDisplay(t, language, entry)}</p>
                    <code className="text-[10px] text-muted-foreground/70">{entry.entityType}</code>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{actorDisplay(t, entry)}</p>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-6 flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              {t("common.back")}
            </Button>
            <p className="text-sm text-muted-foreground">
              {t("admin.logs.pageInfo", {
                page: String(result.page),
                total: String(result.total),
              })}
            </p>
            <Button
              variant="outline"
              size="sm"
              disabled={!result.hasMore}
              onClick={() => setPage((p) => p + 1)}
            >
              {t("common.next")}
            </Button>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
