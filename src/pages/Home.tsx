import { useNavigate } from 'react-router-dom';
import { useBillStore } from '../store/useBillStore';
import { StatCard } from '../components/StatCard';
import { BillItem } from '../components/BillItem';
import { FloatingButton } from '../components/FloatingButton';

export default function Home() {
  const navigate = useNavigate();
  const { bills, getStatistics } = useBillStore();
  const { income, expense, balance } = getStatistics();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white px-4 py-3 shadow-sm">
        <h1 className="text-base font-bold text-gray-800">账单记录</h1>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-4">
        <div className="mb-6">
          <StatCard income={income} expense={expense} balance={balance} />
        </div>

        <div className="mb-3">
          <h2 className="text-sm font-semibold text-gray-600">最近账单</h2>
        </div>

        {bills.length > 0 ? (
          <div className="space-y-3">
            {bills.map((bill) => (
              <BillItem key={bill.id} bill={bill} />
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