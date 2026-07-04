import { Bill, Category } from '../types';

export const defaultCategories: Category[] = [
  { id: 'food', name: '餐饮', icon: 'UtensilsCrossed', type: 'expense' },
  { id: 'transport', name: '交通', icon: 'Car', type: 'expense' },
  { id: 'shopping', name: '购物', icon: 'ShoppingBag', type: 'expense' },
  { id: 'entertainment', name: '娱乐', icon: 'Gamepad2', type: 'expense' },
  { id: 'housing', name: '居住', icon: 'Home', type: 'expense' },
  { id: 'medical', name: '医疗', icon: 'Heart', type: 'expense' },
  { id: 'education', name: '教育', icon: 'GraduationCap', type: 'expense' },
  { id: 'other_expense', name: '其他', icon: 'MoreHorizontal', type: 'expense' },

  { id: 'salary', name: '工资', icon: 'Briefcase', type: 'income' },
  { id: 'bonus', name: '奖金', icon: 'Gift', type: 'income' },
  { id: 'investment', name: '投资', icon: 'TrendingUp', type: 'income' },
  { id: 'parttime', name: '兼职', icon: 'Clock', type: 'income' },
  { id: 'other_income', name: '其他', icon: 'PlusCircle', type: 'income' },
];

export const defaultBills: Bill[] = [
  { id: '1', type: 'expense', category: '餐饮', icon: 'UtensilsCrossed', amount: 35.5, note: '午餐', date: '2026-07-02', timestamp: Date.now() - 86400000 },
  { id: '2', type: 'income', category: '工资', icon: 'Briefcase', amount: 15000, note: '七月工资', date: '2026-07-01', timestamp: Date.now() - 172800000 },
  { id: '3', type: 'expense', category: '交通', icon: 'Car', amount: 20, note: '打车', date: '2026-07-01', timestamp: Date.now() - 172800000 + 3600000 },
  { id: '4', type: 'expense', category: '购物', icon: 'ShoppingBag', amount: 299, note: '衣服', date: '2026-06-30', timestamp: Date.now() - 259200000 },
  { id: '5', type: 'income', category: '兼职', icon: 'Clock', amount: 500, note: '周末兼职', date: '2026-06-29', timestamp: Date.now() - 345600000 },
  { id: '6', type: 'expense', category: '娱乐', icon: 'Gamepad2', amount: 128, note: '电影票', date: '2026-06-28', timestamp: Date.now() - 432000000 },
  { id: '7', type: 'expense', category: '居住', icon: 'Home', amount: 3500, note: '房租', date: '2026-06-25', timestamp: Date.now() - 691200000 },
];

export const defaultWallets = [
  {
    id: 'default',
    name: '日常账本',
    description: '记录日常生活开支和收入',
    color: '#10b981',
    isDefault: true,
  },
];
