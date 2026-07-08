import { create } from 'zustand';
import { Category, BillType } from '../types';
import { defaultCategories } from '../data/defaults';
import { generateId } from '../lib/utils';
import { taroPersist } from './taroPersist';
import { useBillStore } from './useBillStore';

interface CategoryStore {
  categories: Category[];
  addCategory: (category: Omit<Category, 'id'>) => void;
  deleteCategory: (id: string) => boolean;
  reorderCategories: (type: BillType, newOrder: Category[]) => void;
  getCategoriesByType: (type: BillType) => Category[];
  isCategoryUsed: (categoryName: string) => boolean;
}

export const useCategoryStore = create<CategoryStore>()(
  taroPersist(
    (set, get) => ({
      categories: defaultCategories,

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
        const isUsed = bills.some((b) => b.category === category.name);

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

      getCategoriesByType: (type) => {
        return get().categories.filter((c) => c.type === type);
      },

      isCategoryUsed: (categoryName) => {
        const bills = useBillStore.getState().bills;
        return bills.some((b) => b.category === categoryName);
      },
    }),
    {
      name: 'categories',
    }
  )
);
