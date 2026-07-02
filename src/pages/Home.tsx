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
      <header className="bg-gradient-to-r from-emerald-400 to-emerald-600 text-white px-6 py-8">
        <h1 className="text-2xl font-bold">账单记录</h1>
        <p className="text-emerald-100 mt-1">轻松管理您的财务</p>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCard type="income" label="总收入" amount={income} />
          <StatCard type="expense" label="总支出" amount={expense} />
          <StatCard type="balance" label="余额" amount={balance} />
        </div>

        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-800">最近账单</h2>
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
};