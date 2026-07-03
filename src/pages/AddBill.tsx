import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Settings, Calendar } from 'lucide-react';
import { useBillForm } from '../hooks/useBillForm';
import { useBillStore } from '../store/useBillStore';
import { CategoryGrid } from '../components/CategoryGrid';
import { DatePicker } from '../components/DatePicker';
import { LoadingSpinner } from '../components/Loading';

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
  const getBillById = useBillStore((state) => state.getBillById);

  const editBill = id ? getBillById(id) || null : null;

  const form = useBillForm({
    editBill,
    onSuccess: () => {
      navigate(-1);
    },
  });

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col overflow-hidden transition-colors duration-300">
      <header className="bg-white dark:bg-gray-800 px-4 shadow-sm h-12 flex items-center shrink-0 transition-colors duration-300">
        <div className="flex items-center justify-between w-full">
          <button
            onClick={() => navigate('/')}
            className="w-8 h-8 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="tab-container">
            <button
              onClick={() => form.setActiveTab('expense')}
              className={`tab-item ${form.activeTab === 'expense' ? 'tab-item-active-expense' : ''}`}
            >
              支出
            </button>
            <button
              onClick={() => form.setActiveTab('income')}
              className={`tab-item ${form.activeTab === 'income' ? 'tab-item-active-income' : ''}`}
            >
              收入
            </button>
          </div>
          <button
            onClick={() => navigate('/categories')}
            className="w-8 h-8 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-lg mx-auto h-full">
          <CategoryGrid
            categories={form.currentCategories}
            selectedCategory={form.selectedCategory}
            onSelect={form.setSelectedCategory}
            type={form.activeTab}
          />
        </div>
      </main>

      <div className="bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 px-4 py-3 shrink-0 transition-colors duration-300">
        <div className="max-w-lg mx-auto">
          <div className="mb-3">
            <input
              type="text"
              value={form.note}
              onChange={(e) => form.setNote(e.target.value)}
              placeholder="添加备注..."
              className="input-base"
            />
          </div>

          <div className="flex items-center gap-3 mb-3 flex-nowrap">
            <div className="flex-1 min-w-0">
              <button
                onClick={() => form.setShowDatePicker(true)}
                className="w-full flex items-center justify-center gap-1.5 py-3 rounded-btn text-sm font-medium transition-colors whitespace-nowrap bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <Calendar className="w-4 h-4" />
                <span>{getDateLabel(form.date)}</span>
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <div className="relative w-full">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-base pointer-events-none">
                  ¥
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={form.amount}
                  onChange={(e) => form.setAmount(e.target.value)}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.currentTarget.focus();
                  }}
                  onTouchEnd={(e) => {
                    e.stopPropagation();
                    e.currentTarget.focus();
                  }}
                  placeholder="0.00"
                  className="input-base pl-7 pr-3 py-3 text-lg font-bold"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!form.isEdit && (
              <button
                onClick={form.handleSaveAndContinue}
                disabled={!form.canSubmit}
                className={`flex-1 py-3 rounded-btn text-sm font-semibold transition-all duration-200 ${
                  form.canSubmit
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 hover:bg-primary-200 dark:hover:bg-primary-900/50'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                }`}
              >
                再记
              </button>
            )}
            <button
              onClick={form.handleSave}
              disabled={!form.canSubmit}
              className={`flex-1 py-3 rounded-btn text-sm font-semibold text-white whitespace-nowrap transition-all duration-200 flex items-center justify-center gap-2 ${
                form.canSubmit
                  ? 'bg-gradient-to-r from-primary-400 to-primary-600 hover:shadow-lg'
                  : 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
              }`}
            >
              {form.isSubmitting && <LoadingSpinner size="sm" className="text-white" />}
              保存
            </button>
          </div>
        </div>
      </div>

      <DatePicker
        isOpen={form.showDatePicker}
        value={form.date}
        onConfirm={form.setDate}
        onClose={() => form.setShowDatePicker(false)}
      />
    </div>
  );
}
