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

export const defaultWallets = [
  {
    id: 'default',
    name: '日常账本',
    description: '记录日常生活开支和收入',
    color: '#10b981',
    isDefault: true,
  },
];
