import { useState, useMemo, useEffect } from 'react';
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, BarChart3, X } from 'lucide-react';
import * as Icons from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import { useBillStore } from '../store/useBillStore';
import { useWalletStore } from '../store/useWalletStore';
import { useCategoryStore } from '../store/useCategoryStore';
import { filterBillsByWallet } from '../lib/utils';
import { StatCard } from '../components/StatCard';

interface CategoryStat {
  name: string;
  amount: number;
  percentage: number;
  icon: string;
}

interface TrendItem {
  label: string;
  income: number;
  expense: number;
  balance: number;
}

export default function Statistics() {
  const [tab, setTab] = useState<'month' | 'year'>('month');
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [showPicker, setShowPicker] = useState(false);
  const [trendMode, setTrendMode] = useState<'all' | 'income' | 'expense' | 'balance'>('all');

  const { bills } = useBillStore();
  const { currentWalletId, wallets } = useWalletStore();
  const currentWallet = wallets.find(w => w.id === currentWalletId);
  const { categories } = useCategoryStore();

  const walletBills = useMemo(() => filterBillsByWallet(bills, currentWalletId), [bills, currentWalletId]);

  const availableYears = useMemo(() => {
    const years = new Set(walletBills.map(b => Number(b.date.split('-')[0])));
    if (years.size === 0) years.add(new Date().getFullYear());
    return Array.from(years).sort((a, b) => b - a);
  }, [walletBills]);

  const maxYear = availableYears[0] || year;
  const minYear = availableYears[availableYears.length - 1] || year;

  const monthStats = useMemo(() => {
    const filtered = walletBills.filter(b => {
      const [y, m] = b.date.split('-').map(Number);
      return y === year && m === month;
    });

    const income = filtered.filter(b => b.type === 'income').reduce((sum, b) => sum + b.amount, 0);
    const expense = filtered.filter(b => b.type === 'expense').reduce((sum, b) => sum + b.amount, 0);

    const expenseCats: Record<string, number> = {};
    const incomeCats: Record<string, number> = {};

    filtered.forEach(b => {
      if (b.type === 'expense') {
        expenseCats[b.category] = (expenseCats[b.category] || 0) + b.amount;
      } else {
        incomeCats[b.category] = (incomeCats[b.category] || 0) + b.amount;
      }
    });

    const toArray = (obj: Record<string, number>, total: number): CategoryStat[] =>
      Object.entries(obj)
        .map(([name, amount]) => ({
          name,
          amount,
          percentage: total > 0 ? (amount / total) * 100 : 0,
          icon: categories.find(c => c.name === name)?.icon || 'MoreHorizontal',
        }))
        .sort((a, b) => b.amount - a.amount);

    const daysInMonth = new Date(year, month, 0).getDate();
    const dailyTrend: TrendItem[] = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const dayStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayBills = filtered.filter(b => b.date === dayStr);
      const di = dayBills.filter(b => b.type === 'income').reduce((s, b) => s + b.amount, 0);
      const de = dayBills.filter(b => b.type === 'expense').reduce((s, b) => s + b.amount, 0);
      return { label: `${day}日`, income: di, expense: de, balance: di - de };
    });

    return {
      income,
      expense,
      balance: income - expense,
      expenseCategories: toArray(expenseCats, expense),
      incomeCategories: toArray(incomeCats, income),
      hasData: filtered.length > 0,
      trend: dailyTrend,
    };
  }, [walletBills, year, month, categories]);

  const yearStats = useMemo(() => {
    const filtered = walletBills.filter(b => {
      const [y] = b.date.split('-').map(Number);
      return y === year;
    });

    const income = filtered.filter(b => b.type === 'income').reduce((sum, b) => sum + b.amount, 0);
    const expense = filtered.filter(b => b.type === 'expense').reduce((sum, b) => sum + b.amount, 0);

    const monthly: TrendItem[] = Array.from({ length: 12 }, (_, i) => {
      const m = i + 1;
      const monthBills = filtered.filter(b => Number(b.date.split('-')[1]) === m);
      const mi = monthBills.filter(b => b.type === 'income').reduce((sum, b) => sum + b.amount, 0);
      const me = monthBills.filter(b => b.type === 'expense').reduce((sum, b) => sum + b.amount, 0);
      return { label: `${m}月`, income: mi, expense: me, balance: mi - me };
    });

    const expenseCats: Record<string, number> = {};
    filtered.forEach(b => {
      if (b.type === 'expense') {
        expenseCats[b.category] = (expenseCats[b.category] || 0) + b.amount;
      }
    });

    const expenseCategories: CategoryStat[] = Object.entries(expenseCats)
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: expense > 0 ? (amount / expense) * 100 : 0,
        icon: categories.find(c => c.name === name)?.icon || 'MoreHorizontal',
      }))
      .sort((a, b) => b.amount - a.amount);

    return {
      income,
      expense,
      balance: income - expense,
      monthlyTrend: monthly,
      expenseCategories,
      hasData: filtered.length > 0,
      trend: monthly,
    };
  }, [walletBills, year, categories]);

  const currentLabel = tab === 'month' ? `${year}年${month}月` : `${year}年`;

  const handleConfirmPicker = (y: number, m?: number) => {
    setYear(y);
    if (m !== undefined) setMonth(m);
    setShowPicker(false);
  };

  const renderIcon = (iconName: string, className?: string) => {
    const Icon = (Icons as unknown as Record<string, React.FC<{ className?: string }>>)[iconName] || Icons.Circle;
    return <Icon className={className} />;
  };

  const stats = tab === 'month' ? monthStats : yearStats;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 pb-20">
      <header className="fixed top-0 left-0 right-0 z-40 bg-white dark:bg-gray-800 px-4 shadow-sm transition-colors duration-300">
        <div className="max-w-4xl mx-auto">
          <div className="h-12 flex items-center justify-center">
            <div className="tab-container">
              <button
                onClick={() => setTab('month')}
                className={`tab-item ${tab === 'month' ? 'tab-item-active-income' : ''}`}
              >
                月
              </button>
              <button
                onClick={() => setTab('year')}
                className={`tab-item ${tab === 'year' ? 'tab-item-active-income' : ''}`}
              >
                年
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-16 pb-4 space-y-4">
        <div className="flex justify-center pt-2">
          <button
            onClick={() => setShowPicker(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-card hover:shadow-card-hover transition-all"
          >
            <Calendar className="w-4 h-4" />
            <span>{currentLabel}</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        <StatCard
          income={stats.income}
          expense={stats.expense}
          balance={stats.balance}
          color={currentWallet?.color}
        />

        <TrendChart
          data={stats.trend}
          trendMode={trendMode}
          onChangeMode={setTrendMode}
        />

        {!stats.hasData ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>暂无账单数据</p>
          </div>
        ) : (
          <>
            {tab === 'month' && (monthStats.incomeCategories.length > 0 || monthStats.expenseCategories.length > 0) && (
              <>
                {monthStats.expenseCategories.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-card shadow-card p-4 transition-colors duration-300">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">支出分类</h3>
                    <div className="space-y-3">
                      {monthStats.expenseCategories.map((cat) => (
                        <CategoryBarItem key={cat.name} stat={cat} renderIcon={renderIcon} type="expense" />
                      ))}
                    </div>
                  </div>
                )}

                {monthStats.incomeCategories.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-card shadow-card p-4 transition-colors duration-300">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">收入分类</h3>
                    <div className="space-y-3">
                      {monthStats.incomeCategories.map((cat) => (
                        <CategoryBarItem key={cat.name} stat={cat} renderIcon={renderIcon} type="income" />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {tab === 'year' && yearStats.expenseCategories.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-card shadow-card p-4 transition-colors duration-300">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">支出分类排行</h3>
                <div className="space-y-3">
                  {yearStats.expenseCategories.map((cat) => (
                    <CategoryBarItem key={cat.name} stat={cat} renderIcon={renderIcon} type="expense" />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <YearMonthPicker
        isOpen={showPicker}
        mode={tab}
        initialYear={year}
        initialMonth={month}
        onClose={() => setShowPicker(false)}
        onConfirm={handleConfirmPicker}
        minYear={minYear}
        maxYear={maxYear}
      />
    </div>
  );
}

function TrendChart({
  data,
  trendMode,
  onChangeMode,
}: {
  data: TrendItem[];
  trendMode: 'all' | 'income' | 'expense' | 'balance';
  onChangeMode: (mode: 'all' | 'income' | 'expense' | 'balance') => void;
}) {
  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
  const axisColor = isDark ? '#9ca3af' : '#6b7280';
  const gridColor = isDark ? '#374151' : '#e5e7eb';

  const showIncome = trendMode === 'all' || trendMode === 'income';
  const showExpense = trendMode === 'all' || trendMode === 'expense';
  const showBalance = trendMode === 'all' || trendMode === 'balance';

  const options: { key: typeof trendMode; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'income', label: '收入' },
    { key: 'expense', label: '支出' },
    { key: 'balance', label: '结余' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-card shadow-card p-4 transition-colors duration-300">
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap="20%" margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="label"
              tick={{ fill: axisColor, fontSize: 10 }}
              axisLine={{ stroke: gridColor }}
              tickLine={{ stroke: gridColor }}
              interval="preserveStartEnd"
              minTickGap={16}
            />
            <YAxis
              tick={{ fill: axisColor, fontSize: 10 }}
              axisLine={{ stroke: gridColor }}
              tickLine={{ stroke: gridColor }}
              tickFormatter={(v: number) => `¥${v}`}
            />
            <Tooltip
              formatter={(value: number, name: string) => [`¥${value.toFixed(2)}`, name]}
              contentStyle={{
                backgroundColor: isDark ? '#1f2937' : '#ffffff',
                borderColor: gridColor,
                borderRadius: '0.5rem',
                fontSize: 12,
                color: isDark ? '#f3f4f6' : '#1f2937',
              }}
            />
            <ReferenceLine y={0} stroke={gridColor} />
            {showIncome && (
              <Bar dataKey="income" name="收入" fill="#10b981" radius={[2, 2, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`income-${index}`} fill={entry.income >= 0 ? '#10b981' : '#ef4444'} />
                ))}
              </Bar>
            )}
            {showExpense && (
              <Bar dataKey="expense" name="支出" fill="#ef4444" radius={[2, 2, 0, 0]} />
            )}
            {showBalance && (
              <Bar dataKey="balance" name="结余" fill="#3b82f6" radius={[2, 2, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`balance-${index}`} fill={entry.balance >= 0 ? '#3b82f6' : '#f87171'} />
                ))}
              </Bar>
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-center mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
        <div className="tab-container">
          {options.map((opt) => (
            <button
              key={opt.key}
              onClick={() => onChangeMode(opt.key)}
              className={`tab-item ${trendMode === opt.key ? 'bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-100 shadow-sm' : ''}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function CategoryBarItem({ stat, renderIcon, type }: {
  stat: CategoryStat;
  renderIcon: (name: string, className?: string) => React.ReactNode;
  type: 'income' | 'expense';
}) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${type === 'income' ? 'bg-income-500/10' : 'bg-expense-500/10'}`}>
        {renderIcon(stat.icon, `w-4 h-4 ${type === 'income' ? 'text-income-500' : 'text-expense-500'}`)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{stat.name}</span>
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">¥{stat.amount.toFixed(2)}</span>
        </div>
        <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${type === 'income' ? 'bg-income-500' : 'bg-expense-500'}`}
            style={{ width: `${Math.min(stat.percentage, 100)}%` }}
          />
        </div>
        <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{stat.percentage.toFixed(1)}%</div>
      </div>
    </div>
  );
}

function YearMonthPicker({
  isOpen,
  mode,
  initialYear,
  initialMonth,
  onClose,
  onConfirm,
  minYear,
  maxYear,
}: {
  isOpen: boolean;
  mode: 'year' | 'month';
  initialYear: number;
  initialMonth: number;
  onClose: () => void;
  onConfirm: (year: number, month?: number) => void;
  minYear: number;
  maxYear: number;
}) {
  const [viewYear, setViewYear] = useState(initialYear);
  const [viewMonth, setViewMonth] = useState(initialMonth);
  const [pageStartYear, setPageStartYear] = useState(initialYear - 5);

  useEffect(() => {
    if (isOpen) {
      setViewYear(initialYear);
      setViewMonth(initialMonth);
      setPageStartYear(initialYear - 5);
    }
  }, [isOpen, initialYear, initialMonth]);

  if (!isOpen) return null;

  const handlePrev = () => {
    if (mode === 'year') {
      const newStart = pageStartYear - 12;
      setPageStartYear(newStart);
    } else {
      if (viewYear > minYear) setViewYear(viewYear - 1);
    }
  };

  const handleNext = () => {
    if (mode === 'year') {
      const newStart = pageStartYear + 12;
      setPageStartYear(newStart);
    } else {
      if (viewYear < maxYear) setViewYear(viewYear + 1);
    }
  };

  const canGoPrev = mode === 'year' ? true : viewYear > minYear;
  const canGoNext = mode === 'year' ? true : viewYear < maxYear;

  const handleConfirm = () => {
    if (mode === 'year') {
      onConfirm(viewYear);
    } else {
      onConfirm(viewYear, viewMonth);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-modal w-full max-w-[280px] overflow-hidden animate-scale-in">
        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">选择日期</h3>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <X className="w-3 h-3 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-3">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={handlePrev}
              disabled={!canGoPrev}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-sm transition-colors ${
                canGoPrev
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  : 'bg-gray-50 dark:bg-gray-800 text-gray-300 dark:text-gray-700 cursor-not-allowed'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              {mode === 'year'
                ? `${pageStartYear} - ${pageStartYear + 11}`
                : `${viewYear}年`}
            </span>
            <button
              onClick={handleNext}
              disabled={!canGoNext}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-sm transition-colors ${
                canGoNext
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  : 'bg-gray-50 dark:bg-gray-800 text-gray-300 dark:text-gray-700 cursor-not-allowed'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {mode === 'year' ? (
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 12 }, (_, i) => {
                const y = pageStartYear + i;
                const isDisabled = y < minYear || y > maxYear;
                const isSelected = y === viewYear;
                return (
                  <button
                    key={y}
                    onClick={() => !isDisabled && setViewYear(y)}
                    disabled={isDisabled}
                    className={`py-2 text-xs font-medium rounded-md transition-colors ${
                      isSelected
                        ? 'bg-primary-500 text-white'
                        : isDisabled
                        ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {y}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
                const isSelected = m === viewMonth;
                return (
                  <button
                    key={m}
                    onClick={() => setViewMonth(m)}
                    className={`py-2 text-xs font-medium rounded-md transition-colors ${
                      isSelected
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {m}月
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-xs text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-r border-gray-100 dark:border-gray-700"
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-2.5 text-xs text-primary-500 dark:text-primary-400 font-medium hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );
}
