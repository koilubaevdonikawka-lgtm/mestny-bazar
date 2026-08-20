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
 * потребовал Этап: трёхуровневая навигация). Растёт на свою полную
 * естественную высоту — прокручивается страница целиком одним общим
 * скроллом (Этап: убрать пустую область под сеткой), без отдельного
 * вложенного скролл-контейнера внутри неё, как было раньше
 * (max-h-[65vh] overflow-y-auto — измерено на проде: реальный контент
 * 669px обрезался до 533px, а сама страница при этом вообще не
 * скроллилась, потому что клампился именно внутренний блок, а не
 * что-то, что растягивало бы страницу целиком). */
export function SubcategoryGrid({ categorySlug, subcategories }: SubcategoryGridProps) {
  return (
    // Этап: убрать лишний отступ между рядами карточек (было gap-4=16px и
    // по вертикали, и по горизонтали, измерено на проде) — только
    // вертикальный (между рядами) сужен до gap-y-2=8px; горизонтальный
    // (между двумя карточками одного ряда) не размечен, оставлен gap-x-4.
    // p-1 убран вместе с overflow-y-auto — держал отступ только под тень/
    // фокус-рамку карточек внутри вложенного скролл-бокса, которого
    // больше нет; секция-обёртка в index.tsx ничего не обрезает
    // (нет overflow-hidden), так что тени карточек больше не рискуют
    // обрезаться и без этого паддинга.
    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
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
