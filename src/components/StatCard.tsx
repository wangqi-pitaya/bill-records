import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

interface StatCardProps {
  income: number;
  expense: number;
  balance: number;
}

export const StatCard = ({ income, expense, balance }: StatCardProps) => {
  return (
    <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl p-6 shadow-md text-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          <span className="text-sm font-medium text-emerald-50">余额</span>
        </div>
        <span className="text-2xl font-bold">¥{balance.toFixed(2)}</span>
      </div>
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-emerald-300/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-emerald-100">收入</div>
            <div className="text-base font-semibold">¥{income.toFixed(2)}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <TrendingDown className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-emerald-100">支出</div>
            <div className="text-base font-semibold">¥{expense.toFixed(2)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};