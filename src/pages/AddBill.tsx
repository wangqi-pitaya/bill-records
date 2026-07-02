import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Settings, Calendar } from 'lucide-react';
import { useBillStore } from '../store/useBillStore';
import { useCategoryStore } from '../store/useCategoryStore';
import { CategoryGrid } from '../components/CategoryGrid';
import { DatePicker } from '../components/DatePicker';
import { Category, BillType } from '../types';

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
  const [date, setDate] = useState(formatDate(new Date()));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [amountWidth, setAmountWidth] = useState(120);
  const [maxAmountWidth, setMaxAmountWidth] = useState(240);
  const amountMeasureRef = useRef<HTMLSpanElement | null>(null);
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
    const categories = getCategoriesByType(activeTab);
    if (!selectedCategory && categories.length > 0) {
      setSelectedCategory(categories[0]);
    }
  }, [activeTab, selectedCategory, getCategoriesByType]);

  useEffect(() => {
    const updateMaxWidth = () => {
      if (amountInputRef.current) {
        const parentWidth = amountInputRef.current.parentElement?.parentElement?.offsetWidth || 400;
        setMaxAmountWidth(Math.floor(parentWidth * 0.8));
      }
    };
    updateMaxWidth();
    window.addEventListener('resize', updateMaxWidth);
    return () => window.removeEventListener('resize', updateMaxWidth);
  }, []);

  useEffect(() => {
    if (amountMeasureRef.current) {
      const measuredWidth = amountMeasureRef.current.offsetWidth + 48;
      setAmountWidth(Math.min(Math.max(measuredWidth, 120), maxAmountWidth));
    }
  }, [amount, maxAmountWidth]);

  useEffect(() => {
    if (isEdit && id) {
      const bill = getBillById(id);
      if (bill) {
        setActiveTab(bill.type);
        setAmount(bill.amount.toString());
        setNote(bill.note);
        setDate(bill.date);
        
        const categories = getCategoriesByType(bill.type);
        const cat = categories.find(c => c.name === bill.category);
        if (cat) {
          setSelectedCategory(cat);
        }
      }
    }
  }, [isEdit, id, getBillById, getCategoriesByType]);

  const handleSave = () => {
    if (!selectedCategory || !amount) {
      return;
    }
    
    const billData = {
      type: selectedCategory.type,
      category: selectedCategory.name,
      icon: selectedCategory.icon,
      amount: parseFloat(amount),
      note,
      date,
    };
    
    if (isEdit && id) {
      updateBill(id, billData);
    } else {
      addBill(billData);
    }
    
    navigate('/', { replace: true });
  };

  const handleSaveAndContinue = () => {
    if (!selectedCategory || !amount) {
      return;
    }
    
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
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      <header className="bg-white px-4 shadow-sm h-12 flex items-center shrink-0">
        <div className="flex items-center justify-between w-full">
          <button
            onClick={() => navigate('/')}
            className="w-8 h-8 flex items-center justify-center text-gray-700 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
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
            <button
              onClick={() => setShowDatePicker(true)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-sm font-medium transition-colors min-w-[120px] whitespace-nowrap ${
                isEdit ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>{getDateLabel(date)}</span>
            </button>
            <div className="relative inline-flex items-center">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-base pointer-events-none">¥</span>
              <span
                ref={amountMeasureRef}
                className="absolute left-7 top-1/2 -translate-y-1/2 whitespace-pre text-lg font-bold pointer-events-none"
                style={{ fontVariantNumeric: 'tabular-nums', opacity: 0 }}
              >
                {amount || '0.00'}
              </span>
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
                style={{ width: `${amountWidth}px`, maxWidth: '200px' }}
                className="pl-7 pr-3 py-3 text-lg font-bold text-gray-800 bg-gray-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
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
              className={`flex-1 py-3 rounded-xl font-semibold text-white whitespace-nowrap transition-all duration-200 ${
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
  );
}