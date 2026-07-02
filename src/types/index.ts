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
}

export interface BillStore {
  bills: Bill[];
  addBill: (bill: Omit<Bill, 'id' | 'timestamp'>) => void;
  getStatistics: () => { income: number; expense: number; balance: number };
}