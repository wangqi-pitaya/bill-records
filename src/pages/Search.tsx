import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, SlidersHorizontal, X } from 'lucide-react';
import { useBillStore } from '../store/useBillStore';
import { useWalletStore } from '../store/useWalletStore';
import { useTheme } from '../hooks/useTheme';
import { BillItem } from '../components/BillItem';
import { FilterDrawer, FilterOptions } from '../components/FilterDrawer';
import { groupBillsByDate, filterBillsByWallet, getDateRangeByPreset, formatMoney } from '../lib/utils';
import { useToast } from '../hooks/useToast';

export default function SearchPage() {
  const navigate = useNavigate();
  const { bills, deleteBill } = useBillStore();
  const { isDark } = useTheme();
  const toast = useToast();

  const [keyword, setKeyword] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    walletId: 'all',
    datePreset: 'all',
    startDate: '',
    endDate: '',
  });

  // 根据筛选条件和关键词过滤账单
  const filteredBills = useMemo(() => {
    let result = [...bills];

    // 账本筛选
    if (filters.walletId !== 'all') {
      result = filterBillsByWallet(result, filters.walletId);
    }

    // 日期筛选
    if (filters.datePreset !== 'all') {
      const { start, end } = getDateRangeByPreset(filters.datePreset, filters.startDate, filters.endDate);
      if (start && end) {
        result = result.filter(b => b.date >= start && b.date <= end);
      }
    }

    // 关键词搜索（分类、备注、金额）
    if (keyword.trim()) {
      const searchKey = keyword.trim().toLowerCase();
      result = result.filter(b => {
        // 分类匹配
        if (b.category.toLowerCase().includes(searchKey)) return true;
        // 备注匹配
        if (b.note && b.note.toLowerCase().includes(searchKey)) return true;
        // 金额匹配（支持输入数字匹配金额）
        const amountStr = String(b.amount);
        if (amountStr.includes(searchKey)) return true;
        // 去掉千分符后的金额匹配
        const amountWithoutComma = amountStr.replace(/,/g, '');
        if (amountWithoutComma.includes(searchKey)) return true;
        return false;
      });
    }

    // 按日期降序排序
    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [bills, filters, keyword]);

  const groupedBills = useMemo(() => groupBillsByDate(filteredBills), [filteredBills]);

  const handleDelete = useCallback((id: string) => {
    deleteBill(id);
    toast.success('账单已删除');
  }, [deleteBill, toast]);

  const hasActiveFilters = filters.walletId !== 'all' || filters.datePreset !== 'all';

  // 统计信息
  const stats = useMemo(() => {
    const income = filteredBills.filter(b => b.type === 'income').reduce((sum, b) => sum + b.amount, 0);
    const expense = filteredBills.filter(b => b.type === 'expense').reduce((sum, b) => sum + b.amount, 0);
    return { income, expense, count: filteredBills.length };
  }, [filteredBills]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* 标题栏 */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white dark:bg-gray-800 px-4 shadow-sm transition-colors duration-300">
        <div className="max-w-4xl mx-auto">
          <div className="h-12 flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-8 h-8 flex items-center justify-center text-gray-700 dark:text-gray-300 shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="flex-1 text-center text-base font-bold text-gray-800 dark:text-gray-100">搜索账单</h1>
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
        {/* 搜索输入框 */}
        <div className="sticky top-0 z-30 pt-2 pb-3 bg-gray-50 dark:bg-gray-900">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索分类、备注、金额..."
              className="w-full pl-9 pr-9 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-800 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
              autoFocus
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

          {/* 统计信息 */}
          {filteredBills.length > 0 && (
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
              <span>共 {stats.count} 笔</span>
              <div className="flex gap-3">
                {stats.income > 0 && (
                  <span className="text-income-500">收入 +{formatMoney(stats.income)}</span>
                )}
                {stats.expense > 0 && (
                  <span className="text-expense-500">支出 -{formatMoney(stats.expense)}</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 搜索结果 */}
        {filteredBills.length > 0 ? (
          <div className="space-y-4">
            {groupedBills.map((group) => (
              <div key={group.date} className="bg-white dark:bg-gray-800 rounded-card shadow-card overflow-hidden transition-colors duration-300">
                <div className="px-4 py-2.5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between gap-4">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{group.date}</span>
                  <div className="flex flex-col items-end gap-0.5">
                    {group.totalExpense > 0 && (
                      <span className="text-xs text-expense-500 whitespace-nowrap">
                        支出 -{formatMoney(group.totalExpense)}
                      </span>
                    )}
                    {group.totalIncome > 0 && (
                      <span className="text-xs text-income-500 whitespace-nowrap">
                        收入 +{formatMoney(group.totalIncome)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="divide-y divide-gray-50 dark:divide-gray-700">
                  {group.bills.map((bill, idx) => (
                    <BillItem
                      key={bill.id}
                      bill={bill}
                      onDelete={handleDelete}
                      isLast={idx === group.bills.length - 1}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>
              {keyword || hasActiveFilters ? '没有找到匹配的账单' : '输入关键词开始搜索'}
            </p>
            {(keyword || hasActiveFilters) && (
              <p className="text-sm mt-1">试试其他关键词或调整筛选条件</p>
            )}
          </div>
        )}
      </main>

      {/* 筛选抽屉 */}
      <FilterDrawer
        isOpen={showFilter}
        onClose={() => setShowFilter(false)}
        filters={filters}
        onConfirm={setFilters}
      />
    </div>
  );
}
