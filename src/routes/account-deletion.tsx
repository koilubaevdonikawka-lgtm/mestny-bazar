import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { AccountDeletionDataSummary } from "@/components/AccountDeletionDataSummary";
import { useTranslation } from "@/i18n/LanguageProvider";
import { CONTACT } from "@/config/contact";
import { BRAND } from "@/config/brand";

/**
 * Public "how to delete your account" page — the URL given to Google Play
 * (Data safety → account deletion) and App Store Connect. No auth guard: must
 * be reachable by anyone, including store reviewers, same as /privacy.
 */
export const Route = createFileRoute("/account-deletion")({
  component: AccountDeletionInfoPage,
  head: () => ({
    meta: [{ title: `${BRAND.name}` }],
  }),
});

function AccountDeletionInfoPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader safeAreaTop showAccountMenu={false} showCart={false} showSignInFallback />
      <main className="flex-1 mx-auto max-w-2xl w-full px-4 py-8 sm:px-6">
        <Button asChild variant="ghost" className="-ml-2 rounded-full">
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("common.back")}
          </Link>
        </Button>

        <h1 className="mt-2 font-serif text-3xl tracking-tight">
          {t("accountDeletion.pageTitle")}
        </h1>
        <p className="mt-3 text-sm leading-relaxed">{t("accountDeletion.pageIntro")}</p>

        <div className="mt-6 space-y-6 text-sm leading-relaxed">
          <section className="space-y-2">
            <h2 className="font-serif text-xl tracking-tight">{t("accountDeletion.howHeading")}</h2>
            <ol className="list-decimal space-y-1 pl-5">
              <li>{t("accountDeletion.howStep1")}</li>
              <li>
                {t("accountDeletion.howStep2")}{" "}
                <Link to="/profile/delete-account" className="text-primary hover:underline">
                  {t("accountDeletion.profileLink")}
                </Link>
              </li>
              <li>{t("accountDeletion.howStep3")}</li>
            </ol>
            <p>{t("accountDeletion.howNote")}</p>
          </section>

          <AccountDeletionDataSummary />

          <section className="space-y-2">
            <h2 className="font-serif text-xl tracking-tight">{t("accountDeletion.whyHeading")}</h2>
            <p>{t("accountDeletion.whyText")}</p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif text-xl tracking-tight">
              {t("accountDeletion.guestHeading")}
            </h2>
            <p>{t("accountDeletion.guestText")}</p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif text-xl tracking-tight">
              {t("accountDeletion.contactHeading")}
            </h2>
            <p>
              {t("accountDeletion.contactText")}{" "}
              <a href={`mailto:${CONTACT.email}`} className="text-primary hover:underline">
                {CONTACT.email}
              </a>
            </p>
            <p className="text-muted-foreground">{t("accountDeletion.staffNote")}</p>
          </section>

          <p>
            <Link to="/privacy" className="text-primary hover:underline">
              {t("privacy.linkLabel")}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
