import { useEffect, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { getBootstrapStatus } from "@/api/bootstrap";
import { getAccessProfile } from "@/api/access-profile";
import type { BootstrapStatusDTO } from "@shared/contracts/bootstrap";
import type { WorkspaceId } from "@shared/contracts/access-profile";

const WORKSPACE_PATH: Record<Exclude<WorkspaceId, "customer">, string> = {
  administration: "/admin",
  seller: "/seller/profile",
  courier: "/courier/orders",
  warehouse: "/warehouse/orders",
};

/**
 * Единая точка входа для двух связанных навигационных решений при старте
 * приложения: Bootstrap redirect (Этап 4, docs/architecture/
 * PLATFORM_INITIALIZATION_ARCHITECTURE.md §9) и Workspace redirect (Этап 6,
 * docs/architecture/PLATFORM_ACCESS_ARCHITECTURE.md §7, §13).
 *
 * Раньше это были два независимых hook'а (useBootstrapRedirect,
 * useWorkspaceRedirect), каждый со своим useEffect и своим асинхронным запросом.
 * При определённом пограничном стечении обстоятельств — Bootstrap ещё ELIGIBLE,
 * но у пользователя уже есть Access-роль admin (например, оставшаяся с более
 * раннего этапа эксплуатации) — оба эффекта могли одновременно решить вызвать
 * navigate() в разные стороны; итоговый маршрут зависел от того, какой запрос
 * резолвился первым в сети, а не от архитектуры. Объединены в один
 * последовательный поток: Workspace Selection всегда ждёт результат Bootstrap
 * (через один и тот же промис, не через повторный независимый запрос) и не
 * выполняется вовсе, пока платформа не Operational
 * (PLATFORM_INITIALIZATION_ARCHITECTURE.md §14) — Bootstrap redirect имеет
 * безусловный приоритет.
 *
 * В штатном случае (Bootstrap уже COMPLETED — подавляющее большинство реальной
 * эксплуатации) наблюдаемое поведение не меняется: ровно один запрос статуса
 * Bootstrap на монтирование, как и раньше, и та же логика Workspace-редиректа,
 * что была в useWorkspaceRedirect.
 */
export function usePlatformNavigationGate(): void {
  const { isAuthenticated } = useSupabaseSession();
  const wasAuthenticated = useRef<boolean | null>(null);
  const navigate = useNavigate();

  // Создаётся один раз за время жизни компонента — оба эффекта ниже ждут
  // именно этот промис, а не выполняют собственный, потенциально
  // рассинхронизированный запрос статуса Bootstrap.
  const bootstrapStatus = useRef<Promise<BootstrapStatusDTO> | null>(null);
  if (bootstrapStatus.current === null) {
    bootstrapStatus.current = getBootstrapStatus().catch((): BootstrapStatusDTO => ({
      eligibility: "COMPLETED",
    }));
  }

  useEffect(() => {
    let cancelled = false;

    void bootstrapStatus.current!.then(({ eligibility }) => {
      if (cancelled) return;
      if (eligibility === "ELIGIBLE" && window.location.pathname !== "/bootstrap") {
        void navigate({ to: "/bootstrap" });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  useEffect(() => {
    if (isAuthenticated === null) return;
    const previous = wasAuthenticated.current;
    wasAuthenticated.current = isAuthenticated;

    if (!isAuthenticated || previous === true) return;
    if (window.location.pathname !== "/") return;

    let cancelled = false;

    void bootstrapStatus.current!.then(async ({ eligibility }) => {
      if (cancelled || eligibility === "ELIGIBLE") return;

      const { workspaces } = await getAccessProfile();
      if (cancelled) return;

      const nonCustomer = workspaces.filter(
        (w): w is Exclude<WorkspaceId, "customer"> => w !== "customer",
      );
      if (nonCustomer.length === 1) {
        void navigate({ to: WORKSPACE_PATH[nonCustomer[0]] });
      } else if (nonCustomer.length > 1) {
        void navigate({ to: "/workspace" });
      }
      // Zero non-customer workspaces (plain Customer) — stay put, nothing to do.
    });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, navigate]);
}
