import { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useBillStore } from '../../store/useBillStore';
import { useWalletStore } from '../../store/useWalletStore';
import { BillItem } from '../../components/BillItem';
import { PageHeader } from '../../components/PageHeader';
import { Icon } from '../../components/Icon';
import { FilterDrawer } from '../../components/FilterDrawer';
import { groupBillsByDate, filterBillsByWallet, getDateLabel } from '../../lib/utils';
import { FilterOptions } from '../../types';

export default function Search() {
  const { bills, softDeleteBill } = useBillStore();
  const { currentWalletId, wallets } = useWalletStore();
  const [query, setQuery] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    walletId: 'all',
    datePreset: 'all',
    startDate: '',
    endDate: '',
  });

  const themeColor = wallets.find((w) => w.id === currentWalletId)?.color || '#10b981';
  const activeBills = bills.filter((b) => !b.deleted);

  const results = useMemo(() => {
    let result = activeBills;

    if (filters.walletId !== 'all') {
      result = filterBillsByWallet(result, filters.walletId);
    }

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter(
        (b) =>
          b.category.toLowerCase().includes(q) ||
          b.note.toLowerCase().includes(q) ||
          b.amount.toString().includes(q)
      );
    }

    return result;
  }, [activeBills, filters, query]);

  const grouped = groupBillsByDate(results);

  const handleEdit = (bill: { id: string }) => {
    Taro.navigateTo({ url: `/pages/bill-add/index?billId=${bill.id}` });
  };

  return (
    <View className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <PageHeader title="搜索账单" rightIcon="Funnel" onRightClick={() => setShowFilter(true)} />

      <View className="bg-white dark:bg-gray-800 px-4 py-3">
        <View className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-2">
          <Icon name="Search" size={16} className="text-gray-400 mr-2" />
          <input
            type="text"
            value={query}
            onInput={(e) => setQuery((e.target as any).value)}
            placeholder="搜索分类、备注、金额..."
            className="flex-1 bg-transparent text-sm text-gray-800 dark:text-gray-100 focus:outline-none"
          />
          {query && (
            <View onClick={() => setQuery('')}>
              <Icon name="X" size={16} className="text-gray-400" />
            </View>
          )}
        </View>
      </View>

      <ScrollView scrollY className="flex-1 pb-4">
        <View className="px-4 py-4">
          {results.length > 0 ? (
            <View className="space-y-4">
              {grouped.map((group) => (
                <View key={group.date} className="bg-white dark:bg-gray-800 rounded-card shadow-card overflow-hidden">
                  <View className="px-4 py-2.5 border-b border-gray-100 dark:border-gray-700">
                    <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {getDateLabel(group.date)}
                    </Text>
                  </View>
                  <View>
                    {group.bills.map((bill, idx) => (
                      <BillItem
                        key={bill.id}
                        bill={bill}
                        onDelete={(id) => softDeleteBill(id)}
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
              <Icon name="Search" size={64} className="text-gray-300 dark:text-gray-600 mb-3" />
              <Text className="text-base font-medium text-gray-700 dark:text-gray-300 text-center">
                {query ? '未找到匹配的账单' : '输入关键词开始搜索'}
              </Text>
              <Text className="text-sm text-gray-400 dark:text-gray-500 mt-2 text-center">
                {query ? '请尝试其他关键词' : '例如：餐饮、工资、100'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <FilterDrawer
        isOpen={showFilter}
        onClose={() => setShowFilter(false)}
        filters={filters}
        onConfirm={setFilters}
        themeColor={themeColor}
      />
    </View>
  );
}