export type BillType = 'expense' | 'income';

export interface Category {
  id: string;
  name: string;
  icon: string;
  type: BillType;
  sort: number;
}

export interface Bill {
  id: string;
  type: BillType;
  categoryId: string;
  amount: number;
  remark: string;
  date: string;
  createdAt: number;
}

export interface StatData {
  expense: number;
  income: number;
  balance: number;
}

export interface DateGroup {
  date: string;
  displayDate: string;
  bills: Bill[];
  totalExpense: number;
  totalIncome: number;
}
