import { create } from 'zustand';
import { Category, BillType } from '../types';
import { loadCategories, saveCategories } from '../utils/storage';

interface CategoryStore {
  categories: Category[];
  addCategory: (category: Omit<Category, 'id'>) => void;
  deleteCategory: (id: string) => boolean;
  getCategoriesByType: (type: BillType) => Category[];
  isCategoryUsed: (categoryName: string) => boolean;
}

export const useCategoryStore = create<CategoryStore>((set, get) => ({
  categories: loadCategories(),

  addCategory: (category) => {
    const newCategory: Category = {
      ...category,
      id: Date.now().toString(),
    };
    const updatedCategories = [...get().categories, newCategory];
    set({ categories: updatedCategories });
    saveCategories(updatedCategories);
  },

  deleteCategory: (id) => {
    const category = get().categories.find(c => c.id === id);
    if (!category) return false;
    
    const bills = JSON.parse(localStorage.getItem('bill_records') || '[]');
    const isUsed = bills.some((b: { category: string }) => b.category === category.name);
    
    if (isUsed) return false;
    
    const updatedCategories = get().categories.filter(c => c.id !== id);
    set({ categories: updatedCategories });
    saveCategories(updatedCategories);
    return true;
  },

  getCategoriesByType: (type) => {
    return get().categories.filter(c => c.type === type);
  },

  isCategoryUsed: (categoryName) => {
    const bills = JSON.parse(localStorage.getItem('bill_records') || '[]');
    return bills.some((b: { category: string }) => b.category === categoryName);
  },
}));