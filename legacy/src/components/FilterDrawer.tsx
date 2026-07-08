import { useState, useMemo } from 'react';
import { useWalletStore } from '../store/useWalletStore';
import { CalendarRangePicker } from './Calendar';
import { Drawer } from './Drawer';

export interface FilterOptions {
  walletId: string;
  datePreset: 'all' | 'thisMonth' | 'lastMonth' | 'thisYear' | 'lastYear' | 'custom';
  startDate: string;
  endDate: string;
}

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterOptions;
  onConfirm: (filters: FilterOptions) => void;
}

const DATE_PRESETS = [
  { value: 'all' as const, label: '全部' },
  { value: 'thisMonth' as const, label: '本月' },
  { value: 'lastMonth' as const, label: '上月' },
  { value: 'thisYear' as const, label: '今年' },
  { value: 'lastYear' as const, label: '去年' },
  { value: 'custom' as const, label: '自定义' },
];

export function FilterDrawer({ isOpen, onClose, filters, onConfirm }: FilterDrawerProps) {
  const { wallets } = useWalletStore();
  const [localFilters, setLocalFilters] = useState<FilterOptions>(filters);
  const [showCustomDate, setShowCustomDate] = useState(filters.datePreset === 'custom');
  const [showDatePicker, setShowDatePicker] = useState(false);

  useMemo(() => {
    setLocalFilters(filters);
    setShowCustomDate(filters.datePreset === 'custom');
  }, [filters, isOpen]);

  const handlePresetChange = (preset: FilterOptions['datePreset']) => {
    setLocalFilters(prev => ({ ...prev, datePreset: preset }));
    setShowCustomDate(preset === 'custom');
  };

  const handleConfirm = () => {
    onConfirm(localFilters);
    onClose();
  };

  const handleReset = () => {
    const reset: FilterOptions = {
      walletId: 'all',
      datePreset: 'all',
      startDate: '',
      endDate: '',
    };
    setLocalFilters(reset);
    setShowCustomDate(false);
  };

  const allWallets = useMemo(() => [
    { id: 'all', name: '全部账本' },
    ...wallets.map(w => ({ id: w.id, name: w.name })),
  ], [wallets]);

  return (
    <>
      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        direction="right"
        title="筛选"
        showFooter
        footerButtons={
          <div className="flex gap-3 w-full">
            <button
              onClick={handleReset}
              className="flex-1 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300"
            >
              重置
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 py-2.5 rounded-lg bg-primary-500 text-white text-sm font-medium"
            >
              确定
            </button>
          </div>
        }
      >
        <div className="flex-1 overflow-auto p-4 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">账本</h3>
            <div className="space-y-2">
              {allWallets.map(wallet => (
                <button
                  key={wallet.id}
                  onClick={() => setLocalFilters(prev => ({ ...prev, walletId: wallet.id }))}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    localFilters.walletId === wallet.id
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {wallet.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">账单日期</h3>
            <div className="grid grid-cols-3 gap-2">
              {DATE_PRESETS.map(preset => (
                <button
                  key={preset.value}
                  onClick={() => handlePresetChange(preset.value)}
                  className={`px-2 py-2 rounded-lg text-sm text-center transition-colors ${
                    localFilters.datePreset === preset.value
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium'
                      : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {showCustomDate && (
              <div className="mt-3">
                <button
                  onClick={() => setShowDatePicker(true)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <span className={localFilters.startDate ? 'text-primary-600 dark:text-primary-400 font-medium' : 'text-gray-400 dark:text-gray-500'}>
                    {localFilters.startDate || '开始日期'}
                  </span>
                  <span className="text-gray-400 dark:text-gray-500">~</span>
                  <span className={localFilters.endDate ? 'text-primary-600 dark:text-primary-400 font-medium' : 'text-gray-400 dark:text-gray-500'}>
                    {localFilters.endDate || '结束日期'}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </Drawer>

      <CalendarRangePicker
        isOpen={showDatePicker}
        startValue={localFilters.startDate}
        endValue={localFilters.endDate}
        onConfirm={(start, end) => {
          setLocalFilters(prev => ({ ...prev, startDate: start, endDate: end }));
        }}
        onClose={() => setShowDatePicker(false)}
      />
    </>
  );
}
