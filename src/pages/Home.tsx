import { useNavigate } from 'react-router-dom';
import { useBillStore } from '../store/useBillStore';
import { StatCard } from '../components/StatCard';
import { BillItem } from '../components/BillItem';
import { FloatingButton } from '../components/FloatingButton';
import { Bill } from '../types';

const formatDate = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getDateLabel = (dateStr: string) => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const dayBefore = new Date(today);
  dayBefore.setDate(today.getDate() - 2);
  
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const weekday = weekdays[date.getDay()];
  
  if (dateStr === formatDate(today)) return `${month}月${day}日 今天`;
  if (dateStr === formatDate(yesterday)) return `${month}月${day}日 昨天`;
  if (dateStr === formatDate(dayBefore)) return `${month}月${day}日 前天`;
  
  return `${month}月${day}日 ${weekday}`;
};

const groupBillsByDate = (bills: Bill[]) => {
  const groups: Record<string, Bill[]> = {};
  bills.forEach(bill => {
    if (!groups[bill.date]) {
      groups[bill.date] = [];
    }
    groups[bill.date].push(bill);
  });
  
  const sortedDates = Object.keys(groups).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  
  return sortedDates.map(date => ({
    date,
    bills: groups[date],
    totalIncome: groups[date].filter(b => b.type === 'income').reduce((sum, b) => sum + b.amount, 0),
    totalExpense: groups[date].filter(b => b.type === 'expense').reduce((sum, b) => sum + b.amount, 0),
  }));
};

export default function Home() {
  const navigate = useNavigate();
  const { bills, getStatistics, deleteBill } = useBillStore();
  const { income, expense, balance } = getStatistics();
  const groupedBills = groupBillsByDate(bills);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white px-4 shadow-sm h-12 flex items-center">
        <h1 className="text-base font-bold text-gray-800">账单记录</h1>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-4">
        <div className="mb-6">
          <StatCard income={income} expense={expense} balance={balance} />
        </div>

        {bills.length > 0 ? (
          <div className="space-y-4">
            {groupedBills.map((group) => (
              <div key={group.date} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">{getDateLabel(group.date)}</span>
                  <div className="flex items-center gap-4">
                    {group.totalExpense > 0 && (
                      <span className="text-sm text-red-500">
                        <span className="text-gray-400 mr-1">支出</span>
                        <span className="font-semibold">-{group.totalExpense.toFixed(2)}</span>
                      </span>
                    )}
                    {group.totalIncome > 0 && (
                      <span className="text-sm text-green-500">
                        <span className="text-gray-400 mr-1">收入</span>
                        <span className="font-semibold">+{group.totalIncome.toFixed(2)}</span>
                      </span>
                    )}
                  </div>
                </div>
                <div className="divide-y divide-gray-50">
                  {group.bills.map((bill) => (
                    <BillItem key={bill.id} bill={bill} onDelete={deleteBill} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p>暂无账单记录</p>
            <p className="text-sm mt-2">点击右下角按钮添加第一笔账单</p>
          </div>
        )}
      </main>

      <FloatingButton onClick={() => navigate('/add')} />
    </div>
  );
}