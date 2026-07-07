import { useState, useMemo } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { useWalletStore } from '../store/useWalletStore';

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

  // 同步外部filters变化
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* 遮罩 */}
      <div
        className="absolute inset-0 bg-black/40 transition-opacity"
        onClick={onClose}
      />
      {/* 抽屉 */}
      <div className="absolute right-0 top-0 bottom-0 w-[85%] max-w-[360px] bg-white dark:bg-gray-800 shadow-2xl flex flex-col transition-transform animate-slide-in-right">
        {/* 头部 */}
        <div className="flex items-center justify-between px-4 h-12 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-base font-bold text-gray-800 dark:text-gray-100">筛选</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-500 dark:text-gray-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 内容 */}
        <div className="flex-1 overflow-auto p-4 space-y-6">
          {/* 账本筛选 */}
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

          {/* 日期筛选 */}
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

            {/* 自定义日期 */}
            {showCustomDate && (
              <div className="mt-3 space-y-3">
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">开始日期</label>
                  <input
                    type="date"
                    value={localFilters.startDate}
                    onChange={(e) => setLocalFilters(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">结束日期</label>
                  <input
                    type="date"
                    value={localFilters.endDate}
                    onChange={(e) => setLocalFilters(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex gap-3">
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
      </div>
    </div>
  );
}
