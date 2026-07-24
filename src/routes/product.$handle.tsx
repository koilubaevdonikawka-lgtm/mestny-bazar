import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Plus } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cartStore";
import {
  STOREFRONT_PRODUCT_BY_HANDLE_QUERY,
  storefrontApiRequest,
} from "@/lib/shopify";

interface ProductNode {
  id: string;
  title: string;
  description: string;
  handle: string;
  priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
  images: { edges: Array<{ node: { url: string; altText: string | null } }> };
  variants: {
    edges: Array<{
      node: {
        id: string;
        title: string;
        price: { amount: string; currencyCode: string };
        availableForSale: boolean;
        selectedOptions: Array<{ name: string; value: string }>;
      };
    }>;
  };
  options: Array<{ name: string; values: string[] }>;
}

async function fetchProduct(handle: string): Promise<ProductNode | null> {
  const data = await storefrontApiRequest(STOREFRONT_PRODUCT_BY_HANDLE_QUERY, { handle });
  return data?.data?.product ?? null;
}

export const Route = createFileRoute("/product/$handle")({
  component: ProductPage,
  head: ({ params }) => ({
    meta: [
      { title: `${params.handle} — Свежий Двор` },
      { name: "description", content: `Купить ${params.handle} с доставкой в Свежем Дворе.` },
    ],
  }),
  errorComponent: ({ error, reset }) => (
    <div className="min-h-screen flex items-center justify-center p-6 text-center">
      <div>
        <h2 className="font-serif text-2xl">Не удалось загрузить продукт</h2>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <Button onClick={reset} className="mt-6">Повторить</Button>
      </div>
    </div>
  ),
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center p-6 text-center">
      <div>
        <h2 className="font-serif text-3xl">Продукт не найден</h2>
        <Button asChild className="mt-6"><Link to="/">На главную</Link></Button>
      </div>
    </div>
  ),
});

function ProductPage() {
  const { handle } = Route.useParams();
  const addItem = useCartStore((s) => s.addItem);
  const isLoading = useCartStore((s) => s.isLoading);

  const { data: product, isLoading: loading } = useQuery({
    queryKey: ["product", handle],
    queryFn: async () => {
      const p = await fetchProduct(handle);
      if (!p) throw notFound();
      return p;
    },
  });

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!product) return null;

  const variant = product.variants.edges[0]?.node;
  const image = product.images.edges[0]?.node;
  const price = product.priceRange.minVariantPrice;

  const handleAdd = async () => {
    if (!variant) return;
    await addItem({
      product: { node: product },
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions || [],
    });
    toast.success("Добавлено в корзину", { description: product.title, position: "top-center" });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 mx-auto max-w-6xl px-6 py-12 w-full">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4" /> Назад в каталог
        </Link>
        <div className="grid gap-12 md:grid-cols-2">
          <div className="aspect-square rounded-[2rem] overflow-hidden bg-secondary">
            {image ? (
              <img src={image.url} alt={image.altText || product.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">Нет фото</div>
            )}
          </div>
          <div>
            <h1 className="font-serif text-4xl md:text-5xl tracking-tight">{product.title}</h1>
            <div className="mt-4 font-serif text-3xl text-primary">
              {parseFloat(price.amount).toFixed(2)} {price.currencyCode}
            </div>
            {product.description && (
              <p className="mt-6 text-muted-foreground leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            )}
            <Button
              onClick={handleAdd}
              disabled={isLoading || !variant || !variant.availableForSale}
              size="lg"
              className="mt-8 h-12 px-8 rounded-full text-base"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4 mr-2" /> В корзину</>}
            </Button>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
