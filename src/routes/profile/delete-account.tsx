import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/SiteHeader";
import { AccountMenu } from "@/components/AccountMenu";
import { AccountDeletionDataSummary } from "@/components/AccountDeletionDataSummary";
import { LAST_ORDER_ID_STORAGE_KEY } from "@/components/CartPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { deleteMyAccount } from "@/api/account-deletion";
import { getAccessProfile } from "@/api/access-profile";
import { useCartStore } from "@/stores/cartStore";
import { useCheckoutStore } from "@/stores/checkoutStore";
import { useTranslation } from "@/i18n/LanguageProvider";
import { BRAND } from "@/config/brand";
import type { AccountDeletionBlockReason } from "@shared/contracts/account-deletion";

/**
 * Self-service account deletion (App Store 5.1.1(v) / Google Play account
 * deletion policy): consequences → type the confirmation word → delete →
 * local sign-out + wipe this device's cart/guest contact → home.
 *
 * The server decides (AccountDeletionService, re-checked atomically in the
 * erase RPC); the access-profile check below only spares staff a form they
 * could never submit successfully.
 */
export const Route = createFileRoute("/profile/delete-account")({
  component: DeleteAccountPage,
  head: () => ({
    meta: [{ title: `${BRAND.name}` }],
  }),
});

/** Device-local data the deleted account leaves behind in this browser/app. */
function clearLocalAccountData() {
  useCartStore.getState().resetToGuest();
  useCheckoutStore.getState().reset();
  useCheckoutStore.getState().setGuestContact({ name: "", phone: "", address: "", zoneId: null });
  try {
    localStorage.removeItem(LAST_ORDER_ID_STORAGE_KEY);
  } catch {
    // storage unavailable (private mode) — nothing persisted to clear
  }
}

function DeleteAccountPage() {
  const { t } = useTranslation();
  const { isAuthenticated } = useSupabaseSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [confirmation, setConfirmation] = useState("");
  const [blockedReason, setBlockedReason] = useState<AccountDeletionBlockReason | null>(null);

  const { data: access, isLoading: accessLoading } = useQuery({
    queryKey: ["access-profile"],
    queryFn: getAccessProfile,
    enabled: isAuthenticated === true,
    retry: false,
  });
  const isStaff =
    access !== undefined &&
    (access.ownershipRole !== null || access.accessRoles.some((role) => role !== "customer"));

  const confirmWord = t("accountDeletion.confirmWord");
  const confirmed = confirmation.trim().toLocaleUpperCase() === confirmWord.toLocaleUpperCase();

  const deletion = useMutation({
    mutationFn: deleteMyAccount,
    onSuccess: async (result) => {
      if (result.status === "blocked") {
        setBlockedReason(result.reason);
        return;
      }
      // The auth user no longer exists — end the session locally only (a global
      // sign-out would call the server for a user that's already gone).
      await supabase.auth.signOut({ scope: "local" });
      clearLocalAccountData();
      queryClient.clear();
      toast.success(t("accountDeletion.deletedToast"));
      await navigate({ to: "/" });
    },
    onError: () => {
      toast.error(t("accountDeletion.errorToast"));
    },
  });

  if (isAuthenticated === null || (isAuthenticated && accessLoading)) {
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
        <h1 className="font-serif text-3xl tracking-tight">{t("accountDeletion.screenTitle")}</h1>
        <p className="mt-3 text-muted-foreground">{t("accountDeletion.signInRequired")}</p>
        <div className="mt-6">
          <AccountMenu />
        </div>
      </PageShell>
    );
  }

  const reason: AccountDeletionBlockReason | null = isStaff ? "STAFF_ACCOUNT" : blockedReason;

  return (
    <PageShell>
      <h1 className="font-serif text-3xl tracking-tight">{t("accountDeletion.screenTitle")}</h1>

      {reason ? (
        <div
          className="mt-6 rounded-2xl border border-border bg-secondary/40 p-5 text-sm"
          data-testid="account-deletion-blocked"
        >
          <p>
            {reason === "STAFF_ACCOUNT"
              ? t("accountDeletion.blockedStaff")
              : t("accountDeletion.blockedActiveOrders")}
          </p>
          {reason === "ACTIVE_ORDERS" && (
            <Button asChild variant="outline" className="mt-4 rounded-full">
              <Link to="/orders">{t("accountDeletion.ordersLink")}</Link>
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="mt-6 flex gap-3 rounded-2xl border border-destructive/40 bg-destructive/5 p-5 text-sm">
            <TriangleAlert className="h-5 w-5 shrink-0 text-destructive" />
            <p>{t("accountDeletion.screenIntro")}</p>
          </div>

          <div className="mt-8">
            <AccountDeletionDataSummary />
          </div>

          <form
            className="mt-8 space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              if (confirmed && !deletion.isPending) deletion.mutate();
            }}
          >
            <Label htmlFor="account-deletion-confirm">
              {t("accountDeletion.confirmLabel", { word: confirmWord })}
            </Label>
            <Input
              id="account-deletion-confirm"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              autoComplete="off"
              autoCapitalize="characters"
              disabled={deletion.isPending}
            />
            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                type="submit"
                variant="destructive"
                className="rounded-full"
                disabled={!confirmed || deletion.isPending}
                data-testid="account-deletion-submit"
              >
                {deletion.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {t("accountDeletion.submit")}
              </Button>
              <Button asChild type="button" variant="ghost" className="rounded-full">
                <Link to="/profile">{t("accountDeletion.cancel")}</Link>
              </Button>
            </div>
          </form>
        </>
      )}
    </PageShell>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader safeAreaTop showAccountMenu={false} showCart={false} showSearch={false} />
      <main className="flex-1 mx-auto max-w-2xl w-full px-4 py-8 sm:px-6">
        <Button asChild variant="ghost" className="-ml-2 rounded-full">
          <Link to="/profile">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("common.back")}
          </Link>
        </Button>
        <div className="mt-2">{children}</div>
      </main>
    </div>
  );
}
