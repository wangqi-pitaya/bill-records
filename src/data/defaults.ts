import { Category, Wallet } from '../types';

export const defaultCategories: Category[] = [
  // 支出
  { id: 'exp-1', name: '餐饮', icon: 'UtensilsCrossed', type: 'expense' },
  { id: 'exp-2', name: '交通', icon: 'Car', type: 'expense' },
  { id: 'exp-3', name: '购物', icon: 'ShoppingBag', type: 'expense' },
  { id: 'exp-4', name: '娱乐', icon: 'Gamepad2', type: 'expense' },
  { id: 'exp-5', name: '居住', icon: 'Home', type: 'expense' },
  { id: 'exp-6', name: '医疗', icon: 'Heart', type: 'expense' },
  { id: 'exp-7', name: '教育', icon: 'GraduationCap', type: 'expense' },
  { id: 'exp-8', name: '其他', icon: 'MoreHorizontal', type: 'expense' },
  // 收入
  { id: 'inc-1', name: '工资', icon: 'Briefcase', type: 'income' },
  { id: 'inc-2', name: '奖金', icon: 'Gift', type: 'income' },
  { id: 'inc-3', name: '投资', icon: 'TrendingUp', type: 'income' },
  { id: 'inc-4', name: '兼职', icon: 'Clock', type: 'income' },
  { id: 'inc-5', name: '其他', icon: 'MoreHorizontal', type: 'income' },
];

export const defaultWallets: Wallet[] = [
  {
    id: 'default',
    name: '默认账本',
    description: '日常收支',
    color: '#10b981',
    isDefault: true,
  },
];
