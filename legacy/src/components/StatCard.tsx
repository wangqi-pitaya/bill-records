import { formatMoney } from '../lib/utils';

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

  const balanceStr = formatMoney(balance);
  const incomeStr = formatMoney(income);
  const expenseStr = formatMoney(expense);

  return (
    <div
      className={`rounded-2xl p-4 shadow-card text-white ${
        color ? '' : 'bg-gradient-to-br from-primary-400 to-primary-600'
      }`}
      style={cardStyle}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-white/90 whitespace-nowrap">结余</span>
        <span
          className="text-xl font-bold whitespace-nowrap"
          style={{ fontSize: balanceStr.length > 10 ? '14px' : undefined }}
        >
          {balanceStr}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-3 border-t border-white/20">
        <div>
          <div className="text-xs text-white/80 whitespace-nowrap">收入</div>
          <div
            className="text-base font-semibold whitespace-nowrap"
            style={{ fontSize: incomeStr.length > 10 ? '12px' : undefined }}
          >
            {incomeStr}
          </div>
        </div>
        <div>
          <div className="text-xs text-white/80 whitespace-nowrap">支出</div>
          <div
            className="text-base font-semibold whitespace-nowrap"
            style={{ fontSize: expenseStr.length > 10 ? '12px' : undefined }}
          >
            {expenseStr}
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