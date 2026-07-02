import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Settings } from 'lucide-react';
import { useBillStore } from '../store/useBillStore';
import { useCategoryStore } from '../store/useCategoryStore';
import { CategoryGrid } from '../components/CategoryGrid';
import { Category, BillType } from '../types';

export default function AddBill() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const addBill = useBillStore((state) => state.addBill);
  const updateBill = useBillStore((state) => state.updateBill);
  const getBillById = useBillStore((state) => state.getBillById);
  const getCategoriesByType = useCategoryStore((state) => state.getCategoriesByType);
  
  const isEdit = !!id;
  
  const [activeTab, setActiveTab] = useState<BillType>('expense');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    const categories = getCategoriesByType(activeTab);
    if (!selectedCategory && categories.length > 0) {
      setSelectedCategory(categories[0]);
    }
  }, [activeTab, selectedCategory, getCategoriesByType]);

  useEffect(() => {
    if (isEdit && id) {
      const bill = getBillById(id);
      if (bill) {
        setActiveTab(bill.type);
        setAmount(bill.amount.toString());
        setNote(bill.note);
        
        const categories = getCategoriesByType(bill.type);
        const cat = categories.find(c => c.name === bill.category);
        if (cat) {
          setSelectedCategory(cat);
        }
      }
    }
  }, [isEdit, id, getBillById, getCategoriesByType]);

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

  const handleTabChange = (type: BillType) => {
    setActiveTab(type);
    const categories = getCategoriesByType(type);
    setSelectedCategory(categories.length > 0 ? categories[0] : null);
  };

  const currentCategories = getCategoriesByType(activeTab);

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      <header className="bg-white px-4 py-3 shadow-sm shrink-0">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="w-8 h-8 flex items-center justify-center text-gray-700 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => handleTabChange('expense')}
              className={`py-1.5 px-6 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'expense'
                  ? 'bg-red-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              支出
            </button>
            <button
              onClick={() => handleTabChange('income')}
              className={`py-1.5 px-6 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'income'
                  ? 'bg-green-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              收入
            </button>
          </div>
          <div className="w-8 h-8" />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-sm p-4">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700">选择分类</h3>
              <button
                onClick={() => navigate('/categories')}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <Settings className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <CategoryGrid
              categories={currentCategories}
              selectedCategory={selectedCategory}
              onSelect={setSelectedCategory}
              type={activeTab}
            />
          </div>

          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">备注</h3>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="添加备注..."
              className="w-full px-4 py-3 text-gray-800 bg-gray-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>
        </div>
      </main>

      <div className="bg-white border-t border-gray-100 px-4 py-3 shrink-0">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">¥</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full pl-10 pr-4 py-3 text-xl font-bold text-gray-800 bg-gray-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={!selectedCategory || !amount}
            className={`px-6 py-3 rounded-xl font-semibold text-white whitespace-nowrap transition-all duration-200 ${
              selectedCategory && amount
                ? 'bg-gradient-to-r from-emerald-400 to-emerald-600 hover:shadow-lg'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            {isEdit ? '保存' : '保存'}
          </button>
        </div>
      </div>
    </div>
  );
}