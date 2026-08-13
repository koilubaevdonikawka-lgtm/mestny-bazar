import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getAccessProfile } from "@/api/access-profile";
import { resolveWorkspaceRedirect } from "@/lib/workspace";

/** Access barrier for /warehouse/* — see admin.tsx for the full rationale. */
export const Route = createFileRoute("/warehouse")({
  beforeLoad: async () => {
    const profile = await getAccessProfile().catch(() => null);
    if (!profile?.workspaces.includes("warehouse")) {
      throw redirect({ href: resolveWorkspaceRedirect(profile?.workspaces ?? ["customer"]) });
    }
  },
  component: () => <Outlet />,
});
