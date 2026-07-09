import { View, Text, ScrollView } from '@tarojs/components';
import { useState, useEffect } from 'react';
import { FilterOptions } from '../types';
import { useWalletStore } from '../store/useWalletStore';
import { Drawer } from './Drawer';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterOptions;
  onConfirm: (filters: FilterOptions) => void;
}

const datePresets: { key: FilterOptions['datePreset']; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'thisMonth', label: '本月' },
  { key: 'lastMonth', label: '上月' },
  { key: 'thisYear', label: '今年' },
  { key: 'lastYear', label: '去年' },
  { key: 'custom', label: '自定义' },
];

export function FilterDrawer({ isOpen, onClose, filters, onConfirm }: FilterDrawerProps) {
  const { wallets } = useWalletStore();
  const [localFilters, setLocalFilters] = useState<FilterOptions>(filters);

  useEffect(() => {
    if (isOpen) {
      setLocalFilters(filters);
    }
  }, [isOpen, filters]);

  const handleConfirm = () => {
    onConfirm(localFilters);
    onClose();
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      direction="right"
      title="筛选"
      showFooter
      confirmText="确定"
      onConfirm={handleConfirm}
    >
      <ScrollView scrollY className="max-h-[800rpx]">
        <View className="space-y-6 py-2 px-4">
          {/* Wallet filter */}
          <View>
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">账本</Text>
            <View className="flex flex-wrap gap-2">
              <View
                className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                  localFilters.walletId === 'all'
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-transparent'
                }`}
                onClick={() => setLocalFilters((prev) => ({ ...prev, walletId: 'all' }))}
              >
                <Text>全部</Text>
              </View>
              {wallets.map((w) => (
                <View
                  key={w.id}
                  className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                    localFilters.walletId === w.id
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-transparent'
                  }`}
                  onClick={() => setLocalFilters((prev) => ({ ...prev, walletId: w.id }))}
                >
                  <Text>{w.name}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Date preset filter */}
          <View>
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">日期</Text>
            <View className="flex flex-wrap gap-2">
              {datePresets.map((preset) => (
                <View
                  key={preset.key}
                  className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                    localFilters.datePreset === preset.key
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-transparent'
                  }`}
                  onClick={() => setLocalFilters((prev) => ({ ...prev, datePreset: preset.key }))}
                >
                  <Text>{preset.label}</Text>
                </View>
              ))}
            </View>

            {/* Custom date range inputs */}
            {localFilters.datePreset === 'custom' && (
              <View className="mt-4 space-y-3">
                <View className="flex gap-2">
                  <View className="flex-1">
                    <Text className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 block">开始日期</Text>
                    <input
                      type="date"
                      value={localFilters.startDate}
                      onInput={(e) => setLocalFilters((prev) => ({ ...prev, startDate: (e.target as any).value }))}
                      className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-input text-gray-800 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 block">结束日期</Text>
                    <input
                      type="date"
                      value={localFilters.endDate}
                      onInput={(e) => setLocalFilters((prev) => ({ ...prev, endDate: (e.target as any).value }))}
                      className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-input text-gray-800 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </Drawer>
  );
}
