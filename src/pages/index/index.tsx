import { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useBillStore } from '../../store/useBillStore';
import { useWalletStore } from '../../store/useWalletStore';
import { useDateFilter } from '../../hooks/useDateFilter';
import { StatCard } from '../../components/StatCard';
import { BillItem } from '../../components/BillItem';
import { FloatingButton } from '../../components/FloatingButton';
import { Drawer } from '../../components/Drawer';
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

  const themeColor = currentWallet?.color || '#10b981';
  const periodLabel = `${dateFilter.selectedYear}年${dateFilter.selectedMonth !== null ? `${dateFilter.selectedMonth}月` : '全年'}`;

  return (
    <View className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Custom Header */}
      <View className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 px-4 shadow-sm">
        <View className="h-12 flex items-center justify-center">
          <View
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg active:bg-gray-100 dark:active:bg-gray-700"
            onClick={() => setShowDatePicker(true)}
          >
            <Text className="text-base font-bold text-gray-800 dark:text-gray-100">
              {dateFilter.selectedYear}年{dateFilter.selectedMonth !== null ? `${dateFilter.selectedMonth}月` : ''}
            </Text>
            <Icon name="ChevronDown" size={16} className="text-gray-500 dark:text-gray-400" />
          </View>
        </View>
      </View>

      <ScrollView scrollY className="pt-12 pb-12">
        <View className="px-4 py-4 space-y-4">
          <StatCard
            income={yearStatistics.income}
            expense={yearStatistics.expense}
            balance={yearStatistics.balance}
            color={themeColor}
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
                        }}
                        onEdit={handleEdit}
                        isLast={idx === group.bills.length - 1}
                        themeColor={themeColor}
                      />
                    ))}
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View className="bg-white dark:bg-gray-800 rounded-card shadow-card flex flex-col items-center py-16 px-4">
              <Icon name="Receipt" size={64} className="text-gray-300 dark:text-gray-600 mb-3" />
              <Text className="text-base font-medium text-gray-700 dark:text-gray-300 text-center">
                {periodLabel}暂无账单记录
              </Text>
              <Text className="text-sm text-gray-400 dark:text-gray-500 mt-2 text-center">
                点击右下角按钮添加第一笔账单
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <FloatingButton
        onClick={handleOpenAdd}
        color={themeColor}
      />

      <DatePickerDrawer
        isOpen={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        selectedYear={dateFilter.selectedYear}
        selectedMonth={dateFilter.selectedMonth}
        onConfirm={(year, month) => {
          dateFilter.setSelectedYear(year);
          if (month === null) {
            dateFilter.setSelectedMonth(null);
          } else {
            dateFilter.setSelectedMonth(month);
          }
        }}
      />
    </View>
  );
}

interface DatePickerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedYear: number;
  selectedMonth: number | null;
  onConfirm: (year: number, month: number | null) => void;
}

function DatePickerDrawer({ isOpen, onClose, selectedYear, selectedMonth, onConfirm }: DatePickerDrawerProps) {
  const [mode, setMode] = useState<'year' | 'month'>(selectedMonth === null ? 'year' : 'month');
  const [tempYear, setTempYear] = useState(selectedYear);
  const [tempMonth, setTempMonth] = useState(selectedMonth || 1);

  const years = useMemo(() => Array.from({ length: 12 }, (_, i) => 2018 + i), []);
  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);

  const handleConfirm = () => {
    onConfirm(tempYear, mode === 'year' ? null : tempMonth);
    onClose();
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      direction="top"
      showClose={false}
      showFooter
      confirmText="确定"
      onConfirm={handleConfirm}
    >
      <View className="p-4">
        <View className="flex rounded-lg bg-gray-100 dark:bg-gray-700 p-1 mb-4">
          <View
            className={`flex-1 py-2 rounded-md text-sm font-medium text-center transition-colors ${
              mode === 'year' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'text-gray-600 dark:text-gray-400'
            }`}
            onClick={() => setMode('year')}
          >
            <Text>年</Text>
          </View>
          <View
            className={`flex-1 py-2 rounded-md text-sm font-medium text-center transition-colors ${
              mode === 'month' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'text-gray-600 dark:text-gray-400'
            }`}
            onClick={() => setMode('month')}
          >
            <Text>月</Text>
          </View>
        </View>

        <View className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
          {mode === 'year' ? (
            <View className="grid grid-cols-4 gap-2">
              {years.map((y) => (
                <View
                  key={y}
                  className={`py-3 rounded-md text-center text-sm transition-colors ${
                    tempYear === y
                      ? 'bg-blue-500 text-white'
                      : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                  onClick={() => setTempYear(y)}
                >
                  <Text>{y}年</Text>
                </View>
              ))}
            </View>
          ) : (
            <View>
              <View className="grid grid-cols-4 gap-2 mb-3">
                {years.map((y) => (
                  <View
                    key={y}
                    className={`py-2 rounded-md text-center text-sm transition-colors ${
                      tempYear === y
                        ? 'bg-blue-500 text-white'
                        : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                    }`}
                    onClick={() => setTempYear(y)}
                  >
                    <Text>{y}年</Text>
                  </View>
                ))}
              </View>
              <View className="grid grid-cols-4 gap-2">
                {months.map((m) => (
                  <View
                    key={m}
                    className={`py-3 rounded-md text-center text-sm transition-colors ${
                      tempMonth === m && tempYear === selectedYear
                        ? 'bg-blue-500 text-white'
                        : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                    }`}
                    onClick={() => setTempMonth(m)}
                  >
                    <Text>{m}月</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </View>
    </Drawer>
  );
}
