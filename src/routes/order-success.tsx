import { createFileRoute, Link, useBlocker, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { RetryPaymentButton } from "@/components/RetryPaymentButton";
import { CancelUnpaidOnlineOrderButton } from "@/components/CancelUnpaidOnlineOrderButton";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { checkPaymentStatus } from "@/api/payment";
import { cancelUnpaidOnlineOrder, getOrderStatus, retryPayment } from "@/api/orders";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { signInWithGoogle } from "@/lib/auth";
import { useTranslation } from "@/i18n/LanguageProvider";
import type { PaymentMethod } from "@shared/contracts/order";

/**
 * How long to wait on this page before treating a still-"pending" payment as
 * stuck enough to offer a retry — Finik has no status-check endpoint of its
 * own (PaymentService.recheckStatus's provider call is a documented no-op),
 * so "pending" here only ever means "the webhook hasn't landed yet". This is
 * a page-local UX timeout, not PAYMENT_EXPIRY_MS (30 minutes) — that constant
 * governs stock-reservation lifetime, not how long a customer should stare at
 * this specific screen before getting an escape hatch.
 */
const PENDING_RETRY_TIMEOUT_MS = 15_000;

const searchSchema = z.object({
  orderNumber: z.coerce.number().optional(),
  orderId: z.string().uuid().optional(),
});

export const Route = createFileRoute("/order-success")({
  validateSearch: searchSchema,
  component: OrderSuccessPage,
});

type PaymentCheckState = "idle" | "checking" | "paid" | "pending" | "failed";

function OrderSuccessPage() {
  const { t } = useTranslation();
  const { orderNumber, orderId } = Route.useSearch();
  // Best-effort only — the webhook remains the authoritative source of
  // truth. This just gives a friendlier return-page state when the customer
  // arrives back before the webhook has landed (Промпт №075 item 10).
  const [paymentState, setPaymentState] = useState<PaymentCheckState>(
    orderId ? "checking" : "idle",
  );
  // Задача №186 — arrives in the same checkPaymentStatus response used to
  // resolve paymentState above (the order is already fetched server-side to
  // compute that status, so this costs no extra request), specifically so
  // it's known BEFORE showRetry below is first computed — not gated behind
  // showRetry already being true, which used to be a chicken-and-egg problem
  // (the full order, via getOrderStatus, only loaded once showRetry was
  // already true).
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);

  useEffect(() => {
    if (!orderId) return;
    let cancelled = false;

    checkPaymentStatus(orderId)
      .then((result) => {
        if (cancelled) return;
        setPaymentMethod(result.paymentMethod);
        if (result.status === "paid") setPaymentState("paid");
        else if (result.status === "failed" || result.status === "expired")
          setPaymentState("failed");
        else setPaymentState("pending");
      })
      .catch(() => {
        if (!cancelled) setPaymentState("idle");
      });

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  // Escape hatch for a payment stuck on "pending" longer than a customer
  // would reasonably wait on this exact screen — see PENDING_RETRY_TIMEOUT_MS.
  const [pendingTimedOut, setPendingTimedOut] = useState(false);
  useEffect(() => {
    if (paymentState !== "pending") {
      setPendingTimedOut(false);
      return;
    }
    const timer = setTimeout(() => setPendingTimedOut(true), PENDING_RETRY_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [paymentState]);

  // Задача №186 — this "payment not completed" retry screen only ever makes
  // sense for an abandoned ONLINE payment. A CASH order's paymentStatus is
  // legitimately "unpaid" until the courier collects payment later — that's
  // completely normal, not a failure, so it must never flip this screen on
  // regardless of paymentState/pendingTimedOut (mirrors the same
  // paymentMethod === "ONLINE" gate CartPanel.tsx already applies, Задача №174).
  const showRetry =
    paymentMethod === "ONLINE" &&
    (paymentState === "failed" || (paymentState === "pending" && pendingTimedOut));

  const { isAuthenticated } = useSupabaseSession();

  // RetryPaymentButton needs the full OrderDTO (checkPaymentStatus above only
  // returns a lightweight status subset) — getOrderStatus is the same no-auth,
  // orderId-is-sufficient read CartDrawer already uses, reused here rather
  // than adding a new endpoint. Only fetched once actually needed.
  const { data: order } = useQuery({
    queryKey: ["orders", "status", orderId],
    queryFn: () => getOrderStatus(orderId as string),
    enabled: !!orderId && showRetry,
    retry: false,
  });

  const retryPaymentMutation = useMutation({
    mutationFn: () => retryPayment(orderId as string),
    onSuccess: (result) => {
      if (!result.paymentUrl) {
        toast.error(t("orders.retryPaymentError"));
        return;
      }
      window.location.href = result.paymentUrl;
    },
    onError: () => toast.error(t("orders.retryPaymentError")),
  });

  // Задача №172 — once genuinely cancelled, navigation must be let through
  // again (the blocker below would otherwise also intercept our own
  // post-cancel redirect to "/").
  const [navigationUnlocked, setNavigationUnlocked] = useState(false);
  const navigate = useNavigate();

  const cancelMutation = useMutation({
    mutationFn: () => cancelUnpaidOnlineOrder(orderId as string),
    onSuccess: () => {
      setNavigationUnlocked(true);
      toast.success(t("orderSuccess.cancelledToast"));
      void navigate({ to: "/" });
    },
    onError: () => toast.error(t("orderSuccess.cancelError")),
  });

  // Задача №172 — best-effort: makes leaving this screen by any in-app
  // navigation (Links, the browser/hardware Back button, which TanStack
  // Router's history integration surfaces the same way) fail closed unless
  // the customer used one of the two designated actions. enableBeforeUnload
  // additionally asks the browser to show its own native "leave site?"
  // prompt on a tab close/refresh/manual URL change — the browser controls
  // that prompt's wording and the customer can always dismiss it, so this is
  // not, and cannot be, an absolute guarantee.
  const shouldBlockNavigation = showRetry && !navigationUnlocked;
  const blocker = useBlocker({
    shouldBlockFn: () => shouldBlockNavigation,
    enableBeforeUnload: () => shouldBlockNavigation,
    disabled: !shouldBlockNavigation,
    withResolver: true,
  });

  const handleSignIn = async () => {
    await signInWithGoogle();
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Задача №177 — cart icon removed from customer headers everywhere
          (bottom tab bar's own Cart tab covers it), so this no longer needs
          to depend on shouldBlockNavigation like showSearch still does. */}
      <SiteHeader
        safeAreaTop
        showAccountMenu={false}
        showCart={false}
        showSearch={!shouldBlockNavigation}
      />
      <main className="flex-1 flex items-center justify-center px-6 py-12 sm:py-24">
        <div className="max-w-md text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6">
            {paymentState === "checking" ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : showRetry ? (
              <XCircle className="h-8 w-8" />
            ) : (
              <CheckCircle2 className="h-8 w-8" />
            )}
          </div>
          <h1 className="font-serif text-3xl md:text-4xl tracking-tight text-foreground">
            {showRetry ? t("orderSuccess.paymentIncompleteTitle") : t("orderSuccess.thankYouTitle")}
          </h1>
          {showRetry && (
            <Badge variant="destructive" className="mt-3" data-testid="unpaid-status-badge">
              {t("orderSuccess.unpaidStatusBadge")}
            </Badge>
          )}
          <p className="mt-4 text-lg text-muted-foreground">
            {orderNumber
              ? t("orderSuccess.orderAcceptedWithNumber", { number: orderNumber })
              : t("orderSuccess.orderAccepted")}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {paymentState === "checking"
              ? t("orderSuccess.checkingPayment")
              : showRetry
                ? t("orderSuccess.paymentIncompleteDescription")
                : paymentState === "pending"
                  ? t("orderSuccess.paymentPendingDescription")
                  : t("orderSuccess.deliveryConfirmationDescription")}
          </p>
          {showRetry && order && isAuthenticated === true && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <RetryPaymentButton
                order={order}
                isPending={retryPaymentMutation.isPending}
                onRetry={() => retryPaymentMutation.mutate()}
              />
              <CancelUnpaidOnlineOrderButton
                order={order}
                isPending={cancelMutation.isPending}
                onConfirm={() => cancelMutation.mutate()}
              />
            </div>
          )}
          {showRetry && isAuthenticated === false && (
            <div className="mt-6 flex flex-col items-center gap-3">
              <p className="text-sm text-muted-foreground">
                {t("orderSuccess.retryPaymentSignInPrompt")}
              </p>
              <Button variant="outline" onClick={() => void handleSignIn()}>
                {t("common.signIn")}
              </Button>
            </div>
          )}
          {/* Задача №172 — this is a real escape hatch out of the page, so it
              must not be offered on the interrupted-payment screen alongside
              the two designated actions. */}
          {!shouldBlockNavigation && (
            <div className="mt-8">
              <Button asChild size="lg" className="h-12 px-8 rounded-full">
                <Link to="/">{t("orderSuccess.backToShop")}</Link>
              </Button>
            </div>
          )}
        </div>
      </main>
      {/* Задача №172 — best-effort in-app navigation guard: no "leave anyway"
          escape hatch is offered here on purpose, only "stay" — the two
          designated actions above are the only way through. This still
          cannot stop a hard browser/tab close, a manual address-bar
          navigation, or the user dismissing the native beforeunload prompt. */}
      <AlertDialog open={blocker.status === "blocked"} onOpenChange={() => {}}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("orderSuccess.leaveBlockedTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("orderSuccess.leaveBlockedDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => blocker.reset?.()}>
              {t("orderSuccess.leaveBlockedStay")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
