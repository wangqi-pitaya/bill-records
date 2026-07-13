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
      {/* Header - 固定 */}
      <PageHeader
        title={form.isEdit ? '编辑账单' : '记一笔'}
        rightIcon="Settings"
        onRightClick={goCategoryManage}
      />

      {/* Tab Switcher - 固定，宽度缩小 */}
      <View className="bg-white dark:bg-gray-800 px-4 py-3 border-b border-gray-100 dark:border-gray-700 shrink-0">
        <View className="flex rounded-lg bg-gray-100 dark:bg-gray-700 p-1">
          <View
            className={`w-24 py-1.5 rounded-md text-sm font-medium text-center transition-colors ${
              form.activeTab === 'expense'
                ? 'bg-white dark:bg-gray-600 text-red-500 shadow-sm'
                : 'text-gray-600 dark:text-gray-400'
            }`}
            onClick={() => form.setActiveTab('expense')}
          >
            <Text>支出</Text>
          </View>
          <View
            className={`w-24 py-1.5 rounded-md text-sm font-medium text-center transition-colors ${
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

      {/* Category Grid - 仅分类部分滚动 */}
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

      {/* Bottom Form - 固定，间距一致 */}
      <View className="bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 px-4 py-4 shrink-0 safe-bottom space-y-3">
        <Input
          type="text"
          value={form.note}
          onInput={(e) => form.setNote(e.detail.value)}
          placeholder="添加备注..."
          className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-transparent focus:border-transparent rounded-btn text-sm text-gray-800 dark:text-gray-100"
          style={{ '--tw-ring-color': themeColor } as any}
        />

        <View className="flex items-center gap-3">
          <View
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-gray-50 dark:bg-gray-700 border border-transparent rounded-btn text-sm font-medium text-gray-700 dark:text-gray-300"
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
            className="flex-1 px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-transparent rounded-btn text-base font-bold text-gray-800 dark:text-gray-100 text-center"
            style={{ '--tw-ring-color': themeColor } as any}
          />
        </View>

        <View className="flex items-center gap-3">
          {!form.isEdit && (
            <View
              className={`flex-1 py-2.5 rounded-btn text-sm font-semibold text-center transition-all ${
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
            className={`flex-1 py-2.5 rounded-btn text-sm font-semibold text-white text-center transition-all ${
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
