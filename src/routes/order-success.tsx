import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { z } from "zod";

const searchSchema = z.object({
  orderNumber: z.coerce.number().optional(),
});

export const Route = createFileRoute("/order-success")({
  validateSearch: searchSchema,
  component: OrderSuccessPage,
});

function OrderSuccessPage() {
  const { orderNumber } = Route.useSearch();

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center px-6 py-24">
        <div className="max-w-md text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="font-serif text-3xl md:text-4xl tracking-tight text-foreground">
            Спасибо!
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            {orderNumber ? `Ваш заказ №${orderNumber} принят.` : "Ваш заказ принят."}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Мы свяжемся с вами для подтверждения доставки.
          </p>
          <div className="mt-8">
            <Button asChild size="lg" className="h-12 px-8 rounded-full">
              <Link to="/">Вернуться в магазин</Link>
            </Button>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
