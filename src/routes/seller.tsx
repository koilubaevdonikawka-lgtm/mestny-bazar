import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getAccessProfile } from "@/api/access-profile";
import { resolveWorkspaceRedirect } from "@/lib/workspace";

/**
 * Access barrier for /seller/* — see admin.tsx for the full rationale.
 * Seller isn't named in the four workspaces CTO's order lists explicitly,
 * but it's the same staff Workspace class per PLATFORM_ACCESS_ARCHITECTURE.md
 * §9's role table (Administrator/Seller/Courier/Warehouse are all Access-role
 * Workspaces) — leaving it unguarded while the other three are guarded would
 * be an arbitrary, undocumented gap, not a deliberate scope cut.
 */
export const Route = createFileRoute("/seller")({
  beforeLoad: async () => {
    const profile = await getAccessProfile().catch(() => null);
    if (!profile?.workspaces.includes("seller")) {
      throw redirect({ href: resolveWorkspaceRedirect(profile?.workspaces ?? ["customer"]) });
    }
  },
  component: () => <Outlet />,
});
