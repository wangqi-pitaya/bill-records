import { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useBillStore } from '../../store/useBillStore';
import { useWalletStore } from '../../store/useWalletStore';
import { useCategoryStore } from '../../store/useCategoryStore';
import { StatCard } from '../../components/StatCard';
import { FilterDrawer } from '../../components/FilterDrawer';
import { YearMonthPicker } from '../../components/Calendar';
import { EChartsWrap } from '../../components/ECharts';
import { Icon } from '../../components/Icon';
import { FilterOptions } from '../../types';
import {
  formatMoney,
  filterBillsByWallet,
  getDateRangeByPreset,
} from '../../lib/utils';
import type { EChartsOption } from 'echarts';

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

const PIE_COLORS = [
  '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1',
  '#14b8a6', '#a855f7', '#d946ef', '#22c55e', '#eab308',
];

export default function Statistics() {
  const [tab, setTab] = useState<'month' | 'year'>('month');
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [showPicker, setShowPicker] = useState(false);
  const [trendMode, setTrendMode] = useState<'all' | 'income' | 'expense'>('expense');
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [pieType, setPieType] = useState<'expense' | 'income'>('expense');
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    walletId: 'all',
    datePreset: 'all',
    startDate: '',
    endDate: '',
  });

  const { bills } = useBillStore();
  const { currentWalletId, wallets } = useWalletStore();
  const { categories } = useCategoryStore();

  const statsWalletId = filters.walletId !== 'all' ? filters.walletId : currentWalletId;
  const statsWallet = wallets.find((w) => w.id === statsWalletId);

  const walletBills = useMemo(() => {
    let result = filterBillsByWallet(bills, statsWalletId);
    if (filters.datePreset !== 'all') {
      const { start, end } = getDateRangeByPreset(filters.datePreset, filters.startDate, filters.endDate);
      if (start && end) {
        result = result.filter((b) => b.date >= start && b.date <= end);
      }
    }
    return result;
  }, [bills, statsWalletId, filters]);

  const toCategoryArray = (obj: Record<string, number>, total: number): CategoryStat[] =>
    Object.entries(obj)
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0,
        icon: categories.find((c) => c.name === name)?.icon || 'MoreHorizontal',
      }))
      .sort((a, b) => b.amount - a.amount);

  const monthStats = useMemo(() => {
    const filtered = walletBills.filter((b) => {
      const [y, m] = b.date.split('-').map(Number);
      return y === year && m === month;
    });

    const income = filtered.filter((b) => b.type === 'income').reduce((sum, b) => sum + b.amount, 0);
    const expense = filtered.filter((b) => b.type === 'expense').reduce((sum, b) => sum + b.amount, 0);

    const expenseCats: Record<string, number> = {};
    const incomeCats: Record<string, number> = {};

    filtered.forEach((b) => {
      if (b.type === 'expense') {
        expenseCats[b.category] = (expenseCats[b.category] || 0) + b.amount;
      } else {
        incomeCats[b.category] = (incomeCats[b.category] || 0) + b.amount;
      }
    });

    const daysInMonth = new Date(year, month, 0).getDate();
    const dailyTrend: TrendItem[] = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const dayStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayBills = filtered.filter((b) => b.date === dayStr);
      const di = dayBills.filter((b) => b.type === 'income').reduce((s, b) => s + b.amount, 0);
      const de = dayBills.filter((b) => b.type === 'expense').reduce((s, b) => s + b.amount, 0);
      return { label: `${day}日`, income: di, expense: de, balance: di - de };
    });

    return {
      income,
      expense,
      balance: income - expense,
      expenseCategories: toCategoryArray(expenseCats, expense),
      incomeCategories: toCategoryArray(incomeCats, income),
      hasData: filtered.length > 0,
      trend: dailyTrend,
    };
  }, [walletBills, year, month, categories]);

  const yearStats = useMemo(() => {
    const filtered = walletBills.filter((b) => {
      const [y] = b.date.split('-').map(Number);
      return y === year;
    });

    const income = filtered.filter((b) => b.type === 'income').reduce((sum, b) => sum + b.amount, 0);
    const expense = filtered.filter((b) => b.type === 'expense').reduce((sum, b) => sum + b.amount, 0);

    const monthly: TrendItem[] = Array.from({ length: 12 }, (_, i) => {
      const m = i + 1;
      const monthBills = filtered.filter((b) => Number(b.date.split('-')[1]) === m);
      const mi = monthBills.filter((b) => b.type === 'income').reduce((sum, b) => sum + b.amount, 0);
      const me = monthBills.filter((b) => b.type === 'expense').reduce((sum, b) => sum + b.amount, 0);
      return { label: `${m}月`, income: mi, expense: me, balance: mi - me };
    });

    const expenseCats: Record<string, number> = {};
    const incomeCats: Record<string, number> = {};
    filtered.forEach((b) => {
      if (b.type === 'expense') {
        expenseCats[b.category] = (expenseCats[b.category] || 0) + b.amount;
      } else {
        incomeCats[b.category] = (incomeCats[b.category] || 0) + b.amount;
      }
    });

    return {
      income,
      expense,
      balance: income - expense,
      expenseCategories: toCategoryArray(expenseCats, expense),
      incomeCategories: toCategoryArray(incomeCats, income),
      hasData: filtered.length > 0,
      trend: monthly,
    };
  }, [walletBills, year, categories]);

  const stats = tab === 'month' ? monthStats : yearStats;

  const currentLabel =
    filters.datePreset !== 'all'
      ? filters.datePreset === 'thisMonth'
        ? '本月'
        : filters.datePreset === 'lastMonth'
        ? '上月'
        : filters.datePreset === 'thisYear'
        ? '今年'
        : filters.datePreset === 'lastYear'
        ? '去年'
        : '自定义'
      : tab === 'month'
      ? `${year}年${month}月`
      : `${year}年`;

  const hasActiveFilters = filters.walletId !== 'all' || filters.datePreset !== 'all';

  const handleConfirmPicker = (date: string) => {
    const [y, m] = date.split('-').map(Number);
    setYear(y);
    setMonth(m);
    setShowPicker(false);
    setFilters({
      walletId: 'all',
      datePreset: 'all',
      startDate: '',
      endDate: '',
    });
  };

  const textColor = '#4b5563';
  const axisLineColor = '#e5e7eb';
  const splitLineColor = '#f3f4f6';

  const trendOption: EChartsOption = useMemo(() => {
    const series: any[] = [];
    if (trendMode === 'all' || trendMode === 'income') {
      series.push({
        name: '收入',
        type: chartType,
        data: stats.trend.map((d) => d.income),
        itemStyle: { color: '#10b981', borderRadius: chartType === 'bar' ? [3, 3, 0, 0] : 0 },
        smooth: chartType === 'line',
        symbol: 'circle',
        symbolSize: chartType === 'line' ? 4 : 0,
        lineStyle: chartType === 'line' ? { width: 2 } : undefined,
        areaStyle: chartType === 'line' ? { opacity: 0.15, color: '#10b981' } : undefined,
      });
    }
    if (trendMode === 'all' || trendMode === 'expense') {
      series.push({
        name: '支出',
        type: chartType,
        data: stats.trend.map((d) => d.expense),
        itemStyle: { color: '#ef4444', borderRadius: chartType === 'bar' ? [3, 3, 0, 0] : 0 },
        smooth: chartType === 'line',
        symbol: 'circle',
        symbolSize: chartType === 'line' ? 4 : 0,
        lineStyle: chartType === 'line' ? { width: 2 } : undefined,
        areaStyle: chartType === 'line' ? { opacity: 0.15, color: '#ef4444' } : undefined,
      });
    }

    return {
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#ffffff',
        borderColor: axisLineColor,
        borderWidth: 1,
        textStyle: { color: textColor, fontSize: 12 },
        formatter: (params: any) => {
          const d = Array.isArray(params) ? params : [params];
          let html = `<div style="font-weight:600;margin-bottom:4px;">${d[0].axisValueLabel}</div>`;
          d.forEach((p: any) => {
            const color = p.color;
            html += `<div style="display:flex;justify-content:space-between;gap:12px;"><span style="color:${color}">● ${p.seriesName}</span><span style="font-weight:600;">${formatMoney(p.value)}</span></div>`;
          });
          return html;
        },
      },
      grid: {
        left: 8,
        right: 8,
        top: 12,
        bottom: 24,
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: stats.trend.map((d) => d.label),
        axisLine: { lineStyle: { color: axisLineColor } },
        axisTick: { show: false },
        axisLabel: {
          color: textColor,
          fontSize: 10,
          interval: tab === 'year' ? 0 : 'auto',
          formatter: (val: string) => val.replace('月', '').replace('日', ''),
        },
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: splitLineColor } },
        axisLabel: {
          color: textColor,
          fontSize: 10,
          formatter: (v: number) => {
            if (v >= 10000) return (v / 10000).toFixed(1) + 'w';
            if (v >= 1000) return (v / 1000).toFixed(1) + 'k';
            return String(v);
          },
        },
      },
      series,
    } as EChartsOption;
  }, [stats.trend, trendMode, chartType, tab]);

  const pieList = pieType === 'expense' ? stats.expenseCategories : stats.incomeCategories;
  const pieTotal = pieType === 'expense' ? stats.expense : stats.income;

  const pieOption: EChartsOption = useMemo(() => {
    const data = pieList.map((item, idx) => ({
      name: item.name,
      value: item.amount,
      itemStyle: { color: PIE_COLORS[idx % PIE_COLORS.length] },
    }));

    return {
      tooltip: {
        trigger: 'item',
        backgroundColor: '#ffffff',
        borderColor: axisLineColor,
        borderWidth: 1,
        textStyle: { color: textColor, fontSize: 12 },
        formatter: (p: any) => {
          return `${p.name}<br/>金额: ${formatMoney(p.value)}<br/>占比: ${p.percent}%`;
        },
      },
      legend: { show: false },
      series: [
        {
          type: 'pie',
          radius: ['45%', '65%'],
          center: ['50%', '50%'],
          avoidLabelOverlap: true,
          itemStyle: {
            borderRadius: 2,
            borderColor: '#ffffff',
            borderWidth: 2,
          },
          label: {
            show: true,
            position: 'outside',
            color: textColor,
            fontSize: 11,
            formatter: (p: any) => {
              if (p.percent < 2) return '';
              return `{name|${p.name}}\n{value|${p.percent.toFixed(1)}%}`;
            },
            rich: {
              name: {
                color: textColor,
                fontSize: 11,
                padding: [0, 0, 2, 0],
              },
              value: {
                color: textColor,
                fontSize: 11,
                fontWeight: 600,
              },
            },
          },
          labelLine: {
            show: (p: any) => p.percent >= 2,
            length: 8,
            length2: 8,
            lineStyle: { color: axisLineColor },
          },
          data,
        },
      ],
    } as EChartsOption;
  }, [pieList]);

  return (
    <View className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-4">
      <View className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 px-4 shadow-sm">
        <View className="h-12 flex items-center justify-between">
          <View className="w-8" />
          <View className="flex rounded-lg bg-gray-100 dark:bg-gray-700 p-1">
            <View
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                tab === 'month'
                  ? 'bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-100 shadow-sm'
                  : 'text-gray-500'
              }`}
              onClick={() => setTab('month')}
            >
              <Text>月</Text>
            </View>
            <View
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                tab === 'year'
                  ? 'bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-100 shadow-sm'
                  : 'text-gray-500'
              }`}
              onClick={() => setTab('year')}
            >
              <Text>年</Text>
            </View>
          </View>
          <View
            className={`w-8 h-8 flex items-center justify-center relative active:bg-gray-100 dark:active:bg-gray-700 rounded-lg ${
              hasActiveFilters ? 'text-blue-500' : 'text-gray-700 dark:text-gray-300'
            }`}
            onClick={() => setShowFilter(true)}
          >
            <Icon name="Funnel" size={20} />
            {hasActiveFilters && (
              <View className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />
            )}
          </View>
        </View>
      </View>

      <ScrollView scrollY className="pt-12">
        <View className="px-4 py-4 space-y-4">
          <View className="flex justify-center pt-2">
            <View
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-card active:shadow-card-hover transition-all"
              onClick={() => setShowPicker(true)}
            >
              <Icon name="Calendar" size={16} />
              <Text>{currentLabel}</Text>
              <Icon name="ChevronDown" size={16} />
            </View>
          </View>

          <StatCard
            income={stats.income}
            expense={stats.expense}
            balance={stats.balance}
            color={statsWallet?.color}
          />

          <View className="bg-white dark:bg-gray-800 rounded-card shadow-card p-4">
            <View className="flex items-center justify-between mb-2">
              <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {tab === 'month' ? '按日统计' : '按月统计'}
              </Text>
              <View
                className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center active:bg-gray-200 dark:active:bg-gray-600"
                onClick={() => setChartType(chartType === 'bar' ? 'line' : 'bar')}
              >
                {chartType === 'bar' ? (
                  <Icon name="TrendingUp" size={16} className="text-gray-600 dark:text-gray-400" />
                ) : (
                  <Icon name="BarChart3" size={16} className="text-gray-600 dark:text-gray-400" />
                )}
              </View>
            </View>

            {stats.hasData ? (
              <View className="w-full">
                <EChartsWrap option={trendOption} height={320} />
              </View>
            ) : (
              <View className="h-[320rpx] flex items-center justify-center">
                <Text className="text-gray-400 dark:text-gray-500 text-sm">暂无数据</Text>
              </View>
            )}

            <View className="flex justify-center mt-3">
              <View className="flex rounded-lg bg-gray-100 dark:bg-gray-700 p-1">
                {[
                  { key: 'expense', label: '支出' },
                  { key: 'income', label: '收入' },
                  { key: 'all', label: '全部' },
                ].map((opt) => (
                  <View
                    key={opt.key}
                    className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                      trendMode === opt.key
                        ? 'bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-100 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                    onClick={() => setTrendMode(opt.key as typeof trendMode)}
                  >
                    <Text>{opt.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {!stats.hasData ? (
            <View className="text-center py-12">
              <Icon name="BarChart3" size={48} className="text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <Text className="text-gray-500 dark:text-gray-400">暂无账单数据</Text>
            </View>
          ) : (
            <View className="bg-white dark:bg-gray-800 rounded-card shadow-card p-4 space-y-3">
              {pieList.length > 0 ? (
                <View>
                  <EChartsWrap option={pieOption} height={340} />

                  <Text className="text-xs text-gray-400 dark:text-gray-500 text-center pt-2 block">
                    占比小于2%的分类不显示标签
                  </Text>

                  <View className="flex justify-center mt-3">
                    <View className="flex rounded-lg bg-gray-100 dark:bg-gray-700 p-1">
                      <View
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                          pieType === 'expense'
                            ? 'bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-100 shadow-sm'
                            : 'text-gray-500'
                        }`}
                        onClick={() => setPieType('expense')}
                      >
                        <Text>支出</Text>
                      </View>
                      <View
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                          pieType === 'income'
                            ? 'bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-100 shadow-sm'
                            : 'text-gray-500'
                        }`}
                        onClick={() => setPieType('income')}
                      >
                        <Text>收入</Text>
                      </View>
                    </View>
                  </View>

                  <View className="space-y-2 mt-3 px-2">
                    {pieList.map((cat, idx) => (
                      <View key={cat.name} className="flex items-center gap-3 p-2">
                        <View className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${pieType === 'income' ? 'bg-income-100' : 'bg-expense-100'}`}>
                          <Icon name={cat.icon} size={16} className={pieType === 'income' ? 'text-income-600' : 'text-expense-600'} />
                        </View>
                        <View className="flex-1 min-w-0">
                          <View className="flex items-center justify-between mb-1">
                            <Text className="text-sm font-medium truncate text-gray-700 dark:text-gray-300">
                              {cat.name}
                            </Text>
                            <Text className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                              {formatMoney(cat.amount)}
                            </Text>
                          </View>
                          <View className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <View
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${Math.min(cat.percentage, 100)}%`,
                                backgroundColor: PIE_COLORS[idx % PIE_COLORS.length],
                              }}
                            />
                          </View>
                          <Text className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                            {cat.percentage.toFixed(1)}%
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              ) : (
                <View className="flex justify-center">
                  <View className="flex rounded-lg bg-gray-100 dark:bg-gray-700 p-1">
                    <View
                      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        pieType === 'expense'
                          ? 'bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-100 shadow-sm'
                          : 'text-gray-500'
                      }`}
                      onClick={() => setPieType('expense')}
                    >
                      <Text>支出</Text>
                    </View>
                    <View
                      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        pieType === 'income'
                          ? 'bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-100 shadow-sm'
                          : 'text-gray-500'
                      }`}
                      onClick={() => setPieType('income')}
                    >
                      <Text>收入</Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          )}

          {stats.hasData && (
            <DetailTable
              tab={tab}
              data={stats.trend}
              expense={stats.expense}
            />
          )}
        </View>
      </ScrollView>

      <YearMonthPicker
        isOpen={showPicker}
        value={`${year}-${String(month).padStart(2, '0')}-01`}
        onConfirm={handleConfirmPicker}
        onClose={() => setShowPicker(false)}
        mode={tab === 'month' ? 'month' : 'year'}
      />

      <FilterDrawer
        isOpen={showFilter}
        onClose={() => setShowFilter(false)}
        filters={filters}
        onConfirm={setFilters}
      />
    </View>
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
  const count = data.length;
  const avgExpense = count > 0 ? expense / count : 0;

  const title = tab === 'month' ? '日明细' : '月明细';
  const avgLabel = tab === 'month' ? '日均支出' : '月均支出';

  return (
    <View className="bg-white dark:bg-gray-800 rounded-card shadow-card p-4">
      <View className="flex items-center justify-center mb-3">
        <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300">{title}</Text>
      </View>

      <View className="flex items-center justify-center mb-4">
        <Text className="text-xs text-gray-500 dark:text-gray-400">{avgLabel}</Text>
        <Text className="text-sm font-semibold text-expense-500 ml-2">{formatMoney(avgExpense)}</Text>
      </View>

      {data.length > 0 ? (
        <ScrollView scrollX className="overflow-x-auto">
          <View className="min-w-[320px]">
            <View className="flex border-b border-gray-100 dark:border-gray-700">
              <View className="w-20 py-2 px-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 sticky left-0 z-10">日期</View>
              <View className="w-24 py-2 px-3 text-right text-xs font-medium text-gray-600 dark:text-gray-400">收入</View>
              <View className="w-24 py-2 px-3 text-right text-xs font-medium text-gray-600 dark:text-gray-400">支出</View>
              <View className="w-24 py-2 px-3 text-right text-xs font-medium text-gray-600 dark:text-gray-400">结余</View>
            </View>
            {data.map((item, index) => (
              <View key={index} className="flex border-b border-gray-50 dark:border-gray-750 last:border-b-0">
                <View className="w-20 py-2 px-3 text-gray-700 dark:text-gray-300 text-xs bg-white dark:bg-gray-800 sticky left-0 z-10">{item.label}</View>
                <View className="w-24 py-2 px-3 text-right text-income-500 text-xs break-all">{item.income > 0 ? formatMoney(item.income) : '-'}</View>
                <View className="w-24 py-2 px-3 text-right text-expense-500 text-xs break-all">{item.expense > 0 ? formatMoney(item.expense) : '-'}</View>
                <View className={`w-24 py-2 px-3 text-right text-xs font-medium break-all ${item.balance >= 0 ? 'text-income-500' : 'text-expense-500'}`}>
                  {formatMoney(item.balance)}
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      ) : (
        <View className="text-center py-6 text-gray-400 dark:text-gray-500 text-sm">暂无明细数据</View>
      )}
    </View>
  );
}
