import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getAccessProfile } from "@/api/access-profile";
import { resolveWorkspaceRedirect } from "@/lib/workspace";
import { isNativePlatform } from "@/lib/capabilities/platform";

/** Access barrier for /warehouse/* — see admin.tsx for the full rationale. */
export const Route = createFileRoute("/warehouse")({
  beforeLoad: async () => {
    // Product decision: the published mobile app ships the customer
    // storefront only — never the Warehouse Workspace, even for an account
    // that genuinely holds the "warehouse" role. See admin.tsx.
    if (isNativePlatform()) {
      throw redirect({ href: "/" });
    }
    const profile = await getAccessProfile().catch(() => null);
    if (!profile?.workspaces.includes("warehouse")) {
      throw redirect({ href: resolveWorkspaceRedirect(profile?.workspaces ?? ["customer"]) });
    }
  },
  component: () => <Outlet />,
});
