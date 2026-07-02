import { create } from 'zustand';
import { Bill } from '../types';
import { loadBills, saveBills } from '../utils/storage';

interface BillStore {
  bills: Bill[];
  addBill: (bill: Omit<Bill, 'id' | 'timestamp'>) => void;
  getStatistics: () => { income: number; expense: number; balance: number };
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
}));