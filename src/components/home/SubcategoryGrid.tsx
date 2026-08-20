import { SubcategoryCard } from "@/components/home/SubcategoryCard";

export interface SubcategoryGridItem {
  id: string;
  slug: string;
  name: string;
  imageUrl: string | null;
}

export interface SubcategoryGridProps {
  categorySlug: string;
  subcategories: SubcategoryGridItem[];
}

/** Вертикальная сетка подкатегорий выбранной основной категории — ровно 2
 * колонки (не адаптивно расширяется на больших экранах — так явно
 * потребовал Этап: трёхуровневая навигация), со своей прокруткой
 * (`overflow-y-auto` + `max-height`), не растягивающая страницу целиком,
 * если подкатегорий много. */
export function SubcategoryGrid({ categorySlug, subcategories }: SubcategoryGridProps) {
  return (
    // Этап: убрать лишний отступ между рядами карточек (было gap-4=16px и
    // по вертикали, и по горизонтали, измерено на проде) — только
    // вертикальный (между рядами) сужен до gap-y-2=8px; горизонтальный
    // (между двумя карточками одного ряда) не размечен, оставлен gap-x-4.
    <div className="grid grid-cols-2 gap-x-4 gap-y-2 max-h-[65vh] overflow-y-auto p-1">
      {subcategories.map((sub) => (
        <SubcategoryCard
          key={sub.id}
          categorySlug={categorySlug}
          subcategorySlug={sub.slug}
          name={sub.name}
          imageUrl={sub.imageUrl}
        />
      ))}
    </div>
  );
}
