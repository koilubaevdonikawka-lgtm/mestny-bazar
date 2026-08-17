import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { getAccessProfile } from "@/api/access-profile";
import { WORKSPACE_PATH } from "@/lib/workspace";
import type { WorkspaceId } from "@shared/contracts/access-profile";

export const Route = createFileRoute("/workspace")({
  component: WorkspaceSelectionPage,
});

const WORKSPACE_LABEL: Record<WorkspaceId, string> = {
  administration: "Административная платформа",
  seller: "Кабинет продавца",
  courier: "Курьерские заказы",
  warehouse: "Склад",
  customer: "Покупательская витрина",
};

/**
 * Role Resolution → Workspace Selection entry point (docs/architecture/
 * PLATFORM_ACCESS_ARCHITECTURE.md §6-7). §7 п.1: exactly one applicable
 * Workspace resolves unambiguously — no picker shown, straight redirect.
 * §7 п.2: more than one means the platform cannot guess — the picker below
 * is shown so the user chooses explicitly. Also serves as the general
 * "switch Workspace" entry point (§8), reachable any time, not only right
 * after login.
 */
function WorkspaceSelectionPage() {
  const { isAuthenticated } = useSupabaseSession();
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState<WorkspaceId[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    getAccessProfile()
      .then((profile) => {
        if (profile.workspaces.length === 1) {
          void navigate({ href: WORKSPACE_PATH[profile.workspaces[0]], replace: true });
          return;
        }
        setWorkspaces(profile.workspaces);
      })
      .catch(() => setError(true));
  }, [isAuthenticated, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-serif text-3xl tracking-tight">Выбор рабочего пространства</h1>

        {isAuthenticated === null && (
          <div className="mt-6 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {isAuthenticated === false && (
          <p className="mt-3 text-muted-foreground">
            Войдите в аккаунт, чтобы увидеть доступные рабочие пространства.
          </p>
        )}

        {isAuthenticated === true && error && (
          <p className="mt-3 text-muted-foreground">
            Не удалось загрузить список доступных пространств. Попробуйте обновить страницу.
          </p>
        )}

        {isAuthenticated === true && !error && workspaces === null && (
          <div className="mt-6 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {isAuthenticated === true && workspaces && (
          <div className="mt-6 grid gap-3">
            {workspaces.map((workspace) => (
              <Link
                key={workspace}
                to={WORKSPACE_PATH[workspace]}
                className="rounded-xl border border-border/60 bg-card px-6 py-4 text-left transition-colors hover:border-primary/40"
              >
                {WORKSPACE_LABEL[workspace]}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
