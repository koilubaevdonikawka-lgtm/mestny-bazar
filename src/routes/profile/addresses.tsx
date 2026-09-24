import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { AddressesPanel } from "@/components/AddressesPanel";
import { SignInMethodsList } from "@/components/auth/SignInMethodsList";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { Loader2, LogIn } from "lucide-react";
import { useTranslation } from "@/i18n/LanguageProvider";

export const Route = createFileRoute("/profile/addresses")({
  component: ProfileAddressesPage,
});

function ProfileAddressesPage() {
  const { t } = useTranslation();
  const { isAuthenticated } = useSupabaseSession();

  if (isAuthenticated === null) {
    return (
      <PageShell>
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PageShell>
    );
  }

  if (!isAuthenticated) {
    return (
      <PageShell>
        <div className="max-w-md mx-auto text-center py-24">
          <div className="mx-auto h-14 w-14 rounded-full bg-secondary flex items-center justify-center mb-4">
            <LogIn className="h-6 w-6 text-primary" />
          </div>
          <h1 className="font-serif text-3xl tracking-tight">{t("addresses.title")}</h1>
          <p className="mt-3 text-muted-foreground">{t("addresses.signInPrompt")}</p>
          {/* Задача №303 — shared list of sign-in methods (Google action +
              Telegram's real widget), see SignInMethodsList's own doc
              comment for why these two entries can't be uniform buttons. */}
          <div className="mt-6">
            <SignInMethodsList className="mx-auto flex max-w-xs flex-col items-stretch gap-3" />
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-3xl px-6 py-12">
        <AddressesPanel />
      </div>
    </PageShell>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader safeAreaTop showAccountMenu={false} showCart={false} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
