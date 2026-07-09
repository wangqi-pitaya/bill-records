import { useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useBillForm } from '../../hooks/useBillForm';
import { useBillStore } from '../../store/useBillStore';
import { CategoryGrid } from '../../components/CategoryGrid';
import { CalendarPicker } from '../../components/Calendar';
import { Icon } from '../../components/Icon';
import { Bill } from '../../types';
import { getShortDateLabel } from '../../lib/utils';

export default function BillAdd() {
  // 解析 URL 参数：H5 通过 router.params 读取
  const billId = (() => {
    try {
      const router = Taro.getCurrentInstance()?.router;
      return router?.params?.billId;
    } catch {
      return undefined;
    }
  })();

  const getBillById = useBillStore((s) => s.getBillById);
  const editBill = useMemo<Bill | null>(() => (billId ? getBillById(billId) || null : null), [billId, getBillById]);

  const form = useBillForm({
    editBill: editBill || undefined,
    onSuccess: () => {
      Taro.navigateBack();
    },
  });

  const goCategoryManage = () => {
    Taro.navigateTo({ url: '/pages/category-manage/index' });
  };

  return (
    <View className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <View className="bg-white dark:bg-gray-800 px-4 shadow-sm h-12 flex items-center shrink-0">
        <View className="flex items-center justify-between w-full">
          <View
            className="w-8 h-8 flex items-center justify-center text-gray-700 dark:text-gray-300 active:bg-gray-100 dark:active:bg-gray-700 rounded-lg"
            onClick={() => Taro.navigateBack()}
          >
            <Icon name="X" size={20} />
          </View>
          <View className="flex rounded-lg bg-gray-100 dark:bg-gray-700 p-1">
            <View
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                form.activeTab === 'expense'
                  ? 'bg-white dark:bg-gray-600 text-red-500 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
              onClick={() => form.setActiveTab('expense')}
            >
              <Text>支出</Text>
            </View>
            <View
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                form.activeTab === 'income'
                  ? 'bg-white dark:bg-gray-600 text-green-500 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
              onClick={() => form.setActiveTab('income')}
            >
              <Text>收入</Text>
            </View>
          </View>
          <View
            className="w-8 h-8 flex items-center justify-center text-gray-700 dark:text-gray-300 active:bg-gray-100 dark:active:bg-gray-700 rounded-lg"
            onClick={goCategoryManage}
          >
            <Icon name="Settings" size={20} />
          </View>
        </View>
      </View>

      {/* Category Grid */}
      <ScrollView scrollY className="flex-1 overflow-hidden">
        <View className="px-4 py-4">
          <CategoryGrid
            categories={form.currentCategories}
            selectedCategory={form.selectedCategory}
            onSelect={form.setSelectedCategory}
            type={form.activeTab}
          />
        </View>
      </ScrollView>

      {/* Bottom Form - 统一圆角 rounded-btn、字号、padding */}
      <View className="bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 px-4 py-3 shrink-0 safe-bottom">
        {/* 备注 */}
        <View className="mb-3">
          <input
            type="text"
            value={form.note}
            onInput={(e) => form.setNote((e.target as any).value)}
            placeholder="添加备注..."
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-transparent focus:border-blue-500 rounded-btn text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
        </View>

        {/* 日期 + 金额：相同圆角、相同 padding、同色背景 */}
        <View className="flex items-center gap-2 mb-3">
          <View
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-transparent active:border-blue-500 rounded-btn text-sm font-medium text-gray-700 dark:text-gray-300"
            onClick={() => form.setShowDatePicker(true)}
          >
            <Icon name="Calendar" size={16} />
            <Text>{getShortDateLabel(form.date)}</Text>
          </View>
          <View className="flex-1">
            <input
              type="digit"
              value={form.amount}
              onInput={(e) => form.setAmount((e.target as any).value)}
              placeholder="0.00"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-transparent focus:border-blue-500 rounded-btn text-base font-bold text-gray-800 dark:text-gray-100 text-center focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </View>
        </View>

        {/* 再记 / 保存：统一圆角、统一高度、统一字号 */}
        <View className="flex items-center gap-2">
          {!form.isEdit && (
            <View
              className={`flex-1 py-3 rounded-btn text-sm font-semibold text-center transition-all ${
                form.canSubmit
                  ? 'bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400 active:bg-gray-200 dark:active:bg-gray-600'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
              }`}
              onClick={form.handleSaveAndContinue}
            >
              <Text>再记</Text>
            </View>
          )}
          <View
            className={`flex-1 py-3 rounded-btn text-sm font-semibold text-white text-center transition-all ${
              form.canSubmit
                ? 'bg-blue-500 active:bg-blue-600'
                : 'bg-gray-300 dark:bg-gray-600'
            }`}
            onClick={form.handleSave}
          >
            <Text>保存</Text>
          </View>
        </View>
      </View>

      <CalendarPicker
        isOpen={form.showDatePicker}
        value={form.date}
        onConfirm={form.setDate}
        onClose={() => form.setShowDatePicker(false)}
      />
    </View>
  );
}
