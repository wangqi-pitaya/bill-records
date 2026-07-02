import { Category } from '../types';
import { loadCategories } from '../utils/storage';

export const getDefaultCategories = (): Category[] => loadCategories();

export const getExpenseCategories = (categories: Category[]): Category[] => 
  categories.filter(c => c.type === 'expense');

export const getIncomeCategories = (categories: Category[]): Category[] => 
  categories.filter(c => c.type === 'income');

export const availableIcons = [
  'UtensilsCrossed', 'Car', 'ShoppingBag', 'Gamepad2', 'Home', 
  'Heart', 'GraduationCap', 'MoreHorizontal', 'Briefcase', 'Gift',
  'TrendingUp', 'Clock', 'PlusCircle', 'Plane', 'Coffee', 'Book',
  'Music', 'Smartphone', 'Wifi', 'CreditCard', 'DollarSign',
  'Wallet', 'PiggyBank', 'Receipt', 'ShoppingCart', 'GiftCard',
  'Beer', 'Wine', 'Pizza', 'IceCream', 'Cake', 'Apple'
];