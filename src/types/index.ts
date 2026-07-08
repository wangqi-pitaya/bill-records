export type BillType = 'income' | 'expense';

export interface Category {
  id: string;
  name: string;
  icon: string;
  type: BillType;
}

export interface Bill {
  id: string;
  type: BillType;
  category: string;
  icon: string;
  amount: number;
  note: string;
  date: string;
  timestamp: number;
  walletId?: string;
  deleted?: boolean;
  deletedAt?: number;
}

export interface Wallet {
  id: string;
  name: string;
  description: string;
  color: string;
  isDefault: boolean;
}

export interface DateGroup {
  date: string;
  bills: Bill[];
  totalIncome: number;
  totalExpense: number;
}

export interface FilterOptions {
  walletId: string;
  datePreset: 'all' | 'thisMonth' | 'lastMonth' | 'thisYear' | 'lastYear' | 'custom';
  startDate: string;
  endDate: string;
}

export interface BillStore {
  bills: Bill[];
  addBill: (bill: Omit<Bill, 'id' | 'timestamp'>) => void;
  deleteBill: (id: string) => void;
  softDeleteBill: (id: string) => void;
  restoreBill: (id: string) => void;
  permanentDeleteBill: (id: string) => void;
  clearTrash: () => void;
  updateBill: (id: string, bill: Partial<Bill>) => void;
  getBillById: (id: string) => Bill | undefined;
  getStatistics: (walletId?: string) => { income: number; expense: number; balance: number };
  clearBillsByWalletId: (walletId: string) => void;
  migrateBills: (fromWalletId: string, toWalletId: string) => void;
}
