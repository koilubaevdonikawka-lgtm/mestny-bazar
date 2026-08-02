import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ShoppingCart, Minus, Plus, Trash2, AlertTriangle, Loader2, Truck } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/stores/cartStore";
import { useCheckoutStore } from "@/stores/checkoutStore";
import { createOrder } from "@/api/orders";
import { calculateDeliveryFee } from "@/api/delivery-pricing";
import { supabase } from "@/integrations/supabase/client";
import type { CartLineStatus } from "@shared/contracts/cart";

const VALIDATION_MESSAGE: Record<Exclude<CartLineStatus, "ok">, string> = {
  price_changed: "Цена изменилась",
  out_of_stock: "Товара больше нет в наличии",
  not_found: "Товар больше не доступен",
};

export const CartDrawer = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lineWarnings, setLineWarnings] = useState<Record<string, string>>({});
  const { items, isLoading, updateQuantity, removeItem, validateCart, clearCart } = useCartStore();
  const { address, zoneId, paymentMethod, customerPhone, customerName, setCustomerName } =
    useCheckoutStore();
  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = items.reduce((s, i) => s + parseFloat(i.price.amount) * i.quantity, 0);

  // Server-computed only (CD-01) — never a client-side estimate. docs/delivery/delivery-pricing.md.
  const deliveryQuery = useQuery({
    queryKey: ["delivery", "fee", zoneId, totalPrice],
    queryFn: () => calculateDeliveryFee({ zoneId: zoneId!, subtotal: totalPrice }),
    enabled: isOpen && !!zoneId && totalItems > 0,
    retry: false,
  });

  useEffect(() => {
    if (!isOpen) return;
    setLineWarnings({});
    void validateCart().then((result) => {
      if (!result) return;
      const warnings: Record<string, string> = {};
      for (const line of result.lines) {
        if (line.status === "ok") continue;
        const key = line.productSlug ?? line.productId ?? "";
        warnings[key] = VALIDATION_MESSAGE[line.status];
      }
      setLineWarnings(warnings);
    });
  }, [isOpen, validateCart]);

  const resolveCustomerName = async (): Promise<string> => {
    if (customerName.trim().length >= 2) return customerName.trim();
    const { data } = await supabase.auth.getUser();
    const metaName =
      data.user?.user_metadata?.full_name ??
      data.user?.user_metadata?.name ??
      data.user?.email?.split("@")[0];
    if (metaName && String(metaName).trim().length >= 2) {
      const name = String(metaName).trim();
      setCustomerName(name);
      return name;
    }
    return "Покупатель";
  };

  const handleCheckout = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const isAuthenticated = !!sessionData.session?.user;
    const hasManualAddress = address.trim().length >= 5;

    if (!isAuthenticated && !hasManualAddress) {
      toast.error("Укажите адрес доставки в разделе «Доставка оплата и статус»");
      return;
    }
    if (!paymentMethod) {
      toast.error("Выберите способ оплаты в разделе «Доставка оплата и статус»");
      return;
    }
    const phoneDigits = customerPhone.replace(/[^\d]/g, "");
    if (phoneDigits.length < 9) {
      toast.error("Укажите номер телефона в разделе уведомлений о заказе");
      return;
    }

    setIsSubmitting(true);
    try {
      const name = await resolveCustomerName();
      const response = await createOrder({
        items: items.map((item) => ({
          productSlug: item.product.node.handle,
          quantity: item.quantity,
          snapshot: {
            name: item.product.node.title,
            price: parseFloat(item.price.amount),
            currency: item.price.currencyCode,
            imageUrl: item.product.node.images?.edges?.[0]?.node?.url ?? null,
          },
        })),
        ...(hasManualAddress ? { addressSnapshot: address.trim() } : {}),
        ...(zoneId ? { zoneId } : {}),
        customerName: name,
        customerPhone,
        paymentMethod,
        idempotencyKey: crypto.randomUUID(),
      });

      await clearCart();
      useCheckoutStore.getState().reset();
      setIsOpen(false);
      await navigate({
        to: "/order-success",
        search: { orderNumber: response.order.orderNumber },
      });
    } catch (error) {
      if (
        error instanceof Error &&
        (error.name === "CashPaymentRequiresAuthentication" ||
          error.message.includes("Cash payment requires authentication") ||
          error.message.includes("Оплата наличными"))
      ) {
        toast.error("Оплата наличными доступна только авторизованным пользователям");
        return;
      }
      const message = error instanceof Error ? error.message : "Не удалось оформить заказ";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const checkoutBusy = isLoading || isSubmitting;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="default"
          className="relative h-11 rounded-full pl-4 pr-5 gap-2 bg-primary text-primary-foreground shadow-sm hover:shadow-md hover:bg-primary/90"
        >
          <ShoppingCart className="h-4 w-4" />
          <span className="font-serif text-sm">Ваша корзина</span>
          {totalItems > 0 && (
            <Badge className="ml-1 h-5 min-w-5 px-1.5 rounded-full flex items-center justify-center text-xs bg-accent text-accent-foreground border border-primary-foreground/30">
              {totalItems}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg flex flex-col h-full">
        <SheetHeader className="flex-shrink-0">
          <SheetTitle className="font-serif text-2xl">Ваша корзина</SheetTitle>
          <SheetDescription>
            {totalItems === 0
              ? "Пока пусто — самое время добавить свежих продуктов."
              : `${totalItems} ${totalItems === 1 ? "товар" : "товаров"} в корзине`}
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col flex-1 pt-6 min-h-0">
          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Корзина пуста</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto pr-2 min-h-0">
                <div className="space-y-4">
                  {items.map((item) => {
                    const warning = lineWarnings[item.product.node.handle];
                    return (
                      <div
                        key={item.variantId}
                        className="flex gap-4 p-2 rounded-lg bg-secondary/40"
                      >
                        <div className="w-20 h-20 bg-secondary rounded-md overflow-hidden flex-shrink-0">
                          {item.product.node.images?.edges?.[0]?.node && (
                            <img
                              src={item.product.node.images.edges[0].node.url}
                              alt={item.product.node.title}
                              loading="lazy"
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{item.product.node.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {item.selectedOptions.map((o) => o.value).join(" • ")}
                          </p>
                          <p className="font-semibold mt-1">
                            {parseFloat(item.price.amount).toFixed(2)} {item.price.currencyCode}
                          </p>
                          {warning && (
                            <p className="mt-1 flex items-center gap-1 text-xs text-destructive">
                              <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                              {warning}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => removeItem(item.variantId)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </Button>
                            <span className="w-6 text-center text-sm">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="flex-shrink-0 space-y-4 pt-4 border-t bg-background">
                {zoneId ? (
                  deliveryQuery.data && (
                    <div className="flex items-start gap-2 rounded-xl bg-secondary/40 px-4 py-3 text-sm">
                      <Truck className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                      <div>
                        <p>
                          Доставка:{" "}
                          <strong>
                            {deliveryQuery.data.isFree
                              ? "Бесплатно"
                              : `${deliveryQuery.data.fee.toFixed(2)} ${items[0]?.price.currencyCode || ""}`}
                          </strong>
                        </p>
                        {deliveryQuery.data.eta.minMinutes != null && (
                          <p className="text-muted-foreground">
                            Ожидаемое время: {deliveryQuery.data.eta.minMinutes}–
                            {deliveryQuery.data.eta.maxMinutes} мин
                          </p>
                        )}
                        {!deliveryQuery.data.isFree && deliveryQuery.data.freeFrom != null && (
                          <p className="text-muted-foreground">
                            Бесплатная доставка от {deliveryQuery.data.freeFrom} — добавьте ещё{" "}
                            {(deliveryQuery.data.freeFrom - totalPrice).toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                ) : (
                  <p className="text-xs text-muted-foreground px-1">
                    Укажите зону доставки в разделе «Доставка оплата и статус», чтобы увидеть
                    стоимость и срок доставки.
                  </p>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-lg">Итого</span>
                  <span className="text-2xl font-serif font-semibold">
                    {totalPrice.toFixed(2)} {items[0]?.price.currencyCode || ""}
                  </span>
                </div>
                <Button
                  onClick={handleCheckout}
                  className="w-full h-12 text-base"
                  disabled={items.length === 0 || checkoutBusy}
                >
                  {checkoutBusy ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Оформить заказ
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
