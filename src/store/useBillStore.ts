import { create } from 'zustand';
import { Bill } from '../types';
import { loadBills, saveBills } from '../utils/storage';

interface BillStore {
  bills: Bill[];
  addBill: (bill: Omit<Bill, 'id' | 'timestamp'>) => void;
  deleteBill: (id: string) => void;
  updateBill: (id: string, bill: Omit<Bill, 'id' | 'timestamp'>) => void;
  getBillById: (id: string) => Bill | undefined;
  getStatistics: () => { income: number; expense: number; balance: number };
  clearBillsByWalletId: (walletId: string) => void;
  migrateBills: (fromWalletId: string, toWalletId: string) => void;
}

export const useBillStore = create<BillStore>((set, get) => ({
  bills: loadBills(),
  
  addBill: (bill) => {
    const newBill: Bill = {
      ...bill,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };
    const updatedBills = [newBill, ...get().bills];
    set({ bills: updatedBills });
    saveBills(updatedBills);
  },
  
  deleteBill: (id) => {
    const updatedBills = get().bills.filter(b => b.id !== id);
    set({ bills: updatedBills });
    saveBills(updatedBills);
  },

  updateBill: (id, bill) => {
    const updatedBills = get().bills.map(b =>
      b.id === id ? { ...b, ...bill } : b
    );
    set({ bills: updatedBills });
    saveBills(updatedBills);
  },

  getBillById: (id) => {
    return get().bills.find(b => b.id === id);
  },

  getStatistics: () => {
    const { bills } = get();
    const income = bills
      .filter(b => b.type === 'income')
      .reduce((sum, b) => sum + b.amount, 0);
    const expense = bills
      .filter(b => b.type === 'expense')
      .reduce((sum, b) => sum + b.amount, 0);
    return { income, expense, balance: income - expense };
  },

  clearBillsByWalletId: (walletId: string) => {
    const updatedBills = get().bills.filter(b => b.walletId !== walletId);
    set({ bills: updatedBills });
    saveBills(updatedBills);
  },

  migrateBills: (fromWalletId: string, toWalletId: string) => {
    const updatedBills = get().bills.map(b => {
      if (fromWalletId === 'default') {
        if (!b.walletId || b.walletId === 'default') {
          return { ...b, walletId: toWalletId };
        }
      } else {
        if (b.walletId === fromWalletId) {
          return { ...b, walletId: toWalletId };
        }
      }
      return b;
    });
    set({ bills: updatedBills });
    saveBills(updatedBills);
  },
}));