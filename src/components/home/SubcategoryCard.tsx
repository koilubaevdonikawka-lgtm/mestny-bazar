import { Link } from "@tanstack/react-router";
import { useTranslation } from "@/i18n/LanguageProvider";

export interface SubcategoryCardProps {
  categorySlug: string;
  subcategorySlug: string;
  name: string;
  imageUrl: string | null;
}

/** Карточка подкатегории — фото сверху (или плейсхолдер "Нет фото"),
 * название снизу. Ведёт на страницу товаров подкатегории
 * (`/category/$categorySlug/subcategory/$subcategorySlug`), не на
 * `/category/$slug` напрямую — Этап: трёхуровневая навигация. */
export function SubcategoryCard({
  categorySlug,
  subcategorySlug,
  name,
  imageUrl,
}: SubcategoryCardProps) {
  const { t } = useTranslation();

  return (
    <Link
      to="/category/$categorySlug/subcategory/$subcategorySlug"
      params={{ categorySlug, subcategorySlug }}
      className="group overflow-hidden rounded-2xl border border-border/60 bg-card text-center transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)] hover:border-primary/40"
    >
      <div className="aspect-square w-full overflow-hidden rounded-t-2xl bg-secondary/40">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            loading="lazy"
            width={512}
            height={512}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
            {t("common.noPhoto")}
          </div>
        )}
      </div>
      <div className="px-4 pt-2 pb-4 font-serif text-base leading-tight text-primary line-clamp-2">
        {name}
      </div>
    </Link>
  );
}
