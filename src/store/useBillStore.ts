import { create } from 'zustand';
import { Bill, BillStore } from '../types';
import { generateId, setStorage } from '../lib/utils';
import { taroPersist } from './taroPersist';

export const useBillStore = create<BillStore>()(
  taroPersist(
    (set, get) => ({
      bills: [],

      addBill: (bill) => {
        const newBill: Bill = {
          ...bill,
          id: generateId(),
          timestamp: Date.now(),
          categoryId: bill.categoryId || '',
        };
        const updatedBills = [newBill, ...get().bills];
        set({ bills: updatedBills });
      },

      softDeleteBill: (id) => {
        const updatedBills = get().bills.map((b) =>
          b.id === id ? { ...b, deleted: true, deletedAt: Date.now() } : b
        );
        set({ bills: updatedBills });
      },

      restoreBill: (id) => {
        const updatedBills = get().bills.map((b) =>
          b.id === id ? { ...b, deleted: false, deletedAt: undefined } : b
        );
        set({ bills: updatedBills });
      },

      restoreAllDeleted: () => {
        const updatedBills = get().bills.map((b) =>
          b.deleted ? { ...b, deleted: false, deletedAt: undefined } : b
        );
        set({ bills: updatedBills });
      },

      permanentDeleteBill: (id) => {
        const updatedBills = get().bills.filter((b) => b.id !== id);
        set({ bills: updatedBills });
      },

      clearTrash: () => {
        const updatedBills = get().bills.filter((b) => !b.deleted);
        set({ bills: updatedBills });
      },

      updateBill: (id, bill) => {
        const updatedBills = get().bills.map((b) =>
          b.id === id ? { ...b, ...bill } : b
        );
        set({ bills: updatedBills });
      },

      getBillById: (id) => {
        return get().bills.find((b) => b.id === id);
      },

      getStatistics: (walletId?: string) => {
        const { bills } = get();
        const activeBills = bills.filter((b) => !b.deleted);
        const filteredBills = walletId
          ? activeBills.filter((b) =>
              walletId === 'default'
                ? !b.walletId || b.walletId === 'default'
                : b.walletId === walletId
            )
          : activeBills;
        const income = filteredBills
          .filter((b) => b.type === 'income')
          .reduce((sum, b) => sum + b.amount, 0);
        const expense = filteredBills
          .filter((b) => b.type === 'expense')
          .reduce((sum, b) => sum + b.amount, 0);
        return { income, expense, balance: income - expense };
      },

      clearBillsByWalletId: (walletId: string) => {
        const updatedBills = get().bills.filter((b) => b.walletId !== walletId);
        set({ bills: updatedBills });
      },

      migrateBills: (fromWalletId: string, toWalletId: string) => {
        const updatedBills = get().bills.map((b) => {
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
