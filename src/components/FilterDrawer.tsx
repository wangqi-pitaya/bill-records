import { View, Text, ScrollView } from '@tarojs/components';
import { useState, useEffect } from 'react';
import { FilterOptions } from '../types';
import { useWalletStore } from '../store/useWalletStore';
import { Modal } from './Modal';

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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="筛选"
      showFooter
      confirmText="确定"
      onConfirm={handleConfirm}
    >
      <ScrollView scrollY className="max-h-[800rpx]">
        <View className="space-y-6 py-2">
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
          </View>
        </View>
      </ScrollView>
    </Modal>
  );
}
