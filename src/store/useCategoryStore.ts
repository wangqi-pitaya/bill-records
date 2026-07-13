import { create } from 'zustand';
import { Category, BillType } from '../types';
import { defaultCategories } from '../data/defaults';
import { generateId } from '../lib/utils';
import { taroPersist } from './taroPersist';
import { useBillStore } from './useBillStore';

interface CategoryStore {
  categories: Category[];
  setCategories: (categories: Category[]) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  deleteCategory: (id: string) => boolean;
  reorderCategories: (type: BillType, newOrder: Category[]) => void;
  moveCategoryUp: (id: string, type: BillType) => void;
  moveCategoryDown: (id: string, type: BillType) => void;
  getCategoriesByType: (type: BillType) => Category[];
  isCategoryUsed: (categoryId: string) => boolean;
}

export const useCategoryStore = create<CategoryStore>()(
  taroPersist(
    (set, get) => ({
      categories: defaultCategories,

      setCategories: (categories) => {
        set({ categories });
      },

      addCategory: (category) => {
        const newCategory: Category = {
          ...category,
          id: generateId(),
        };
        const updatedCategories = [...get().categories, newCategory];
        set({ categories: updatedCategories });
      },

      deleteCategory: (id) => {
        const category = get().categories.find((c) => c.id === id);
        if (!category) return false;

        const bills = useBillStore.getState().bills;
        const isUsed = bills.some((b) => b.categoryId === category.id);

        if (isUsed) return false;

        const updatedCategories = get().categories.filter((c) => c.id !== id);
        set({ categories: updatedCategories });
        return true;
      },

      reorderCategories: (type, newOrder) => {
        const otherCategories = get().categories.filter((c) => c.type !== type);
        const updatedCategories = [...otherCategories, ...newOrder];
        set({ categories: updatedCategories });
      },

      moveCategoryUp: (id, type) => {
        const typedCategories = get().categories.filter((c) => c.type === type);
        const index = typedCategories.findIndex((c) => c.id === id);
        if (index <= 0) return;
        const newOrder = [...typedCategories];
        [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
        const otherCategories = get().categories.filter((c) => c.type !== type);
        set({ categories: [...otherCategories, ...newOrder] });
      },

      moveCategoryDown: (id, type) => {
        const typedCategories = get().categories.filter((c) => c.type === type);
        const index = typedCategories.findIndex((c) => c.id === id);
        if (index === -1 || index >= typedCategories.length - 1) return;
        const newOrder = [...typedCategories];
        [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
        const otherCategories = get().categories.filter((c) => c.type !== type);
        set({ categories: [...otherCategories, ...newOrder] });
      },

      getCategoriesByType: (type) => {
        return get().categories.filter((c) => c.type === type);
      },

      isCategoryUsed: (categoryId) => {
        const bills = useBillStore.getState().bills;
        return bills.some((b) => b.categoryId === categoryId);
      },
    }),
    {
      name: 'categories',
    }
  )
);
