import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Активная основная категория на главной странице — вынесена из локального
 * useState в Home, который сбрасывался на null при каждом размонтировании
 * (переход на страницу товара/товаров и возврат обратно). persist в
 * localStorage — тот же паттерн, что checkoutStore — переживает и обычную
 * SPA-навигацию, и полную перезагрузку страницы.
 */
interface CategoryStore {
  activeCategoryId: string | null;
  setActiveCategoryId: (id: string | null) => void;
}

export const useCategoryStore = create<CategoryStore>()(
  persist(
    (set) => ({
      activeCategoryId: null,
      setActiveCategoryId: (activeCategoryId) => set({ activeCategoryId }),
    }),
    {
      name: "platform-active-category",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ activeCategoryId: state.activeCategoryId }),
    },
  ),
);
