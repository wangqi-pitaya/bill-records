import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

interface StatCardProps {
  income: number;
  expense: number;
  balance: number;
  color?: string;
}

export const StatCard = ({ income, expense, balance, color }: StatCardProps) => {
  const cardStyle = color
    ? { background: `linear-gradient(135deg, ${color}, ${adjustColor(color, -20)})` }
    : undefined;

  return (
    <div
      className={`rounded-2xl p-6 shadow-card text-white ${
        color ? '' : 'bg-gradient-to-br from-primary-400 to-primary-600'
      }`}
      style={cardStyle}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          <span className="text-sm font-medium text-white/90">余额</span>
        </div>
        <span className="text-2xl font-bold">¥{balance.toFixed(2)}</span>
      </div>
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-white/80">收入</div>
            <div className="text-base font-semibold">¥{income.toFixed(2)}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <TrendingDown className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-white/80">支出</div>
            <div className="text-base font-semibold">¥{expense.toFixed(2)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

function adjustColor(color: string, amount: number): string {
  const hex = color.replace('#', '');
  const num = parseInt(hex, 16);
  let r = (num >> 16) + amount;
  let g = ((num >> 8) & 0x00ff) + amount;
  let b = (num & 0x0000ff) + amount;
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}