import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { RetryPaymentButton } from "@/components/RetryPaymentButton";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { checkPaymentStatus } from "@/api/payment";
import { getOrderStatus, retryPayment } from "@/api/orders";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { signInWithGoogle } from "@/lib/auth";
import { useTranslation } from "@/i18n/LanguageProvider";

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

  useEffect(() => {
    if (!orderId) return;
    let cancelled = false;

    checkPaymentStatus(orderId)
      .then((result) => {
        if (cancelled) return;
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

  const showRetry = paymentState === "failed" || (paymentState === "pending" && pendingTimedOut);

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

  const handleSignIn = async () => {
    await signInWithGoogle();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader safeAreaTop showAccountMenu={false} cartIconOnly />
      <main className="flex-1 flex items-center justify-center px-6 py-12 sm:py-24">
        <div className="max-w-md text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6">
            {paymentState === "checking" ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : paymentState === "failed" ? (
              <XCircle className="h-8 w-8" />
            ) : (
              <CheckCircle2 className="h-8 w-8" />
            )}
          </div>
          <h1 className="font-serif text-3xl md:text-4xl tracking-tight text-foreground">
            {paymentState === "failed"
              ? t("orderSuccess.paymentFailedTitle")
              : t("orderSuccess.thankYouTitle")}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            {orderNumber
              ? t("orderSuccess.orderAcceptedWithNumber", { number: orderNumber })
              : t("orderSuccess.orderAccepted")}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {paymentState === "checking"
              ? t("orderSuccess.checkingPayment")
              : paymentState === "failed"
                ? t("orderSuccess.paymentFailedDescription")
                : paymentState === "pending"
                  ? t("orderSuccess.paymentPendingDescription")
                  : t("orderSuccess.deliveryConfirmationDescription")}
          </p>
          {showRetry && order && isAuthenticated === true && (
            <div className="mt-6">
              <RetryPaymentButton
                order={order}
                isPending={retryPaymentMutation.isPending}
                onRetry={() => retryPaymentMutation.mutate()}
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
          <div className="mt-8">
            <Button asChild size="lg" className="h-12 px-8 rounded-full">
              <Link to="/">{t("orderSuccess.backToShop")}</Link>
            </Button>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
