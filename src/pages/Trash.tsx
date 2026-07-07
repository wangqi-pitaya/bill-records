import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, SlidersHorizontal, X, RefreshCw, Trash2 } from 'lucide-react';
import { useBillStore } from '../store/useBillStore';
import { useToast } from '../hooks/useToast';
import { FilterDrawer, FilterOptions } from '../components/FilterDrawer';
import { ConfirmModal } from '../components/ConfirmModal';
import { groupBillsByDate, filterBillsByWallet, getDateRangeByPreset, formatMoney } from '../lib/utils';

export default function TrashPage() {
  const navigate = useNavigate();
  const { bills, restoreBill, permanentDeleteBill, clearTrash } = useBillStore();
  const toast = useToast();

  const [keyword, setKeyword] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    walletId: 'all',
    datePreset: 'all',
    startDate: '',
    endDate: '',
  });

  const deletedBills = useMemo(() => bills.filter(b => b.deleted), [bills]);

  const filteredBills = useMemo(() => {
    let result = [...deletedBills];

    if (filters.walletId !== 'all') {
      result = filterBillsByWallet(result, filters.walletId);
    }

    if (filters.datePreset !== 'all') {
      const { start, end } = getDateRangeByPreset(filters.datePreset, filters.startDate, filters.endDate);
      if (start && end) {
        result = result.filter(b => b.date >= start && b.date <= end);
      }
    }

    if (keyword.trim()) {
      const searchKey = keyword.trim().toLowerCase();
      result = result.filter(b => {
        if (b.category.toLowerCase().includes(searchKey)) return true;
        if (b.note && b.note.toLowerCase().includes(searchKey)) return true;
        const amountStr = String(b.amount);
        if (amountStr.includes(searchKey)) return true;
        const amountWithoutComma = amountStr.replace(/,/g, '');
        if (amountWithoutComma.includes(searchKey)) return true;
        return false;
      });
    }

    return result.sort((a, b) => (b.deletedAt || 0) - (a.deletedAt || 0));
  }, [deletedBills, filters, keyword]);

  const groupedBills = useMemo(() => groupBillsByDate(filteredBills), [filteredBills]);

  const handleRestore = useCallback((id: string) => {
    restoreBill(id);
    toast.success('账单已恢复');
  }, [restoreBill, toast]);

  const handlePermanentDelete = useCallback((id: string) => {
    permanentDeleteBill(id);
    toast.success('账单已永久删除');
  }, [permanentDeleteBill, toast]);

  const handleClearTrash = useCallback(() => {
    clearTrash();
    toast.success('回收站已清空');
    setShowClearConfirm(false);
  }, [clearTrash, toast]);

  const hasActiveFilters = filters.walletId !== 'all' || filters.datePreset !== 'all';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <header className="fixed top-0 left-0 right-0 z-40 bg-white dark:bg-gray-800 px-4 shadow-sm transition-colors duration-300">
        <div className="max-w-4xl mx-auto">
          <div className="h-12 flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-8 h-8 flex items-center justify-center text-gray-700 dark:text-gray-300 shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="flex-1 text-center text-base font-bold text-gray-800 dark:text-gray-100">回收站</h1>
            <button
              onClick={() => setShowFilter(true)}
              className={`w-8 h-8 flex items-center justify-center shrink-0 relative ${
                hasActiveFilters ? 'text-primary-500' : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              <SlidersHorizontal className="w-5 h-5" />
              {hasActiveFilters && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-primary-500 rounded-full" />
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-16 pb-4">
        <div className="sticky top-0 z-30 pt-2 pb-3 bg-gray-50 dark:bg-gray-900">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索分类、备注、金额..."
              className="w-full pl-9 pr-9 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-800 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
            />
            {keyword && (
              <button
                onClick={() => setKeyword('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {deletedBills.length > 0 && (
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
              <span>共 {filteredBills.length} 笔（回收站 {deletedBills.length} 笔）</span>
              <button
                onClick={() => setShowClearConfirm(true)}
                className="text-red-500 flex items-center gap-1 hover:text-red-600"
              >
                <Trash2 className="w-3 h-3" />
                清空回收站
              </button>
            </div>
          )}
        </div>

        {filteredBills.length > 0 ? (
          <div className="space-y-4">
            {groupedBills.map((group) => (
              <div key={group.date} className="bg-white dark:bg-gray-800 rounded-card shadow-card overflow-hidden transition-colors duration-300">
                <div className="px-4 py-2.5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between gap-4">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{group.date}</span>
                  <div className="text-xs text-gray-400">已删除</div>
                </div>
                <div className="divide-y divide-gray-50 dark:divide-gray-700">
                  {group.bills.map((bill, idx) => (
                    <div
                      key={bill.id}
                      className="p-4 flex items-center gap-3"
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 opacity-60 ${
                        bill.type === 'income' ? 'bg-income-100 dark:bg-income-900/30' : 'bg-expense-100 dark:bg-expense-900/30'
                      }`}>
                        <span className={`w-5 h-5 text-center ${
                          bill.type === 'income' ? 'text-income-600 dark:text-income-400' : 'text-expense-600 dark:text-expense-400'
                        }`}>
                          {bill.icon.slice(0, 1)}
                        </span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-800 dark:text-gray-100">{bill.category}</div>
                        {bill.note && (
                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5">{bill.note}</div>
                        )}
                      </div>
                      
                      <div className="text-right shrink-0">
                        <div className={`font-bold ${
                          bill.type === 'income' ? 'text-income-600 dark:text-income-400' : 'text-expense-600 dark:text-expense-400'
                        }`}>
                          {bill.type === 'income' ? '+' : '-'}{formatMoney(bill.amount)}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="px-4 py-2 flex justify-end gap-2 border-t border-gray-50 dark:border-gray-700">
                    <button
                      onClick={() => group.bills.forEach(b => restoreBill(b.id))}
                      className="px-3 py-1.5 text-xs text-primary-500 bg-primary-50 dark:bg-primary-900/20 rounded-lg"
                    >
                      恢复全部
                    </button>
                    <button
                      onClick={() => group.bills.forEach(b => permanentDeleteBill(b.id))}
                      className="px-3 py-1.5 text-xs text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg"
                    >
                      永久删除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            <Trash2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>{deletedBills.length === 0 ? '回收站是空的' : '没有找到匹配的账单'}</p>
          </div>
        )}
      </main>

      <FilterDrawer
        isOpen={showFilter}
        onClose={() => setShowFilter(false)}
        filters={filters}
        onConfirm={setFilters}
      />

      <ConfirmModal
        isOpen={showClearConfirm}
        title="清空回收站"
        message={`确定要清空回收站中全部 ${deletedBills.length} 条账单吗？此操作不可恢复。`}
        confirmText="清空"
        cancelText="取消"
        type="danger"
        onConfirm={handleClearTrash}
        onCancel={() => setShowClearConfirm(false)}
      />
    </div>
  );
}
