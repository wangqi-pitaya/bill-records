import { useMemo } from 'react';
import { View, Text, ScrollView, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useBillForm } from '../../hooks/useBillForm';
import { useBillStore } from '../../store/useBillStore';
import { useWalletStore } from '../../store/useWalletStore';
import { CategoryGrid } from '../../components/CategoryGrid';
import { CalendarPicker } from '../../components/Calendar';
import { PageHeader } from '../../components/PageHeader';
import { Icon } from '../../components/Icon';
import { Bill } from '../../types';
import { getShortDateLabel } from '../../lib/utils';

export default function BillAdd() {
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

  const { wallets, currentWalletId } = useWalletStore();
  const currentWallet = useMemo(() => wallets.find((w) => w.id === currentWalletId), [wallets, currentWalletId]);
  const themeColor = currentWallet?.color || '#10b981';

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
      {/* Header - 统一 PageHeader，左侧返回 */}
      <PageHeader
        title={form.isEdit ? '编辑账单' : '记一笔'}
        rightIcon="Settings"
        onRightClick={goCategoryManage}
      />

      {/* Tab Switcher */}
      <View className="bg-white dark:bg-gray-800 px-4 py-3 border-b border-gray-100 dark:border-gray-700">
        <View className="flex rounded-lg bg-gray-100 dark:bg-gray-700 p-1">
          <View
            className={`flex-1 py-1.5 rounded-md text-sm font-medium text-center transition-colors ${
              form.activeTab === 'expense'
                ? 'bg-white dark:bg-gray-600 text-red-500 shadow-sm'
                : 'text-gray-600 dark:text-gray-400'
            }`}
            onClick={() => form.setActiveTab('expense')}
          >
            <Text>支出</Text>
          </View>
          <View
            className={`flex-1 py-1.5 rounded-md text-sm font-medium text-center transition-colors ${
              form.activeTab === 'income'
                ? 'bg-white dark:bg-gray-600 text-green-500 shadow-sm'
                : 'text-gray-600 dark:text-gray-400'
            }`}
            onClick={() => form.setActiveTab('income')}
          >
            <Text>收入</Text>
          </View>
        </View>
      </View>

      {/* Category Grid - 隐藏滚动条 */}
      <ScrollView scrollY className="flex-1 overflow-hidden scrollbar-hide">
        <View className="px-4 py-4">
          <CategoryGrid
            categories={form.currentCategories}
            selectedCategory={form.selectedCategory}
            onSelect={form.setSelectedCategory}
            type={form.activeTab}
          />
        </View>
      </ScrollView>

      {/* Bottom Form */}
      <View className="bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 px-4 pt-3 pb-3 shrink-0 safe-bottom">
        <Input
          type="text"
          value={form.note}
          onInput={(e) => form.setNote(e.detail.value)}
          placeholder="添加备注..."
          className="w-full px-3 py-3 bg-gray-50 dark:bg-gray-700 border border-transparent focus:border-transparent rounded-btn text-sm text-gray-800 dark:text-gray-100"
          style={{ '--tw-ring-color': themeColor } as any}
        />

        <View className="flex items-center gap-2 mb-3">
          <View
            className="flex-1 flex items-center justify-center gap-1.5 py-3 bg-gray-50 dark:bg-gray-700 border border-transparent rounded-btn text-sm font-medium text-gray-700 dark:text-gray-300"
            onClick={() => form.setShowDatePicker(true)}
          >
            <Icon name="Calendar" size={14} />
            <Text>{getShortDateLabel(form.date)}</Text>
          </View>
          <Input
            type="digit"
            value={form.amount}
            onInput={(e) => form.setAmount(e.detail.value)}
            placeholder="0.00"
            className="flex-1 px-3 py-3 bg-gray-50 dark:bg-gray-700 border border-transparent rounded-btn text-base font-bold text-gray-800 dark:text-gray-100 text-center"
            style={{ '--tw-ring-color': themeColor } as any}
          />
        </View>

        {/* 再记 / 保存：统一圆角、统一高度、统一字号 */}
        <View className="flex items-center gap-2">
          {!form.isEdit && (
            <View
              className={`flex-1 py-3 rounded-btn text-sm font-semibold text-center transition-all ${
                form.canSubmit
                  ? 'bg-gray-100 dark:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
              }`}
              onClick={form.handleSaveAndContinue}
              style={form.canSubmit ? { color: themeColor } : undefined}
            >
              <Text>再记</Text>
            </View>
          )}
          <View
            className={`flex-1 py-3 rounded-btn text-sm font-semibold text-white text-center transition-all ${
              form.canSubmit
                ? 'active:opacity-90'
                : 'bg-gray-300 dark:bg-gray-600'
            }`}
            style={form.canSubmit ? { backgroundColor: themeColor } : undefined}
            onClick={form.handleSave}
          >
            <Text>保存</Text>
          </View>
        </View>

        {/* 底部留白（适配安全区域） */}
        <View className="h-2" />
      </View>

      <CalendarPicker
        isOpen={form.showDatePicker}
        value={form.date}
        onConfirm={form.setDate}
        onClose={() => form.setShowDatePicker(false)}
        themeColor={themeColor}
      />
    </View>
  );
}
