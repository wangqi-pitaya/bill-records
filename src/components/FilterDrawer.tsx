import { View, Text, ScrollView } from '@tarojs/components';
import { useState, useEffect } from 'react';
import { FilterOptions } from '../types';
import { useWalletStore } from '../store/useWalletStore';
import { Drawer } from './Drawer';
import { CalendarRangePicker } from './Calendar';

const datePresets: { key: FilterOptions['datePreset']; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'thisMonth', label: '本月' },
  { key: 'lastMonth', label: '上月' },
  { key: 'thisYear', label: '今年' },
  { key: 'lastYear', label: '去年' },
  { key: 'custom', label: '自定义' },
];

const defaultFilters: FilterOptions = {
  walletId: 'all',
  datePreset: 'all',
  startDate: '',
  endDate: '',
};

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterOptions;
  onConfirm: (filters: FilterOptions) => void;
  themeColor?: string;
}

export function FilterDrawer({ isOpen, onClose, filters, onConfirm, themeColor = '#10b981' }: FilterDrawerProps) {
  const { wallets } = useWalletStore();
  const [localFilters, setLocalFilters] = useState<FilterOptions>(filters);
  const [showRangePicker, setShowRangePicker] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLocalFilters(filters);
    }
  }, [isOpen, filters]);

  const handleConfirm = () => {
    onConfirm(localFilters);
    onClose();
  };

  const handleReset = () => {
    setLocalFilters(defaultFilters);
    onConfirm(defaultFilters);
    onClose();
  };

  const handleRangeConfirm = (start: string, end: string) => {
    setLocalFilters((prev) => ({ ...prev, startDate: start, endDate: end }));
  };

  return (
    <>
      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        direction="right"
        title="筛选"
        showFooter
        cancelText="重置"
        confirmText="确定"
        onConfirm={handleConfirm}
        onCancel={handleReset}
        themeColor={themeColor}
      >
        <ScrollView scrollY className="h-full">
          <View className="space-y-6 py-2 px-4">
            <View>
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">账本</Text>
              <View className="flex flex-wrap gap-2">
                <View
                  className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                    localFilters.walletId === 'all'
                      ? 'text-white border-transparent'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-transparent'
                  }`}
                  style={localFilters.walletId === 'all' ? { backgroundColor: themeColor } : undefined}
                  onClick={() => setLocalFilters((prev) => ({ ...prev, walletId: 'all' }))}
                >
                  <Text>全部</Text>
                </View>
                {wallets.map((w) => (
                  <View
                    key={w.id}
                    className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                      localFilters.walletId === w.id
                        ? 'text-white border-transparent'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-transparent'
                    }`}
                    style={localFilters.walletId === w.id ? { backgroundColor: w.color } : undefined}
                    onClick={() => setLocalFilters((prev) => ({ ...prev, walletId: w.id }))}
                  >
                    <Text>{w.name}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">日期</Text>
              <View className="flex flex-wrap gap-2">
                {datePresets.map((preset) => (
                  <View
                    key={preset.key}
                    className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                      localFilters.datePreset === preset.key
                        ? 'text-white border-transparent'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-transparent'
                    }`}
                    style={localFilters.datePreset === preset.key ? { backgroundColor: themeColor } : undefined}
                    onClick={() => setLocalFilters((prev) => ({ ...prev, datePreset: preset.key }))}
                  >
                    <Text>{preset.label}</Text>
                  </View>
                ))}
              </View>

              {localFilters.datePreset === 'custom' && (
                <View className="mt-4">
                  <View
                    className="flex items-center justify-center gap-2 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg active:bg-gray-100 dark:active:bg-gray-600"
                    onClick={() => setShowRangePicker(true)}
                  >
                    <Text className="text-sm text-gray-700 dark:text-gray-300">
                      {localFilters.startDate && localFilters.endDate
                        ? `${localFilters.startDate} ~ ${localFilters.endDate}`
                        : '选择日期范围'}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </Drawer>

      <CalendarRangePicker
        isOpen={showRangePicker}
        startValue={localFilters.startDate}
        endValue={localFilters.endDate}
        onConfirm={handleRangeConfirm}
        onClose={() => setShowRangePicker(false)}
        themeColor={themeColor}
      />
    </>
  );
}
