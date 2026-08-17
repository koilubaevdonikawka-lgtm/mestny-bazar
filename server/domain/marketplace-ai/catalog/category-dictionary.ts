export interface CategoryRule {
  categorySlug: string;
  categoryName: string;
  keywords: string[];
  subcategories: Array<{
    subcategorySlug: string;
    subcategoryName: string;
    keywords: string[];
  }>;
}

/** Rule-based category dictionary — no LLM. */
export const CATEGORY_DICTIONARY: CategoryRule[] = [
  {
    categorySlug: "flour",
    categoryName: "Мука",
    keywords: ["мука", "ун", "flour", "булоч", "тесто"],
    subcategories: [
      {
        subcategorySlug: "wheat-flour",
        subcategoryName: "Пшеничная мука",
        keywords: ["пшен", "wheat"],
      },
      { subcategorySlug: "rye-flour", subcategoryName: "Ржаная мука", keywords: ["ржан", "rye"] },
    ],
  },
  {
    categorySlug: "produce",
    categoryName: "Фрукты и овощи",
    keywords: [
      "овощ",
      "фрукт",
      "картоф",
      "лук",
      "морков",
      "яблок",
      "банан",
      "помидор",
      "огур",
      "зелень",
      "жашылча",
    ],
    subcategories: [
      {
        subcategorySlug: "vegetables",
        subcategoryName: "Овощи",
        keywords: ["овощ", "картоф", "лук", "морков", "огур", "помидор"],
      },
      {
        subcategorySlug: "fruits",
        subcategoryName: "Фрукты",
        keywords: ["фрукт", "яблок", "банан", "апельс", "груш"],
      },
      {
        subcategorySlug: "greens",
        subcategoryName: "Зелень",
        keywords: ["зелень", "укроп", "петруш", "салат"],
      },
    ],
  },
  {
    categorySlug: "oils",
    categoryName: "Масла",
    keywords: ["масло", "май", "oil", "олив", "подсолнеч"],
    subcategories: [
      {
        subcategorySlug: "sunflower-oil",
        subcategoryName: "Подсолнечное масло",
        keywords: ["подсолнеч"],
      },
      { subcategorySlug: "olive-oil", subcategoryName: "Оливковое масло", keywords: ["олив"] },
    ],
  },
  {
    categorySlug: "drinks",
    categoryName: "Напитки",
    keywords: ["напит", "сок", "вода", "чай", "кофе", "лимонад", "суусундук", "drink"],
    subcategories: [
      { subcategorySlug: "juice", subcategoryName: "Соки", keywords: ["сок", "juice"] },
      { subcategorySlug: "water", subcategoryName: "Вода", keywords: ["вода", "water"] },
      {
        subcategorySlug: "tea-coffee",
        subcategoryName: "Чай и кофе",
        keywords: ["чай", "кофе", "tea", "coffee"],
      },
    ],
  },
  {
    categorySlug: "sweets",
    categoryName: "Сладости",
    keywords: ["слад", "конфет", "шоколад", "печень", "торт", "варень", "мёд", "мед"],
    subcategories: [
      {
        subcategorySlug: "chocolate",
        subcategoryName: "Шоколад",
        keywords: ["шоколад", "chocolate"],
      },
      { subcategorySlug: "cookies", subcategoryName: "Печенье", keywords: ["печень", "cookie"] },
      { subcategorySlug: "candy", subcategoryName: "Конфеты", keywords: ["конфет", "candy"] },
    ],
  },
  {
    categorySlug: "pickles",
    categoryName: "Острокислое",
    keywords: ["солен", "марин", "кисл", "огур", "капуст", "pickle"],
    subcategories: [
      {
        subcategorySlug: "pickled-vegetables",
        subcategoryName: "Соленья",
        keywords: ["солен", "огур", "капуст"],
      },
      { subcategorySlug: "marinades", subcategoryName: "Маринады", keywords: ["марин"] },
    ],
  },
  {
    categorySlug: "dairy",
    categoryName: "Молочное",
    keywords: ["молок", "сыр", "сметан", "йогурт", "творог", "кефир", "сүт", "dairy"],
    subcategories: [
      { subcategorySlug: "milk", subcategoryName: "Молоко", keywords: ["молок", "milk"] },
      { subcategorySlug: "cheese", subcategoryName: "Сыр", keywords: ["сыр", "cheese"] },
      {
        subcategorySlug: "yogurt",
        subcategoryName: "Йогурт и кефир",
        keywords: ["йогурт", "кефир", "творог"],
      },
    ],
  },
  {
    categorySlug: "eggs",
    categoryName: "Яйца",
    keywords: ["яйц", "жумуртка", "egg"],
    subcategories: [
      {
        subcategorySlug: "chicken-eggs",
        subcategoryName: "Куриные яйца",
        keywords: ["курин", "яйц"],
      },
    ],
  },
  {
    categorySlug: "meat",
    categoryName: "Мясное",
    keywords: ["мясо", "говяд", "свин", "куриц", "колбас", "сосиск", "эт", "meat"],
    subcategories: [
      {
        subcategorySlug: "poultry",
        subcategoryName: "Птица",
        keywords: ["куриц", "индейк", "утк"],
      },
      {
        subcategorySlug: "beef-pork",
        subcategoryName: "Говядина и свинина",
        keywords: ["говяд", "свин"],
      },
      { subcategorySlug: "sausages", subcategoryName: "Колбасы", keywords: ["колбас", "сосиск"] },
    ],
  },
];

export const STOP_WORDS = new Set([
  "и",
  "в",
  "на",
  "с",
  "для",
  "из",
  "по",
  "the",
  "a",
  "an",
  "kg",
  "г",
  "гр",
  "л",
  "мл",
  "шт",
]);
