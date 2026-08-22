import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/LanguageProvider";
import { CONTACT } from "@/config/contact";
import { BRAND } from "@/config/brand";

/**
 * Required by Google Play / App Store publication forms (a public,
 * no-login-required URL to link there) — audited as missing this session.
 * Content is a direct, honest description of what this codebase actually
 * does (checkout.schema.ts/address.schema.ts fields, Google-only auth,
 * finik.adapter.ts's real request body, unused geolocation/camera/push
 * capability stubs) — not a generic boilerplate template. No auth guard:
 * must be reachable by anyone, including app-store reviewers.
 */
export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
  head: () => ({
    meta: [{ title: `${BRAND.name}` }],
  }),
});

function PrivacyPage() {
  const { t } = useTranslation();

  const sections = [
    t("privacy.intro"),
    t("privacy.signIn"),
    t("privacy.dataCollected"),
    t("privacy.dataNotCollected"),
    t("privacy.thirdParties"),
    t("privacy.retention"),
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader safeAreaTop showAccountMenu={false} cartIconOnly />
      <main className="flex-1 mx-auto max-w-2xl w-full px-4 py-8 sm:px-6">
        <Button asChild variant="ghost" className="-ml-2 rounded-full">
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("common.back")}
          </Link>
        </Button>

        <h1 className="mt-2 font-serif text-3xl tracking-tight">{t("privacy.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("privacy.lastUpdated")}</p>

        <div className="mt-6 space-y-4 text-sm leading-relaxed text-foreground">
          {sections.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
          <p>
            {t("privacy.contact")}{" "}
            <a href={`mailto:${CONTACT.email}`} className="text-primary hover:underline">
              {CONTACT.email}
            </a>
          </p>
        </div>

        <p className="mt-8 border-t border-border/60 pt-4 text-xs text-muted-foreground">
          {t("privacy.disclaimer")}
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
