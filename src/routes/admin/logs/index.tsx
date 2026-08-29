import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
import type { AuditLogEntryDTO } from "@shared/contracts/audit-log";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { listAuditLog } from "@/api/logs";
import { signInWithGoogle } from "@/lib/auth";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { useTranslation } from "@/i18n/LanguageProvider";
import type { TranslationKey } from "@/i18n/t";
import { FileText, Loader2, LogIn, ShieldAlert } from "lucide-react";

type Translate = (key: TranslationKey, params?: Record<string, string | number>) => string;

/**
 * Задача №199 — actions/entityTypes dictionaries are keyed by the exact
 * technical strings (e.g. "order.confirmed", "delivery_zone"), so a lookup
 * miss (a backend action added before its label lands here) falls back to
 * the raw technical string instead of the ugly literal dictionary path.
 */
function actionLabel(t: Translate, action: string): string {
  const key = `admin.logs.actions.${action}` as TranslationKey;
  const label = t(key);
  return label === key ? action : label;
}

function entityTypeLabel(t: Translate, entityType: string): string {
  const key = `admin.logs.entityTypes.${entityType}` as TranslationKey;
  const label = t(key);
  return label === key ? entityType : label;
}

/** Never renders a bare UUID — falls back to a localized "(unavailable)" using the entity type. */
function entityDisplay(t: Translate, entry: AuditLogEntryDTO): string {
  const typeLabel = entityTypeLabel(t, entry.entityType);
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
  const { t } = useTranslation();
  const search = Route.useSearch();
  const [action, setAction] = useState("");
  const [entityType, setEntityType] = useState(search.entityType ?? "");
  const [entityId, setEntityId] = useState(search.entityId ?? "");
  const [page, setPage] = useState(1);

  const filters = {
    action: action.trim() || undefined,
    entityType: entityType.trim() || undefined,
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
              <Input
                id="log-action"
                value={action}
                onChange={(e) => {
                  setAction(e.target.value);
                  handleFilterChange();
                }}
                placeholder={t("admin.logs.actionPlaceholder")}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="log-entity">{t("admin.logs.entityTypeLabel")}</Label>
              <Input
                id="log-entity"
                value={entityType}
                onChange={(e) => {
                  setEntityType(e.target.value);
                  handleFilterChange();
                }}
                placeholder={t("admin.logs.entityTypePlaceholder")}
              />
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
                    <p className="text-sm font-medium">{actionLabel(t, entry.action)}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(entry.occurredAt).toLocaleString("ru-RU")}
                    </p>
                  </div>
                  <p className="mt-1 text-sm">{entityDisplay(t, entry)}</p>
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
