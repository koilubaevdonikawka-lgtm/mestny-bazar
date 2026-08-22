import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getAccessProfile } from "@/api/access-profile";
import { resolveWorkspaceRedirect } from "@/lib/workspace";
import { isNativePlatform } from "@/lib/capabilities/platform";

/** Access barrier for /courier/* — see admin.tsx for the full rationale. */
export const Route = createFileRoute("/courier")({
  beforeLoad: async () => {
    // Product decision: the published mobile app ships the customer
    // storefront only — never the Courier Workspace, even for an account
    // that genuinely holds the "courier" role. See admin.tsx.
    if (isNativePlatform()) {
      throw redirect({ href: "/" });
    }
    const profile = await getAccessProfile().catch(() => null);
    if (!profile?.workspaces.includes("courier")) {
      throw redirect({ href: resolveWorkspaceRedirect(profile?.workspaces ?? ["customer"]) });
    }
  },
  component: () => <Outlet />,
});
