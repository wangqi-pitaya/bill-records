import { useState, useMemo, useEffect } from 'react';
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, BarChart3, X } from 'lucide-react';
import * as Icons from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
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
  const [trendMode, setTrendMode] = useState<'all' | 'income' | 'expense' | 'balance'>('expense');
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [pieType, setPieType] = useState<'expense' | 'income'>('expense');

  const handleTabChange = (newTab: 'month' | 'year') => {
    setTab(newTab);
    setTrendMode('expense');
    setPieType('expense');
  };

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
      monthlyTrend: monthly,
      expenseCategories: toArray(expenseCats, expense),
      incomeCategories: toArray(incomeCats, income),
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
                onClick={() => handleTabChange('month')}
                className={`tab-item ${tab === 'month' ? 'tab-item-active-income' : ''}`}
              >
                月
              </button>
              <button
                onClick={() => handleTabChange('year')}
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
          chartType={chartType}
          onChangeChartType={setChartType}
          title={tab === 'month' ? '按日统计' : '按月统计'}
        />

        {!stats.hasData ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>暂无账单数据</p>
          </div>
        ) : (
          <>
            <CategoryPieChart
              data={tab === 'month' ? monthStats : yearStats}
              renderIcon={renderIcon}
              pieType={pieType}
              onChangePieType={setPieType}
            />
            <DetailTable
              tab={tab}
              data={stats.trend}
              expense={stats.expense}
            />
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
  chartType,
  onChangeChartType,
  title,
}: {
  data: TrendItem[];
  trendMode: 'all' | 'income' | 'expense' | 'balance';
  onChangeMode: (mode: 'all' | 'income' | 'expense' | 'balance') => void;
  chartType: 'bar' | 'line';
  onChangeChartType: (type: 'bar' | 'line') => void;
  title: string;
}) {
  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
  const axisColor = isDark ? '#9ca3af' : '#6b7280';
  const gridColor = isDark ? '#374151' : '#e5e7eb';

  const COLOR_INCOME = '#10b981';
  const COLOR_EXPENSE = '#ef4444';
  const COLOR_BALANCE = '#60a5fa';

  const showIncome = trendMode === 'all' || trendMode === 'income';
  const showExpense = trendMode === 'all' || trendMode === 'expense';
  const showBalance = trendMode === 'all' || trendMode === 'balance';

  const options: { key: typeof trendMode; label: string }[] = [
    { key: 'expense', label: '支出' },
    { key: 'income', label: '收入' },
    { key: 'balance', label: '结余' },
    { key: 'all', label: '全部' },
  ];

  const renderChart = () => {
    const chartProps = {
      data,
      margin: { top: 8, right: 8, left: -20, bottom: 0 },
    };

    const barOrLineProps = {
      income: { dataKey: 'income', name: '收入', stroke: COLOR_INCOME, fill: COLOR_INCOME },
      expense: { dataKey: 'expense', name: '支出', stroke: COLOR_EXPENSE, fill: COLOR_EXPENSE },
      balance: { dataKey: 'balance', name: '结余', stroke: COLOR_BALANCE, fill: COLOR_BALANCE },
    };

    if (chartType === 'bar') {
      return (
        <BarChart {...chartProps} barCategoryGap="20%">
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
            cursor={{ fill: 'transparent' }}
          />
          <ReferenceLine y={0} stroke={gridColor} />
          {showIncome && <Bar {...barOrLineProps.income} radius={[2, 2, 0, 0]} stroke="none" />}
          {showExpense && <Bar {...barOrLineProps.expense} radius={[2, 2, 0, 0]} stroke="none" />}
          {showBalance && <Bar {...barOrLineProps.balance} radius={[2, 2, 0, 0]} stroke="none" />}
        </BarChart>
      );
    }

    return (
      <LineChart {...chartProps}>
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
          cursor={{ stroke: gridColor, strokeWidth: 1 }}
        />
        <ReferenceLine y={0} stroke={gridColor} />
        {showIncome && (
          <Line {...barOrLineProps.income} type="monotone" strokeWidth={2} dot={{ r: 3, strokeWidth: 0 }} activeDot={{ r: 5, strokeWidth: 0 }} />
        )}
        {showExpense && (
          <Line {...barOrLineProps.expense} type="monotone" strokeWidth={2} dot={{ r: 3, strokeWidth: 0 }} activeDot={{ r: 5, strokeWidth: 0 }} />
        )}
        {showBalance && (
          <Line {...barOrLineProps.balance} type="monotone" strokeWidth={2} dot={{ r: 3, strokeWidth: 0 }} activeDot={{ r: 5, strokeWidth: 0 }} />
        )}
      </LineChart>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-card shadow-card p-4 pb-5 transition-colors duration-300">
      <div className="flex items-center justify-center mb-3 relative">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{title}</h3>
        <button
          onClick={() => onChangeChartType(chartType === 'bar' ? 'line' : 'bar')}
          className="absolute right-0 w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          {chartType === 'bar' ? (
            <Icons.LineChart className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          ) : (
            <Icons.BarChart3 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          )}
        </button>
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>

      <div className="flex justify-center mt-4 pt-2 px-2">
        <div className="tab-container">
          {options.map((opt) => (
            <button
              key={opt.key}
              onClick={() => onChangeMode(opt.key)}
              className={`tab-item whitespace-nowrap ${trendMode === opt.key ? 'bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-100 shadow-sm' : ''}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function CategoryPieChart({
  data,
  renderIcon,
  pieType,
  onChangePieType,
}: {
  data: {
    expenseCategories: CategoryStat[];
    incomeCategories: CategoryStat[];
    expense: number;
    income: number;
  };
  renderIcon: (name: string, className?: string) => React.ReactNode;
  pieType: 'expense' | 'income';
  onChangePieType: (type: 'expense' | 'income') => void;
}) {

  const pieColors = [
    '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6',
    '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1',
    '#14b8a6', '#a855f7', '#d946ef', '#22c55e', '#eab308',
  ];

  const list = pieType === 'expense' ? data.expenseCategories : data.incomeCategories;
  const total = pieType === 'expense' ? data.expense : data.income;
  const pieData = list.map((item) => ({
    name: item.name,
    value: item.amount,
    percentage: item.percentage,
    icon: item.icon,
    color: pieColors[list.indexOf(item) % pieColors.length],
  }));

  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

  const paddingAngle = pieData.length === 1 ? 0 : 2;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-card shadow-card p-4 transition-colors duration-300 space-y-4">
      <div className="flex items-center justify-center mb-3 relative">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">分类统计</h3>
      </div>

      {pieData.length > 0 ? (
        <>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={paddingAngle}
                  label={(props: { name?: string; percent?: number; cx?: number; cy?: number; midAngle?: number; outerRadius?: number }) => {
                    const { name = '', percent = 0, cx = 0, cy = 0, midAngle = 0, outerRadius = 0 } = props;
                    const RADIAN = Math.PI / 180;
                    const radius = outerRadius + 12;
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                    const textColor = isDark ? '#d1d5db' : '#4b5563';
                    return (
                      <g>
                        <text x={x} y={y - 6} fill={textColor} textAnchor={x > cx ? 'start' : 'end'} fontSize={9}>
                          {name}
                        </text>
                        <text x={x} y={y + 6} fill={textColor} textAnchor={x > cx ? 'start' : 'end'} fontSize={9} fontWeight="600">
                          {(percent * 100).toFixed(0)}%
                        </text>
                      </g>
                    );
                  }}
                  labelLine={{ stroke: isDark ? '#6b7280' : '#9ca3af', strokeWidth: 1 }}
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                    />
                  ))}
                </Pie>
                <text
                  x="50%"
                  y="45%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={isDark ? '#9ca3af' : '#6b7280'}
                  fontSize={11}
                >
                  {pieType === 'expense' ? '支出' : '收入'}
                </text>
                <text
                  x="50%"
                  y="58%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={isDark ? '#f3f4f6' : '#1f2937'}
                  fontSize={14}
                  fontWeight="600"
                >
                  ¥{total.toFixed(2)}
                </text>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-center pt-3">
            <div className="tab-container">
              <button
                onClick={() => onChangePieType('expense')}
                className={`tab-item whitespace-nowrap ${pieType === 'expense' ? 'bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-100 shadow-sm' : ''}`}
              >
                支出
              </button>
              <button
                onClick={() => onChangePieType('income')}
                className={`tab-item whitespace-nowrap ${pieType === 'income' ? 'bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-100 shadow-sm' : ''}`}
              >
                收入
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {list.map((cat) => (
              <CategoryBarItem
                key={cat.name}
                stat={cat}
                renderIcon={renderIcon}
                type={pieType}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
          暂无{pieType === 'expense' ? '支出' : '收入'}分类数据
        </div>
      )}
    </div>
  );
}

function CategoryBarItem({ stat, renderIcon, type }: {
  stat: CategoryStat;
  renderIcon: (name: string, className?: string) => React.ReactNode;
  type: 'income' | 'expense';
}) {
  return (
    <div className="flex items-center gap-3 p-2">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${type === 'income' ? 'bg-income-500/10' : 'bg-expense-500/10'}`}>
        {renderIcon(stat.icon, `w-4 h-4 ${type === 'income' ? 'text-income-500' : 'text-expense-500'}`)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium truncate text-gray-700 dark:text-gray-300">{stat.name}</span>
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

function DetailTable({
  tab,
  data,
  expense,
}: {
  tab: 'month' | 'year';
  data: TrendItem[];
  expense: number;
}) {
  // 计算日均/月均支出
  const count = data.length;
  const avgExpense = count > 0 ? expense / count : 0;

  // 过滤有数据的行（至少有一项非零）
  const filteredData = data.filter(item => item.income !== 0 || item.expense !== 0 || item.balance !== 0);

  const title = tab === 'month' ? '日明细' : '月明细';
  const avgLabel = tab === 'month' ? '日均支出' : '月均支出';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-card shadow-card p-4 transition-colors duration-300">
      <div className="flex items-center justify-center mb-3">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{title}</h3>
      </div>

      <div className="flex items-center justify-center mb-4">
        <span className="text-xs text-gray-500 dark:text-gray-400">{avgLabel}</span>
        <span className="text-sm font-semibold text-expense-500 ml-2">¥{avgExpense.toFixed(2)}</span>
      </div>

      {filteredData.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[320px]" style={{ tableLayout: 'fixed' }}>
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700">
                <th
                  className="py-2 px-3 text-left font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap sticky left-0 bg-white dark:bg-gray-800 z-10"
                  style={{ width: '80px' }}
                >
                  日期
                </th>
                <th className="py-2 px-3 text-right font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap" style={{ width: '100px' }}>
                  收入
                </th>
                <th className="py-2 px-3 text-right font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap" style={{ width: '100px' }}>
                  支出
                </th>
                <th className="py-2 px-3 text-right font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap" style={{ width: '100px' }}>
                  结余
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-50 dark:border-gray-750 last:border-b-0"
                >
                  <td className="py-2 px-3 text-gray-700 dark:text-gray-300 whitespace-nowrap sticky left-0 bg-white dark:bg-gray-800 z-10">
                    {item.label}
                  </td>
                  <td className="py-2 px-3 text-right text-income-500 whitespace-nowrap">
                    {item.income > 0 ? `¥${item.income.toFixed(2)}` : '-'}
                  </td>
                  <td className="py-2 px-3 text-right text-expense-500 whitespace-nowrap">
                    {item.expense > 0 ? `¥${item.expense.toFixed(2)}` : '-'}
                  </td>
                  <td className={`py-2 px-3 text-right font-medium whitespace-nowrap ${
                    item.balance >= 0 ? 'text-income-500' : 'text-expense-500'
                  }`}>
                    ¥{item.balance.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-6 text-gray-400 dark:text-gray-500 text-sm">
          暂无明细数据
        </div>
      )}
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
