import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Taro from '@tarojs/taro';
import { Bill, DateGroup } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getStorage<T>(key: string, defaultValue: T): T {
  try {
    const value = Taro.getStorageSync<T>(key);
    return value !== undefined ? value : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setStorage<T>(key: string, value: T): void {
  try {
    Taro.setStorageSync(key, value);
  } catch (e) {
    console.error('Storage set error:', e);
  }
}

export function removeStorage(key: string): void {
  try {
    Taro.removeStorageSync(key);
  } catch (e) {
    console.error('Storage remove error:', e);
  }
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

export const groupBillsByDate = (bills: Bill[]): DateGroup[] => {
  const groups: Record<string, Bill[]> = {};
  bills.forEach((bill) => {
    if (!groups[bill.date]) {
      groups[bill.date] = [];
    }
    groups[bill.date].push(bill);
  });

  const sortedDates = Object.keys(groups).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  return sortedDates.map((date) => ({
    date,
    bills: groups[date],
    totalIncome: groups[date]
      .filter((b) => b.type === 'income')
      .reduce((sum, b) => sum + b.amount, 0),
    totalExpense: groups[date]
      .filter((b) => b.type === 'expense')
      .reduce((sum, b) => sum + b.amount, 0),
  }));
};

export const filterBillsByDate = (
  bills: Bill[],
  year: number,
  month: number | null
): Bill[] => {
  return bills.filter((b) => {
    const [y, m] = b.date.split('-').map(Number);
    if (y !== year) return false;
    if (month !== null && m !== month) return false;
    return true;
  });
};

export const filterBillsByWallet = (bills: Bill[], walletId: string): Bill[] => {
  if (walletId === 'default') {
    return bills.filter((b) => !b.walletId || b.walletId === 'default');
  }
  return bills.filter((b) => b.walletId === walletId);
};

export const formatMoney = (value: number, decimals: number = 2): string => {
  if (isNaN(value)) return '0.00';
  const fixed = value.toFixed(decimals);
  const [intPart, decPart] = fixed.split('.');
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return decPart !== undefined ? `${formattedInt}.${decPart}` : formattedInt;
};

export const getDateRangeByPreset = (
  preset: 'all' | 'thisMonth' | 'lastMonth' | 'thisYear' | 'lastYear' | 'custom',
  startDate?: string,
  endDate?: string
) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  switch (preset) {
    case 'thisMonth': {
      const start = new Date(year, month, 1);
      const end = new Date(year, month + 1, 0);
      return { start: formatDate(start), end: formatDate(end) };
    }
    case 'lastMonth': {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0);
      return { start: formatDate(start), end: formatDate(end) };
    }
    case 'thisYear': {
      const start = new Date(year, 0, 1);
      const end = new Date(year, 11, 31);
      return { start: formatDate(start), end: formatDate(end) };
    }
    case 'lastYear': {
      const start = new Date(year - 1, 0, 1);
      const end = new Date(year - 1, 11, 31);
      return { start: formatDate(start), end: formatDate(end) };
    }
    case 'custom':
      return { start: startDate || '', end: endDate || '' };
    default:
      return { start: '', end: '' };
  }
};
