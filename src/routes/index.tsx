import { createFileRoute } from "@tanstack/react-router";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useSearchStore } from "@/stores/searchStore";
import { useCheckoutStore } from "@/stores/checkoutStore";
import { Truck, Loader2, ShoppingBasket, MessageCircle, CreditCard, Send } from "lucide-react";
import { fetchCatalogProducts } from "@/lib/catalog";
import type { ShopifyProduct } from "@/lib/shopify";
import { listCategories } from "@/api/category";
import { listActiveBanners } from "@/api/design";
import { BRAND } from "@/config/brand";
import { CONTACT } from "@/config/contact";
import catFlour from "@/assets/cat-flour.png";
import catProduce from "@/assets/cat-produce.png";
import catOils from "@/assets/cat-oils.png";
import catDrinks from "@/assets/cat-drinks.png";
import catSweets from "@/assets/cat-sweets.png";
import catDairy from "@/assets/cat-dairy.png";
import catMeat from "@/assets/cat-meat.png";

export const Route = createFileRoute("/")({
  component: Home,
});

// public.categories has no Kyrgyz-name column — this is a presentation-only
// supplement for the categories the storefront already had a translation
// for. A slug missing here just renders without the Kyrgyz line, not an
// empty one.
const KG_NAME_BY_SLUG: Record<string, string> = {
  "muka-krupy": "Ун",
  "ovoshchi-frukty": "Жашылча-жемиш",
  masla: "Майлар",
  napitki: "Суусундуктар",
  sladosti: "Таттуу",
  molochnoe: "Сүт азык",
  myasnoe: "Эт азык",
};

// image_url is still empty for every seeded category (nothing's been
// uploaded to Supabase Storage yet) — these keep the section looking the way
// it always has until real photos are set via category-images. A slug with
// no entry here (e.g. "hleb-vypechka" — seeded in the DB but never given a
// local asset) must fall through to the "Нет фото" placeholder below, not to
// another category's specific image: this map used to also expose a shared
// DEFAULT_FALLBACK_IMAGE equal to catProduce, so any unmapped category
// silently rendered as "Овощи и фрукты" instead of admitting it has no photo.
const FALLBACK_IMAGE_BY_SLUG: Record<string, string> = {
  "muka-krupy": catFlour,
  "ovoshchi-frukty": catProduce,
  masla: catOils,
  napitki: catDrinks,
  sladosti: catSweets,
  molochnoe: catDairy,
  myasnoe: catMeat,
};

function Home() {
  const search = useSearchStore((s) => s.search);
  // Search runs server-side (the full catalog, not just the loaded page) —
  // debounce so typing doesn't fire a request per keystroke.
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  // useInfiniteQuery keys on debouncedSearch, so a new search term starts a
  // fresh query (back to page one) instead of appending to the old results;
  // already-fetched pages stay cached in data.pages and are never refetched
  // just to render — fetchNextPage() only ever asks for the next cursor.
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["products", debouncedSearch],
    queryFn: ({ pageParam }) => fetchCatalogProducts(debouncedSearch, pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  // Categories change rarely — a single unpaginated fetch, cached for a
  // while, is enough (unlike the product list above).
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: listCategories,
    staleTime: 5 * 60 * 1000,
  });

  // design.md — purely additive: the Hero below only changes if an admin
  // actually publishes an active banner; an empty result renders nothing.
  const { data: banners } = useQuery({
    queryKey: ["banners", "active"],
    queryFn: listActiveBanners,
    staleTime: 5 * 60 * 1000,
  });
  const banner = banners?.[0] ?? null;

  const products = useMemo(() => {
    const seen = new Set<string>();
    const merged: ShopifyProduct[] = [];
    for (const page of data?.pages ?? []) {
      for (const product of page.items) {
        if (seen.has(product.node.id)) continue;
        seen.add(product.node.id);
        merged.push(product);
      }
    }
    return merged;
  }, [data]);

  const [phone, setPhone] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [addressOpen, setAddressOpen] = useState(false);
  const { address, setAddress, setPaymentMethod, setCustomerPhone } = useCheckoutStore();

  const handleSaveAddress = () => {
    if (address.trim().length < 5) {
      toast.error("Введите полный адрес доставки");
      return;
    }
    setAddress(address.trim());
    toast.success("Адрес сохранён");
    setAddressOpen(false);
  };

  const normalizePhone = (raw: string) => raw.replace(/[^\d]/g, "");

  const buildMessage = (clientPhone: string) =>
    `Здравствуйте! Хочу подписаться на уведомления о статусе заказа. Мой номер: +${clientPhone}`;

  const handleSubscribe = (channel: "whatsapp" | "telegram") => {
    const clientPhone = normalizePhone(phone);
    if (clientPhone.length < 9) {
      toast.error("Введите корректный номер телефона");
      return;
    }
    const text = encodeURIComponent(buildMessage(clientPhone));
    const url =
      channel === "whatsapp"
        ? `https://wa.me/${CONTACT.whatsapp}?text=${text}`
        : `https://t.me/${CONTACT.telegram}?text=${text}`;
    window.open(url, "_blank", "noopener,noreferrer");
    toast.success("Отправьте сообщение — мы подпишем вас на уведомления");
    setDialogOpen(false);
    setPhone("");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 pt-16 pb-16 md:pt-24 md:pb-24 text-center">
          <div className="inline-block rounded-2xl bg-primary px-8 py-4 md:px-12 md:py-6 shadow-[var(--shadow-card)]">
            <h1 className="font-serif text-5xl md:text-7xl leading-[1.02] tracking-tight text-primary-foreground">
              «{BRAND.name}»
            </h1>
          </div>

          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <Button asChild size="lg" className="h-12 px-6 text-base rounded-full">
              <a href="#categories">Категории</a>
            </Button>
            <Button asChild size="lg" className="h-12 px-6 text-base rounded-full">
              <a href="#delivery">Доставка оплата и статус</a>
            </Button>
          </div>
        </div>

        {banner && (
          <div className="mx-auto max-w-4xl px-6 pb-16">
            <a
              href={banner.linkUrl ?? "#categories"}
              className="block overflow-hidden rounded-2xl border border-border/60 bg-card shadow-[var(--shadow-card)] transition-transform hover:-translate-y-1"
            >
              {banner.imageUrl && (
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  loading="lazy"
                  className="w-full max-h-64 object-cover"
                />
              )}
              <div className="p-6 text-center">
                <p className="font-serif text-2xl text-accent">{banner.title}</p>
                {banner.subtitle && <p className="mt-1 text-muted-foreground">{banner.subtitle}</p>}
              </div>
            </a>
          </div>
        )}
      </section>

      {/* Categories */}
      <section id="categories" className="mx-auto max-w-7xl px-6 py-16 w-full">
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          {(categories ?? []).map((c) => {
            const kgName = c.nameKg ?? KG_NAME_BY_SLUG[c.slug];
            const image = c.imageUrl || FALLBACK_IMAGE_BY_SLUG[c.slug];
            return (
              <a
                key={c.id}
                href="#products"
                className="group rounded-2xl border border-border/60 bg-card p-5 text-center transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-card)] hover:border-primary/40"
              >
                <div className="aspect-square w-full overflow-hidden rounded-xl bg-secondary/40">
                  {image ? (
                    <img
                      src={image}
                      alt={c.name}
                      loading="lazy"
                      width={512}
                      height={512}
                      className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                      Нет фото
                    </div>
                  )}
                </div>
                {kgName && <div className="mt-3 font-serif text-lg text-primary">{kgName}</div>}
                <div className={`font-serif text-lg text-accent ${kgName ? "mt-0.5" : "mt-3"}`}>
                  {c.name}
                </div>
              </a>
            );
          })}
        </div>
      </section>

      {/* Products */}
      <section id="products" className="mx-auto max-w-7xl px-6 py-12 w-full flex-1">
        <div className="mb-10">
          <h2 className="font-serif text-4xl md:text-5xl tracking-tight">Товары</h2>
          <p className="mt-2 text-muted-foreground">
            Свежие продукты с ценами и фото, с доставкой на дом.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border py-24 text-center">
            <div className="mx-auto h-14 w-14 rounded-full bg-secondary flex items-center justify-center mb-4">
              <ShoppingBasket className="h-6 w-6 text-primary" />
            </div>
            {debouncedSearch ? (
              <>
                <h3 className="font-serif text-2xl">Ничего не найдено</h3>
                <p className="mt-2 text-muted-foreground max-w-md mx-auto">
                  Попробуйте изменить запрос «{debouncedSearch}».
                </p>
              </>
            ) : (
              <>
                <h3 className="font-serif text-2xl">Каталог скоро наполнится</h3>
                <p className="mt-2 text-muted-foreground max-w-md mx-auto">
                  Под каждую категорию добавим товары с ценами и фотографиями.
                </p>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p.node.id} product={p} />
              ))}
            </div>
            {hasNextPage && (
              <div className="mt-10 flex justify-center">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 px-8 rounded-full"
                  onClick={() => void fetchNextPage()}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Показать ещё"
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Delivery & Payment */}
      <section id="delivery" className="mx-auto max-w-7xl px-6 pb-24 grid gap-6 md:grid-cols-3">
        <Dialog open={addressOpen} onOpenChange={setAddressOpen}>
          <DialogTrigger asChild>
            <button
              type="button"
              className="text-left rounded-2xl bg-card border border-border/60 p-8 transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-card)] hover:border-primary/40 cursor-pointer"
            >
              <div className="h-11 w-11 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Truck className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-serif text-2xl">Адрес доставки</h3>
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">Адрес доставки</DialogTitle>
              <DialogDescription>Укажите адрес, куда курьер привезёт ваш заказ.</DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveAddress();
              }}
              className="grid gap-4 mt-2"
            >
              <div className="grid gap-2">
                <Label htmlFor="delivery-address">Адрес</Label>
                <Input
                  id="delivery-address"
                  type="text"
                  autoComplete="street-address"
                  placeholder="г. Кант, ул. Ленина 12, кв. 5"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="h-12 rounded-full px-5"
                  maxLength={200}
                />
                <p className="text-xs text-muted-foreground">
                  Город, улица, дом, квартира и ориентир при необходимости.
                </p>
              </div>
              <Button type="submit" size="lg" className="h-14 rounded-full text-base">
                Сохранить адрес
              </Button>
            </form>
          </DialogContent>
        </Dialog>
        <Dialog>
          <DialogTrigger asChild>
            <button
              type="button"
              className="text-left rounded-2xl bg-card border border-border/60 p-8 transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-card)] hover:border-primary/40 cursor-pointer"
            >
              <div className="h-11 w-11 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <CreditCard className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-serif text-2xl">Способ оплаты</h3>
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">Выберите способ оплаты</DialogTitle>
              <DialogDescription>
                Оплатите онлайн заранее или наличными курьеру при получении.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 mt-2">
              <Button
                size="lg"
                className="h-14 rounded-full text-base"
                onClick={() => {
                  setPaymentMethod("ONLINE");
                  toast.info("Онлайн-оплата выбрана");
                }}
              >
                <CreditCard className="h-5 w-5" /> Оплата онлайн
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-14 rounded-full text-base"
                onClick={() => {
                  setPaymentMethod("CASH");
                  toast.success("Оплатите наличными курьеру при получении");
                }}
              >
                Оплата наличными
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <button
              type="button"
              className="text-left rounded-2xl bg-card border border-border/60 p-8 transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-card)] hover:border-primary/40 cursor-pointer"
            >
              <div className="h-11 w-11 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <MessageCircle className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-serif text-2xl">Уведомления о заказе</h3>
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">Получение уведомлений</DialogTitle>
              <DialogDescription>
                Укажите номер телефона и выберите удобный способ получения уведомлений о статусе
                заказа.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => e.preventDefault()} className="grid gap-4 mt-2">
              <div className="grid gap-2">
                <Label htmlFor="subscribe-phone">Номер телефона</Label>
                <Input
                  id="subscribe-phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="+996 555 123 456"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setCustomerPhone(e.target.value);
                  }}
                  className="h-12 rounded-full px-5"
                  maxLength={20}
                />
                <p className="text-xs text-muted-foreground">
                  Используется для WhatsApp или Telegram.
                </p>
              </div>
              <div className="grid gap-3">
                <Button
                  type="submit"
                  size="lg"
                  onClick={() => handleSubscribe("whatsapp")}
                  className="h-14 rounded-full bg-[#25D366] hover:bg-[#25D366]/90 text-white text-base"
                >
                  <MessageCircle className="h-5 w-5" /> Получать через WhatsApp
                </Button>
                <Button
                  type="button"
                  size="lg"
                  onClick={() => handleSubscribe("telegram")}
                  className="h-14 rounded-full bg-[#229ED9] hover:bg-[#229ED9]/90 text-white text-base"
                >
                  <Send className="h-5 w-5" /> Получать через Telegram
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </section>

      <SiteFooter />
    </div>
  );
}
