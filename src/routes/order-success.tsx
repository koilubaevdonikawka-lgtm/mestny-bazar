import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { z } from "zod";
import { checkPaymentStatus } from "@/api/payment";
import { useTranslation } from "@/i18n/LanguageProvider";

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

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader showLanguageSwitcher safeAreaTop />
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
