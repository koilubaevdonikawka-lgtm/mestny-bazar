import { create } from "zustand";

/**
 * Активная основная категория на главной странице — вынесена из локального
 * useState в Home, который сбрасывался на null при каждом размонтировании
 * (переход на страницу товара/товаров и возврат обратно). Обычный in-memory
 * Zustand-стор (без persist) уже сам по себе переживает такую SPA-навигацию —
 * состояние модуля живёт, пока жив JS-процесс вкладки/приложения.
 *
 * Раньше здесь был persist в localStorage (тот же паттерн, что
 * checkoutStore) — намеренно убран: реальное тестирование на телефоне
 * показало, что ОС может полностью убить процесс приложения при
 * длительном сворачивании, и следующий запуск — это fresh mount,
 * неотличимый от обычной перезагрузки страницы. Persisted activeCategoryId
 * в этом случае восстанавливал последний выбор пользователя вместо первой
 * категории слева (ожидаемое поведение при каждом новом входе — см.
 * defaultCategoryId в src/routes/index.tsx). Живой JS-процесс, свернутый и
 * развёрнутый без убийства ОС, покрывается отдельно —
 * useResetOnAppForeground (src/hooks/useResetOnAppForeground.ts) сбрасывает
 * выбор на возврат из фона, пока persist ещё был нужен как единственная
 * защита от полного перезапуска; теперь этот случай закрыт тем, что
 * persisted-состояния для этого поля просто больше не существует.
 */
interface CategoryStore {
  activeCategoryId: string | null;
  setActiveCategoryId: (id: string | null) => void;
}

export const useCategoryStore = create<CategoryStore>()((set) => ({
  activeCategoryId: null,
  setActiveCategoryId: (activeCategoryId) => set({ activeCategoryId }),
}));
