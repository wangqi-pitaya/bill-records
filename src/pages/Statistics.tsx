import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, BarChart3, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import * as Icons from 'lucide-react';
import { useBillStore } from '../store/useBillStore';
import { useWalletStore } from '../store/useWalletStore';
import { useCategoryStore } from '../store/useCategoryStore';
import { filterBillsByWallet } from '../lib/utils';

interface CategoryStat {
  name: string;
  amount: number;
  percentage: number;
  icon: string;
}

export default function Statistics() {
  const [tab, setTab] = useState<'month' | 'year'>('month');
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  const { bills } = useBillStore();
  const { currentWalletId } = useWalletStore();
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

    return {
      income,
      expense,
      balance: income - expense,
      expenseCategories: toArray(expenseCats, expense),
      incomeCategories: toArray(incomeCats, income),
      hasData: filtered.length > 0,
    };
  }, [walletBills, year, month, categories]);

  const yearStats = useMemo(() => {
    const filtered = walletBills.filter(b => {
      const [y] = b.date.split('-').map(Number);
      return y === year;
    });

    const income = filtered.filter(b => b.type === 'income').reduce((sum, b) => sum + b.amount, 0);
    const expense = filtered.filter(b => b.type === 'expense').reduce((sum, b) => sum + b.amount, 0);

    const monthly = Array.from({ length: 12 }, (_, i) => {
      const m = i + 1;
      const monthBills = filtered.filter(b => Number(b.date.split('-')[1]) === m);
      const mi = monthBills.filter(b => b.type === 'income').reduce((sum, b) => sum + b.amount, 0);
      const me = monthBills.filter(b => b.type === 'expense').reduce((sum, b) => sum + b.amount, 0);
      return { month: m, income: mi, expense: me };
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
    };
  }, [walletBills, year, categories]);

  const changeYear = (delta: number) => {
    const newYear = year + delta;
    if (newYear >= minYear && newYear <= maxYear) {
      setYear(newYear);
    }
  };

  const changeMonth = (delta: number) => {
    let newMonth = month + delta;
    let newYear = year;
    if (newMonth > 12) {
      newMonth = 1;
      newYear = year + 1;
    } else if (newMonth < 1) {
      newMonth = 12;
      newYear = year - 1;
    }
    if (newYear >= minYear && newYear <= maxYear) {
      setYear(newYear);
      setMonth(newMonth);
    }
  };

  const renderIcon = (iconName: string, className?: string) => {
    const Icon = (Icons as unknown as Record<string, React.FC<{ className?: string }>>)[iconName] || Icons.Circle;
    return <Icon className={className} />;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 pb-20">
      <header className="fixed top-0 left-0 right-0 z-40 bg-white dark:bg-gray-800 px-4 shadow-sm transition-colors duration-300">
        <div className="max-w-4xl mx-auto">
          <div className="h-12 flex items-center justify-center">
            <h1 className="text-lg font-bold text-gray-800 dark:text-gray-100">统计</h1>
          </div>
          <div className="flex border-b border-gray-100 dark:border-gray-700">
            <button
              onClick={() => setTab('month')}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors relative ${
                tab === 'month'
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              月度统计
              {tab === 'month' && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary-500 rounded-full" />
              )}
            </button>
            <button
              onClick={() => setTab('year')}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors relative ${
                tab === 'year'
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              年度统计
              {tab === 'year' && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary-500 rounded-full" />
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-[88px] pb-4">
        {tab === 'month' ? (
          <MonthView
            year={year}
            month={month}
            onChangeYear={changeYear}
            onChangeMonth={changeMonth}
            stats={monthStats}
            renderIcon={renderIcon}
            minYear={minYear}
            maxYear={maxYear}
          />
        ) : (
          <YearView
            year={year}
            onChangeYear={changeYear}
            stats={yearStats}
            renderIcon={renderIcon}
            minYear={minYear}
            maxYear={maxYear}
          />
        )}
      </main>
    </div>
  );
}

function MonthView({ year, month, onChangeYear, onChangeMonth, stats, renderIcon, minYear, maxYear }: {
  year: number;
  month: number;
  onChangeYear: (d: number) => void;
  onChangeMonth: (d: number) => void;
  stats: {
    income: number;
    expense: number;
    balance: number;
    expenseCategories: CategoryStat[];
    incomeCategories: CategoryStat[];
    hasData: boolean;
  };
  renderIcon: (name: string, className?: string) => React.ReactNode;
  minYear: number;
  maxYear: number;
}) {
  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 rounded-card shadow-card p-4 transition-colors duration-300">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => onChangeYear(-1)}
            disabled={year <= minYear}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-base font-bold text-gray-800 dark:text-gray-100">{year}年</span>
          <button
            onClick={() => onChangeYear(1)}
            disabled={year >= maxYear}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <button
            onClick={() => onChangeMonth(-1)}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-lg font-bold text-primary-600 dark:text-primary-400">{month}月</span>
          <button
            onClick={() => onChangeMonth(1)}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <OverviewCard
          icon={<TrendingUp className="w-5 h-5 text-income-500" />}
          label="收入"
          amount={stats.income}
          color="text-income-600 dark:text-income-400"
        />
        <OverviewCard
          icon={<TrendingDown className="w-5 h-5 text-expense-500" />}
          label="支出"
          amount={stats.expense}
          color="text-expense-600 dark:text-expense-400"
        />
        <OverviewCard
          icon={<Wallet className="w-5 h-5 text-primary-500" />}
          label="结余"
          amount={stats.balance}
          color={stats.balance >= 0 ? 'text-income-600 dark:text-income-400' : 'text-expense-600 dark:text-expense-400'}
        />
      </div>

      {!stats.hasData ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>{year}年{month}月暂无账单数据</p>
        </div>
      ) : (
        <>
          {stats.expenseCategories.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-card shadow-card p-4 transition-colors duration-300">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">支出分类</h3>
              <div className="space-y-3">
                {stats.expenseCategories.map((cat) => (
                  <CategoryBarItem key={cat.name} stat={cat} renderIcon={renderIcon} type="expense" />
                ))}
              </div>
            </div>
          )}

          {stats.incomeCategories.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-card shadow-card p-4 transition-colors duration-300">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">收入分类</h3>
              <div className="space-y-3">
                {stats.incomeCategories.map((cat) => (
                  <CategoryBarItem key={cat.name} stat={cat} renderIcon={renderIcon} type="income" />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function YearView({ year, onChangeYear, stats, renderIcon, minYear, maxYear }: {
  year: number;
  onChangeYear: (d: number) => void;
  stats: {
    income: number;
    expense: number;
    balance: number;
    monthlyTrend: { month: number; income: number; expense: number }[];
    expenseCategories: CategoryStat[];
    hasData: boolean;
  };
  renderIcon: (name: string, className?: string) => React.ReactNode;
  minYear: number;
  maxYear: number;
}) {
  const maxMonthly = Math.max(...stats.monthlyTrend.map(m => Math.max(m.income, m.expense)), 1);

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 rounded-card shadow-card p-4 transition-colors duration-300">
        <div className="flex items-center justify-between">
          <button
            onClick={() => onChangeYear(-1)}
            disabled={year <= minYear}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-lg font-bold text-primary-600 dark:text-primary-400">{year}年</span>
          <button
            onClick={() => onChangeYear(1)}
            disabled={year >= maxYear}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <OverviewCard
          icon={<TrendingUp className="w-5 h-5 text-income-500" />}
          label="收入"
          amount={stats.income}
          color="text-income-600 dark:text-income-400"
        />
        <OverviewCard
          icon={<TrendingDown className="w-5 h-5 text-expense-500" />}
          label="支出"
          amount={stats.expense}
          color="text-expense-600 dark:text-expense-400"
        />
        <OverviewCard
          icon={<Wallet className="w-5 h-5 text-primary-500" />}
          label="结余"
          amount={stats.balance}
          color={stats.balance >= 0 ? 'text-income-600 dark:text-income-400' : 'text-expense-600 dark:text-expense-400'}
        />
      </div>

      {!stats.hasData ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>{year}年暂无账单数据</p>
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-card shadow-card p-4 transition-colors duration-300">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">月度趋势</h3>
            <div className="space-y-2">
              {stats.monthlyTrend.map((m) => (
                <div key={m.month} className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400 w-8 shrink-0">{m.month}月</span>
                  <div className="flex-1 h-6 relative bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden">
                    {m.expense > 0 && (
                      <div
                        className="absolute left-0 top-0 h-full bg-expense-500/80 rounded-r-md flex items-center justify-end pr-1"
                        style={{ width: `${Math.min((m.expense / maxMonthly) * 100, 100)}%` }}
                      >
                        {m.expense > maxMonthly * 0.15 && (
                          <span className="text-[10px] text-white font-medium">{m.expense.toFixed(0)}</span>
                        )}
                      </div>
                    )}
                  </div>
                  {m.income > 0 && (
                    <span className="text-xs text-income-500 w-14 text-right shrink-0">+{m.income.toFixed(0)}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {stats.expenseCategories.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-card shadow-card p-4 transition-colors duration-300">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">支出分类排行</h3>
              <div className="space-y-3">
                {stats.expenseCategories.map((cat) => (
                  <CategoryBarItem key={cat.name} stat={cat} renderIcon={renderIcon} type="expense" />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function OverviewCard({ icon, label, amount, color }: {
  icon: React.ReactNode;
  label: string;
  amount: number;
  color: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-card shadow-card p-3 transition-colors duration-300">
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
      </div>
      <div className={`text-base font-bold truncate ${color}`}>¥{amount.toFixed(2)}</div>
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
