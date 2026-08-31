import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Задача №219 — /admin/design was banner management only (title/image/link,
 * confirmed by reading the whole file fresh — no theme/logo/other design
 * settings existed here), now moved to /admin/marketing/banners alongside
 * the rest of promotion-related admin tooling (coupons, push broadcast).
 * Redirect rather than deleting the route outright, so an old bookmark or
 * link never dead-ends.
 */
export const Route = createFileRoute("/admin/design/")({
  beforeLoad: () => {
    throw redirect({ href: "/admin/marketing/banners" });
  },
});
