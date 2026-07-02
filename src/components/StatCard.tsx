import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

interface StatCardProps {
  type: 'income' | 'expense' | 'balance';
  label: string;
  amount: number;
}

export const StatCard = ({ type, label, amount }: StatCardProps) => {
  const iconProps = { className: 'w-6 h-6' };
  
  const config = {
    income: {
      icon: <TrendingUp {...iconProps} className="w-6 h-6 text-green-500" />,
      bgGradient: 'from-green-50 to-green-100',
      textColor: 'text-green-600',
      prefix: '+',
    },
    expense: {
      icon: <TrendingDown {...iconProps} className="w-6 h-6 text-red-500" />,
      bgGradient: 'from-red-50 to-red-100',
      textColor: 'text-red-600',
      prefix: '-',
    },
    balance: {
      icon: <Wallet {...iconProps} className="w-6 h-6 text-blue-500" />,
      bgGradient: 'from-blue-50 to-blue-100',
      textColor: 'text-blue-600',
      prefix: '',
    },
  };

  const { icon, bgGradient, textColor, prefix } = config[type];

  return (
    <div className={`bg-gradient-to-br ${bgGradient} rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-gray-600 font-medium">{label}</span>
        {icon}
      </div>
      <div className={`text-2xl font-bold ${textColor}`}>
        {prefix}¥{amount.toFixed(2)}
      </div>
    </div>
  );
};