import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Bill } from "../types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatDate = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getDateLabel = (dateStr: string) => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const dayBefore = new Date(today);
  dayBefore.setDate(today.getDate() - 2);

  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const weekday = weekdays[date.getDay()];

  if (dateStr === formatDate(today)) return `${month}月${day}日 今天`;
  if (dateStr === formatDate(yesterday)) return `${month}月${day}日 昨天`;
  if (dateStr === formatDate(dayBefore)) return `${month}月${day}日 前天`;

  return `${month}月${day}日 ${weekday}`;
};

export const getShortDateLabel = (dateStr: string) => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const dayBefore = new Date(today);
  dayBefore.setDate(today.getDate() - 2);

  if (dateStr === formatDate(today)) return '今天';
  if (dateStr === formatDate(yesterday)) return '昨天';
  if (dateStr === formatDate(dayBefore)) return '前天';
  return dateStr;
};

export interface DateGroup {
  date: string;
  bills: Bill[];
  totalIncome: number;
  totalExpense: number;
}

export const groupBillsByDate = (bills: Bill[]): DateGroup[] => {
  const groups: Record<string, Bill[]> = {};
  bills.forEach(bill => {
    if (!groups[bill.date]) {
      groups[bill.date] = [];
    }
    groups[bill.date].push(bill);
  });

  const sortedDates = Object.keys(groups).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return sortedDates.map(date => ({
    date,
    bills: groups[date],
    totalIncome: groups[date].filter(b => b.type === 'income').reduce((sum, b) => sum + b.amount, 0),
    totalExpense: groups[date].filter(b => b.type === 'expense').reduce((sum, b) => sum + b.amount, 0),
  }));
};

export const filterBillsByDate = (
  bills: Bill[],
  year: number,
  month: number | null
): Bill[] => {
  return bills.filter(b => {
    const [y, m] = b.date.split('-').map(Number);
    if (y !== year) return false;
    if (month !== null && m !== month) return false;
    return true;
  });
};

export const filterBillsByWallet = (bills: Bill[], walletId: string): Bill[] => {
  if (walletId === 'default') {
    return bills.filter(b => !b.walletId || b.walletId === 'default');
  }
  return bills.filter(b => b.walletId === walletId);
};
