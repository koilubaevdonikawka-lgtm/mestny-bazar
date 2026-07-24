import { Store } from "lucide-react";
import { BRAND } from "@/config/brand";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-secondary/40 mt-24">
      <div className="mx-auto max-w-7xl px-6 py-12 grid gap-8 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
              <Store className="h-4 w-4" />
            </span>
            <span className="font-serif text-xl">{BRAND.name}</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground max-w-xs">
            Продукты с доставкой. Оплата через Finik.
          </p>
        </div>
        <div className="text-sm">
          <h4 className="font-medium mb-3">Магазин</h4>
          <ul className="space-y-2 text-muted-foreground">
            <li>Категории</li>
            <li>Товары</li>
            <li>Доставка</li>
          </ul>
        </div>
        <div className="text-sm">
          <h4 className="font-medium mb-3">Контакты</h4>
          <ul className="space-y-2 text-muted-foreground">
            <li>Пн–Вс, 8:00–22:00</li>
            <li>Оплата: Finik</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto max-w-7xl px-6 py-4 text-xs text-muted-foreground">
          © {new Date().getFullYear()} {BRAND.name}. Все права защищены.
        </div>
      </div>
    </footer>
  );
}
