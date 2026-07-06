import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Bill, BillStore } from '../types';

export const useBillStore = create<BillStore>()(
  persist(
    (set, get) => ({
      bills: [],

      addBill: (bill) => {
        const newBill: Bill = {
          ...bill,
          id: crypto.randomUUID(),
          timestamp: Date.now(),
        };
        const updatedBills = [newBill, ...get().bills];
        set({ bills: updatedBills });
      },

      deleteBill: (id) => {
        const updatedBills = get().bills.filter(b => b.id !== id);
        set({ bills: updatedBills });
      },

      updateBill: (id, bill) => {
        const updatedBills = get().bills.map(b =>
          b.id === id ? { ...b, ...bill } : b
        );
        set({ bills: updatedBills });
      },

      getBillById: (id) => {
        return get().bills.find(b => b.id === id);
      },

      getStatistics: (walletId?: string) => {
        const { bills } = get();
        const filteredBills = walletId
          ? bills.filter((b) =>
              walletId === 'default'
                ? !b.walletId || b.walletId === 'default'
                : b.walletId === walletId
            )
          : bills;
        const income = filteredBills
          .filter(b => b.type === 'income')
          .reduce((sum, b) => sum + b.amount, 0);
        const expense = filteredBills
          .filter(b => b.type === 'expense')
          .reduce((sum, b) => sum + b.amount, 0);
        return { income, expense, balance: income - expense };
      },

      clearBillsByWalletId: (walletId: string) => {
        const updatedBills = get().bills.filter(b => b.walletId !== walletId);
        set({ bills: updatedBills });
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
      },
    }),
    {
      name: 'bill_records',
    }
  )
);
