import { Bill } from '../types';

const STORAGE_KEY = 'bill_records';

const mockBills: Bill[] = [
  { id: '1', type: 'expense', category: '餐饮', icon: 'UtensilsCrossed', amount: 35.5, note: '午餐', date: '2026-07-02', timestamp: Date.now() - 86400000 },
  { id: '2', type: 'income', category: '工资', icon: 'Briefcase', amount: 15000, note: '七月工资', date: '2026-07-01', timestamp: Date.now() - 172800000 },
  { id: '3', type: 'expense', category: '交通', icon: 'Car', amount: 20, note: '打车', date: '2026-07-01', timestamp: Date.now() - 172800000 + 3600000 },
  { id: '4', type: 'expense', category: '购物', icon: 'ShoppingBag', amount: 299, note: '衣服', date: '2026-06-30', timestamp: Date.now() - 259200000 },
  { id: '5', type: 'income', category: '兼职', icon: 'Clock', amount: 500, note: '周末兼职', date: '2026-06-29', timestamp: Date.now() - 345600000 },
  { id: '6', type: 'expense', category: '娱乐', icon: 'Gamepad2', amount: 128, note: '电影票', date: '2026-06-28', timestamp: Date.now() - 432000000 },
  { id: '7', type: 'expense', category: '居住', icon: 'Home', amount: 3500, note: '房租', date: '2026-06-25', timestamp: Date.now() - 691200000 },
];

export const loadBills = (): Bill[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
    saveBills(mockBills);
    return mockBills;
  } catch {
    return mockBills;
  }
};

export const saveBills = (bills: Bill[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bills));
  } catch {
    console.error('Failed to save bills');
  }
};