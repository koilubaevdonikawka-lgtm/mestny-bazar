import { CartDrawer } from "./CartDrawer";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useSearchStore } from "@/stores/searchStore";

export function SiteHeader() {
  const { search, setSearch } = useSearchStore();

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/80 border-b border-border/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center gap-3">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            inputMode="search"
            placeholder="Поиск продукта…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 rounded-full pl-11 pr-5"
            aria-label="Поиск продукта"
          />
        </div>
        <nav className="hidden lg:flex items-center gap-6 text-sm">
          <a href="#categories" className="hover:text-primary transition-colors">
            Категории
          </a>
          <a href="#products" className="hover:text-primary transition-colors">
            Товары
          </a>
          <a href="#delivery" className="hover:text-primary transition-colors">
            Доставка
          </a>
        </nav>
        <CartDrawer />
      </div>
    </header>
  );
}
