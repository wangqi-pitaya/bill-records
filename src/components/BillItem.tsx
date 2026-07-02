import * as Icons from 'lucide-react';
import { Bill } from '../types';

interface BillItemProps {
  bill: Bill;
}

export const BillItem = ({ bill }: BillItemProps) => {
  const IconComponent = (Icons as Record<string, React.FC<{ className?: string }>>)[bill.icon] || Icons.Circle;

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer hover:scale-[1.01]">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
          bill.type === 'income' ? 'bg-green-100' : 'bg-red-100'
        }`}>
          <IconComponent className={`w-6 h-6 ${
            bill.type === 'income' ? 'text-green-600' : 'text-red-600'
          }`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-800 truncate">{bill.category}</div>
          {bill.note && (
            <div className="text-sm text-gray-500 truncate mt-0.5">{bill.note}</div>
          )}
        </div>
        
        <div className="text-right shrink-0">
          <div className={`text-lg font-bold ${
            bill.type === 'income' ? 'text-green-600' : 'text-red-600'
          }`}>
            {bill.type === 'income' ? '+' : '-'}¥{bill.amount.toFixed(2)}
          </div>
          <div className="text-xs text-gray-400 mt-0.5">{bill.date}</div>
        </div>
      </div>
    </div>
  );
};