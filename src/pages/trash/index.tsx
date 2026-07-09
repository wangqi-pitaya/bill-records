import { useMemo, useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import { useBillStore } from '../../store/useBillStore';
import { useWalletStore } from '../../store/useWalletStore';
import { PageHeader } from '../../components/PageHeader';
import { Icon } from '../../components/Icon';
import { Modal } from '../../components/Modal';
import { FilterDrawer } from '../../components/FilterDrawer';
import { groupBillsByDate, getDateLabel, formatMoney } from '../../lib/utils';
import { FilterOptions } from '../../types';

export default function Trash() {
  const { bills, restoreBill, permanentDeleteBill, clearTrash, restoreAllDeleted } = useBillStore();
  const { currentWalletId, wallets } = useWalletStore();
  const themeColor = wallets.find((w) => w.id === currentWalletId)?.color || '#10b981';
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    walletId: 'all',
    datePreset: 'all',
    startDate: '',
    endDate: '',
  });

  const deletedBills = useMemo(() => bills.filter((b) => b.deleted), [bills]);
  const grouped = groupBillsByDate(deletedBills);

  const handleRestoreAll = () => {
    restoreAllDeleted();
  };

  const handleClear = () => {
    clearTrash();
    setShowClearConfirm(false);
  };

  const handleDelete = () => {
    if (deleteTargetId) {
      permanentDeleteBill(deleteTargetId);
      setDeleteTargetId(null);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <View className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <PageHeader
        title="回收站"
        rightIcon="Funnel"
        onRightClick={() => setShowFilter(true)}
      />

      <ScrollView scrollY className="flex-1 pb-4">
        <View className="px-4 py-4">
          {deletedBills.length > 0 ? (
            <View className="space-y-4">
              <View className="flex gap-2">
                <View
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-blue-500 text-white text-sm font-medium active:bg-blue-600"
                  onClick={handleRestoreAll}
                >
                  <Icon name="RotateCcw" size={16} />
                  <Text>恢复全部</Text>
                </View>
                <View
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-red-500/10 text-red-500 text-sm font-medium active:bg-red-500/20"
                  onClick={() => setShowClearConfirm(true)}
                >
                  <Icon name="Trash2" size={16} />
                  <Text>清空回收站</Text>
                </View>
              </View>

              {grouped.map((group) => (
                <View key={group.date} className="bg-white dark:bg-gray-800 rounded-card shadow-card overflow-hidden">
                  <View className="px-4 py-2.5 border-b border-gray-100 dark:border-gray-700">
                    <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {getDateLabel(group.date)}
                    </Text>
                  </View>
                  <View>
                    {group.bills.map((bill, idx) => (
                      <View
                        key={bill.id}
                        className={`${idx === group.bills.length - 1 ? '' : 'border-b border-gray-100 dark:border-gray-700'}`}
                      >
                        <View className="flex items-center gap-3 p-4">
                          <View className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                            bill.type === 'income'
                              ? 'bg-income-100 dark:bg-green-900/30'
                              : 'bg-expense-100 dark:bg-red-900/30'
                          }`}>
                            <Icon name={bill.icon} size={18} className={
                              bill.type === 'income'
                                ? 'text-income-600 dark:text-green-400'
                                : 'text-expense-600 dark:text-red-400'
                            } />
                          </View>
                          <View className="flex-1 min-w-0">
                            <Text className="font-semibold text-gray-800 dark:text-gray-100 truncate block">
                              {bill.category}
                            </Text>
                            {bill.note && (
                              <Text className="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5 block">
                                {bill.note}
                              </Text>
                            )}
                          </View>
                          <View className="text-right shrink-0">
                            <Text className={`font-bold block ${
                              bill.type === 'income'
                                ? 'text-income-600 dark:text-green-400'
                                : 'text-expense-600 dark:text-red-400'
                            }`}>
                              {bill.type === 'income' ? '+' : '-'}{formatMoney(bill.amount)}
                            </Text>
                            <Text className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 block">{bill.date}</Text>
                          </View>
                        </View>
                        <View className="flex gap-2 px-4 pb-4">
                          <View
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-blue-500/10 text-blue-500 text-sm font-medium active:bg-blue-500/20"
                            onClick={() => restoreBill(bill.id)}
                          >
                            <Icon name="RotateCcw" size={14} />
                            <Text>恢复</Text>
                          </View>
                          <View
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-red-500/10 text-red-500 text-sm font-medium active:bg-red-500/20"
                            onClick={() => { setDeleteTargetId(bill.id); setShowDeleteConfirm(true); }}
                          >
                            <Icon name="Trash2" size={14} />
                            <Text>删除</Text>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View className="text-center py-12">
              <Icon name="Trash2" size={48} className="text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <Text className="text-gray-500 dark:text-gray-400">回收站为空</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <Modal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        title="清空回收站"
        showFooter
        confirmText="清空"
        confirmVariant="danger"
        onConfirm={handleClear}
      >
        <Text className="text-sm text-gray-600 dark:text-gray-400 py-2 block">确定要清空回收站吗？此操作不可恢复！</Text>
      </Modal>

      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => { setShowDeleteConfirm(false); setDeleteTargetId(null); }}
        title="确认删除"
        showFooter
        confirmText="删除"
        confirmVariant="danger"
        onConfirm={handleDelete}
      >
        <Text className="text-sm text-gray-600 dark:text-gray-400 text-center py-2 block">确定要永久删除这条账单吗？此操作不可恢复。</Text>
      </Modal>

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
