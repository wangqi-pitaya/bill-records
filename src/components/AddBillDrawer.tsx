import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Settings, Calendar } from 'lucide-react';
import { useBillStore } from '../store/useBillStore';
import { useCategoryStore } from '../store/useCategoryStore';
import { CategoryGrid } from './CategoryGrid';
import { DatePicker } from './DatePicker';
import { Category, BillType, Bill } from '../types';

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
  
  if (dateStr === formatDate(today)) return '今天';
  if (dateStr === formatDate(yesterday)) return '昨天';
  if (dateStr === formatDate(dayBefore)) return '前天';
  return dateStr;
};

interface AddBillDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  editBill?: Bill | null;
}

export const AddBillDrawer = ({ isOpen, onClose, editBill }: AddBillDrawerProps) => {
  const navigate = useNavigate();
  const addBill = useBillStore((state) => state.addBill);
  const updateBill = useBillStore((state) => state.updateBill);
  const getCategoriesByType = useCategoryStore((state) => state.getCategoriesByType);
  
  const isEdit = !!editBill;
  
  const [activeTab, setActiveTab] = useState<BillType>('expense');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(formatDate(new Date()));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const amountInputRef = useRef<HTMLInputElement | null>(null);

  const validateAmount = (value: string): string => {
    let val = value.replace(/[^0-9.]/g, '');
    
    if (val.startsWith('.')) {
      val = '0' + val;
    }
    
    const parts = val.split('.');
    if (parts.length > 2) {
      val = parts[0] + '.' + parts[1];
    }
    
    if (parts[0] && parts[0].length > 1 && parts[0].startsWith('0')) {
      val = val.replace(/^0+/, '0');
      if (val === '0') {
        val = '0';
      } else if (val.startsWith('0.')) {
        val = '0.' + (parts[1] || '');
      }
    }
    
    if (parts[1] && parts[1].length > 2) {
      val = parts[0] + '.' + parts[1].slice(0, 2);
    }
    
    return val;
  };

  useEffect(() => {
    if (isOpen) {
      if (editBill) {
        setActiveTab(editBill.type);
        setAmount(editBill.amount.toString());
        setNote(editBill.note);
        setDate(editBill.date);
        const categories = getCategoriesByType(editBill.type);
        const cat = categories.find(c => c.name === editBill.category);
        if (cat) setSelectedCategory(cat);
      } else {
        setActiveTab('expense');
        setAmount('');
        setNote('');
        setDate(formatDate(new Date()));
        const categories = getCategoriesByType('expense');
        setSelectedCategory(categories.length > 0 ? categories[0] : null);
      }
    }
  }, [isOpen, editBill, getCategoriesByType]);

  const handleSave = () => {
    if (!selectedCategory || !amount) return;
    
    const billData = {
      type: selectedCategory.type,
      category: selectedCategory.name,
      icon: selectedCategory.icon,
      amount: parseFloat(amount),
      note,
      date,
    };
    
    if (isEdit && editBill) {
      updateBill(editBill.id, billData);
    } else {
      addBill(billData);
    }
    
    onClose();
  };

  const handleSaveAndContinue = () => {
    if (!selectedCategory || !amount) return;
    
    const billData = {
      type: selectedCategory.type,
      category: selectedCategory.name,
      icon: selectedCategory.icon,
      amount: parseFloat(amount),
      note,
      date,
    };
    
    addBill(billData);
    setAmount('');
    setNote('');
  };

  const handleTabChange = (type: BillType) => {
    setActiveTab(type);
    const categories = getCategoriesByType(type);
    setSelectedCategory(categories.length > 0 ? categories[0] : null);
  };

  const currentCategories = getCategoriesByType(activeTab);

  return (
    <>
      {/* 抽屉 */}
      <div
        className={`fixed inset-0 z-50 bg-gray-50 flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <header className="bg-white px-4 shadow-sm h-12 flex items-center shrink-0">
          <div className="flex items-center justify-between w-full">
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-gray-700 hover:text-gray-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex bg-gray-100 rounded-xl p-0.5">
              <button
                onClick={() => handleTabChange('expense')}
                className={`py-1 px-6 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === 'expense'
                    ? 'bg-red-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                支出
              </button>
              <button
                onClick={() => handleTabChange('income')}
                className={`py-1 px-6 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === 'income'
                    ? 'bg-green-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                收入
              </button>
            </div>
            <button
              onClick={() => navigate('/categories')}
              className="w-8 h-8 flex items-center justify-center text-gray-700 hover:text-gray-900 transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-4">
          <div className="max-w-lg mx-auto h-full">
            <CategoryGrid
              categories={currentCategories}
              selectedCategory={selectedCategory}
              onSelect={setSelectedCategory}
              type={activeTab}
            />
          </div>
        </main>

        <div className="bg-white border-t border-gray-100 px-4 py-3 shrink-0">
          <div className="max-w-lg mx-auto">
            <div className="mb-3">
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="添加备注..."
                className="w-full px-4 py-3 text-gray-800 bg-gray-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>

            <div className="flex items-center gap-3 mb-3 flex-nowrap">
              <div className="flex-1 min-w-0">
                <button
                  onClick={() => setShowDatePicker(true)}
                  className="w-full flex items-center justify-center gap-1.5 py-3 rounded-xl text-sm font-medium transition-colors whitespace-nowrap bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  <Calendar className="w-4 h-4" />
                  <span>{getDateLabel(date)}</span>
                </button>
              </div>
              <div className="flex-1 min-w-0">
                <div className="relative w-full">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-base pointer-events-none">¥</span>
                  <input
                    ref={amountInputRef}
                    type="text"
                    inputMode="decimal"
                    value={amount}
                    onChange={(e) => {
                      const val = validateAmount(e.target.value);
                      setAmount(val);
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.currentTarget.focus();
                    }}
                    onTouchEnd={(e) => {
                      e.stopPropagation();
                      e.currentTarget.focus();
                    }}
                    placeholder="0.00"
                    className="w-full pl-7 pr-3 py-3 text-lg font-bold text-gray-800 bg-gray-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isEdit && (
                <button
                  onClick={handleSaveAndContinue}
                  disabled={!selectedCategory || !amount}
                  className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    selectedCategory && amount
                      ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  再记
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={!selectedCategory || !amount}
                className={`flex-1 py-3 rounded-xl text-sm font-semibold text-white whitespace-nowrap transition-all duration-200 ${
                  selectedCategory && amount
                    ? 'bg-gradient-to-r from-emerald-400 to-emerald-600 hover:shadow-lg'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                保存
              </button>
            </div>
          </div>
        </div>

        <DatePicker
          isOpen={showDatePicker}
          value={date}
          onConfirm={setDate}
          onClose={() => setShowDatePicker(false)}
        />
      </div>
    </>
  );
};
