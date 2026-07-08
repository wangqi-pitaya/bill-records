import { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useBillStore } from '../../store/useBillStore';
import { useWalletStore } from '../../store/useWalletStore';
import { useCategoryStore } from '../../store/useCategoryStore';
import { StatCard } from '../../components/StatCard';
import { FilterDrawer } from '../../components/FilterDrawer';
import { YearMonthPicker } from '../../components/Calendar';
import { Icon } from '../../components/Icon';
import { FilterOptions } from '../../types';
import { formatMoney, filterBillsByWallet, getDateRangeByPreset } from '../../lib/utils';

export default function Statistics() {
  const [tab, setTab] = useState<'month' | 'year'>('month');
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [showPicker, setShowPicker] = useState(false);
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

  const stats = useMemo(() => {
    const filtered = walletBills.filter((b) => {
      const [y, m] = b.date.split('-').map(Number);
      if (tab === 'month') {
        return y === year && m === month;
      }
      return y === year;
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

    const toArray = (obj: Record<string, number>, total: number) =>
      Object.entries(obj)
        .map(([name, amount]) => ({
          name,
          amount,
          percentage: total > 0 ? (amount / total) * 100 : 0,
          icon: categories.find((c) => c.name === name)?.icon || 'MoreHorizontal',
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
  }, [walletBills, year, month, tab, categories]);

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
  };

  const [pieType, setPieType] = useState<'expense' | 'income'>('expense');
  const list = pieType === 'expense' ? stats.expenseCategories : stats.incomeCategories;
  const total = pieType === 'expense' ? stats.expense : stats.income;

  return (
    <View className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-4">
      {/* Header */}
      <View className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 px-4 shadow-sm">
        <View className="h-12 flex items-center justify-between">
          <View className="w-8" />
          <View className="flex rounded-lg bg-gray-100 dark:bg-gray-700 p-1">
            <View
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                tab === 'month'
                  ? 'bg-white dark:bg-gray-600 text-blue-500 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
              onClick={() => setTab('month')}
            >
              <Text>月</Text>
            </View>
            <View
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                tab === 'year'
                  ? 'bg-white dark:bg-gray-600 text-blue-500 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
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
            <Icon name="SlidersHorizontal" size={20} />
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

          {!stats.hasData ? (
            <View className="text-center py-12">
              <Icon name="BarChart3" size={48} className="text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <Text className="text-gray-500 dark:text-gray-400">暂无账单数据</Text>
            </View>
          ) : (
            <>
              {/* Category Stats */}
              <View className="bg-white dark:bg-gray-800 rounded-card shadow-card p-4">
                <Text className="text-sm font-semibold text-center text-gray-700 dark:text-gray-300 mb-4 block">
                  分类统计
                </Text>

                {list.length > 0 ? (
                  <View className="space-y-4">
                    <View className="flex justify-center mb-3">
                      <View className="flex rounded-lg bg-gray-100 dark:bg-gray-700 p-1">
                        <View
                          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                            pieType === 'expense'
                              ? 'bg-white dark:bg-gray-600 text-red-500 shadow-sm'
                              : 'text-gray-600 dark:text-gray-400'
                          }`}
                          onClick={() => setPieType('expense')}
                        >
                          <Text>支出</Text>
                        </View>
                        <View
                          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                            pieType === 'income'
                              ? 'bg-white dark:bg-gray-600 text-green-500 shadow-sm'
                              : 'text-gray-600 dark:text-gray-400'
                          }`}
                          onClick={() => setPieType('income')}
                        >
                          <Text>收入</Text>
                        </View>
                      </View>
                    </View>

                    <View className="space-y-3">
                      {list.map((cat) => (
                        <View key={cat.name} className="flex items-center gap-3 p-2">
                          <View
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                              pieType === 'income' ? 'bg-green-500/10' : 'bg-red-500/10'
                            }`}
                          >
                            <Icon
                              name={cat.icon}
                              size={16}
                              className={pieType === 'income' ? 'text-green-500' : 'text-red-500'}
                            />
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
                                className={`h-full rounded-full transition-all duration-500 ${
                                  pieType === 'income' ? 'bg-green-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${Math.min(cat.percentage, 100)}%` }}
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
                  <Text className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
                    暂无{pieType === 'expense' ? '支出' : '收入'}分类数据
                  </Text>
                )}
              </View>
            </>
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
