import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getAccessProfile } from "@/api/access-profile";
import { resolveWorkspaceRedirect } from "@/lib/workspace";

/**
 * Access barrier (docs/architecture/PLATFORM_ACCESS_ARCHITECTURE.md §10 п.2,
 * §14 — "пользователь не может попасть в Workspace, если соответствующая
 * роль отсутствует... ни через прямой переход по ссылке"). Layout route for
 * every /admin/* page — beforeLoad runs once per navigation into this tree,
 * before any admin/* child renders. Re-checked on every navigation, not
 * cached for the visit (§15 п.2): a revoked role must lose access
 * immediately, not just at the next server mutation.
 *
 * This is the client-side "rough barrier" only — it exists to redirect a
 * legitimately-unauthorized user away before they see the admin shell, not
 * to replace the server-side enforcement. requireAdminFromRequest() in
 * server/functions/*.executor.ts remains the actual security boundary and is
 * unchanged (§15 п.1: "клиентский isAuthenticated/список ролей — не более
 * чем отражение серверного состояния для UI").
 */
export const Route = createFileRoute("/admin")({
  beforeLoad: async () => {
    const profile = await getAccessProfile().catch(() => null);
    if (!profile?.workspaces.includes("administration")) {
      throw redirect({ href: resolveWorkspaceRedirect(profile?.workspaces ?? ["customer"]) });
    }
  },
  component: () => <Outlet />,
});
