import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useBillStore } from '../store/useBillStore';
import { CategoryGrid } from '../components/CategoryGrid';
import { expenseCategories, incomeCategories } from '../data/categories';
import { Category, BillType } from '../types';

export default function AddBill() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const addBill = useBillStore((state) => state.addBill);
  const updateBill = useBillStore((state) => state.updateBill);
  const getBillById = useBillStore((state) => state.getBillById);
  
  const isEdit = !!id;
  
  const [activeTab, setActiveTab] = useState<BillType>('expense');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (isEdit && id) {
      const bill = getBillById(id);
      if (bill) {
        setActiveTab(bill.type);
        setAmount(bill.amount.toString());
        setNote(bill.note);
        
        const categories = bill.type === 'expense' ? expenseCategories : incomeCategories;
        const cat = categories.find(c => c.name === bill.category);
        if (cat) {
          setSelectedCategory(cat);
        }
      }
    }
  }, [isEdit, id, getBillById]);

  const handleSubmit = () => {
    if (!selectedCategory || !amount) {
      return;
    }
    
    const billData = {
      type: selectedCategory.type,
      category: selectedCategory.name,
      icon: selectedCategory.icon,
      amount: parseFloat(amount),
      note,
      date: isEdit ? getBillById(id!)?.date || new Date().toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    };
    
    if (isEdit && id) {
      updateBill(id, billData);
    } else {
      addBill(billData);
    }
    
    navigate('/');
  };

  const currentCategories = activeTab === 'expense' ? expenseCategories : incomeCategories;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-lg font-bold text-gray-800">{isEdit ? '编辑账单' : '新建账单'}</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex mb-6 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => {
                setActiveTab('expense');
                setSelectedCategory(null);
              }}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'expense'
                  ? 'bg-red-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              支出
            </button>
            <button
              onClick={() => {
                setActiveTab('income');
                setSelectedCategory(null);
              }}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'income'
                  ? 'bg-green-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              收入
            </button>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">选择分类</h3>
            <CategoryGrid
              categories={currentCategories}
              selectedCategory={selectedCategory}
              onSelect={setSelectedCategory}
              type={activeTab}
            />
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">金额</h3>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">¥</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-10 pr-4 py-4 text-2xl font-bold text-gray-800 bg-gray-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">备注</h3>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="添加备注..."
              className="w-full px-4 py-3 text-gray-800 bg-gray-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!selectedCategory || !amount}
            className={`w-full py-4 rounded-xl font-semibold text-white transition-all duration-200 ${
              selectedCategory && amount
                ? 'bg-gradient-to-r from-emerald-400 to-emerald-600 hover:shadow-lg hover:scale-[1.02]'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            {isEdit ? '保存修改' : '保存'}
          </button>
        </div>
      </main>
    </div>
  );
}