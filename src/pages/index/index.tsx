import { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useBillStore } from '../../store/useBillStore';
import { useWalletStore } from '../../store/useWalletStore';
import { useTheme } from '../../hooks/useTheme';
import { useToast } from '../../hooks/useToast';
import { useDateFilter } from '../../hooks/useDateFilter';
import { StatCard } from '../../components/StatCard';
import { BillItem } from '../../components/BillItem';
import { FloatingButton } from '../../components/FloatingButton';
import { YearMonthPicker } from '../../components/Calendar';
import { Icon } from '../../components/Icon';
import {
  getDateLabel,
  groupBillsByDate,
  filterBillsByDate,
  filterBillsByWallet,
  formatMoney,
} from '../../lib/utils';

export default function Index() {
  const { bills: allBills, softDeleteBill } = useBillStore();
  const { wallets, currentWalletId } = useWalletStore();
  const { isDark, toggleTheme } = useTheme();
  const toast = useToast();
  const dateFilter = useDateFilter();

  const [showDatePicker, setShowDatePicker] = useState(false);

  const currentWallet = useMemo(() => {
    return wallets.find((w) => w.id === currentWalletId);
  }, [wallets, currentWalletId]);

  const bills = useMemo(() => allBills.filter((b) => !b.deleted), [allBills]);

  const walletBills = useMemo(
    () => filterBillsByWallet(bills, currentWalletId),
    [bills, currentWalletId]
  );

  const filteredBills = useMemo(
    () => filterBillsByDate(walletBills, dateFilter.selectedYear, dateFilter.selectedMonth),
    [walletBills, dateFilter.selectedYear, dateFilter.selectedMonth]
  );

  const yearStatistics = useMemo(() => {
    const income = filteredBills.filter((b) => b.type === 'income').reduce((sum, b) => sum + b.amount, 0);
    const expense = filteredBills.filter((b) => b.type === 'expense').reduce((sum, b) => sum + b.amount, 0);
    return { income, expense, balance: income - expense };
  }, [filteredBills]);

  const groupedBills = groupBillsByDate(filteredBills);

  const handleOpenAdd = () => {
    Taro.navigateTo({ url: '/pages/bill-add/index' });
  };

  const handleEdit = (bill: { id: string }) => {
    Taro.navigateTo({ url: `/pages/bill-add/index?billId=${bill.id}` });
  };

  const handleDateConfirm = (date: string) => {
    const [y, m] = date.split('-').map(Number);
    dateFilter.setSelectedYear(y);
    if (dateFilter.pickerMode === 'month') {
      dateFilter.setSelectedMonth(m);
    } else {
      dateFilter.setSelectedMonth(null);
    }
    setShowDatePicker(false);
  };

  return (
    <View className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Custom Header */}
      <View className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 px-4 shadow-sm">
        <View className="h-12 flex items-center justify-between">
          <View
            className="w-8 h-8 flex items-center justify-center text-gray-700 dark:text-gray-300 active:bg-gray-100 dark:active:bg-gray-700 rounded-lg"
            onClick={() => Taro.navigateTo({ url: '/pages/wallet-manage/index' })}
          >
            <Icon name="Menu" size={20} />
          </View>
          <View
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg active:bg-gray-100 dark:active:bg-gray-700"
            onClick={() => setShowDatePicker(true)}
          >
            <Text className="text-base font-bold text-gray-800 dark:text-gray-100">
              {dateFilter.selectedYear}年{dateFilter.selectedMonth !== null ? `${dateFilter.selectedMonth}月` : ''}
            </Text>
            <Icon name="ChevronDown" size={16} className="text-gray-500 dark:text-gray-400" />
          </View>
          <View
            className="w-8 h-8 flex items-center justify-center text-gray-700 dark:text-gray-300 active:bg-gray-100 dark:active:bg-gray-700 rounded-lg"
            onClick={toggleTheme}
          >
            <Icon name={isDark ? 'Sun' : 'Moon'} size={20} />
          </View>
        </View>
      </View>

      <ScrollView scrollY className="pt-12 pb-20">
        <View className="px-4 py-4 space-y-4">
          <StatCard
            income={yearStatistics.income}
            expense={yearStatistics.expense}
            balance={yearStatistics.balance}
            color={currentWallet?.color}
          />

          {filteredBills.length > 0 ? (
            <View className="space-y-4">
              {groupedBills.map((group) => (
                <View key={group.date} className="bg-white dark:bg-gray-800 rounded-card shadow-card overflow-hidden">
                  <View className="px-4 py-2.5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {getDateLabel(group.date)}
                    </Text>
                    <View className="flex flex-col items-end gap-0.5">
                      {group.totalExpense > 0 && (
                        <Text className="text-xs text-expense-500 whitespace-nowrap">
                          支出 -{formatMoney(group.totalExpense)}
                        </Text>
                      )}
                      {group.totalIncome > 0 && (
                        <Text className="text-xs text-income-500 whitespace-nowrap">
                          收入 +{formatMoney(group.totalIncome)}
                        </Text>
                      )}
                    </View>
                  </View>
                  <View>
                    {group.bills.map((bill, idx) => (
                      <BillItem
                        key={bill.id}
                        bill={bill}
                        onDelete={(id) => {
                          softDeleteBill(id);
                          toast.success('账单已删除，可在回收站找回');
                        }}
                        onEdit={handleEdit}
                        isLast={idx === group.bills.length - 1}
                      />
                    ))}
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View className="text-center py-12">
              <Text className="text-gray-500 dark:text-gray-400">
                {dateFilter.selectedYear}年{dateFilter.selectedMonth !== null ? `${dateFilter.selectedMonth}月` : ''}暂无账单记录
              </Text>
              <Text className="text-sm text-gray-400 dark:text-gray-500 mt-2">点击右下角按钮添加第一笔账单</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <FloatingButton
        onClick={handleOpenAdd}
        color={currentWallet?.color}
      />

      <YearMonthPicker
        isOpen={showDatePicker}
        value={`${dateFilter.selectedYear}-${String(dateFilter.selectedMonth || 1).padStart(2, '0')}-01`}
        onConfirm={handleDateConfirm}
        onClose={() => setShowDatePicker(false)}
        mode={dateFilter.pickerMode}
      />
    </View>
  );
}
