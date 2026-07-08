import { useMemo, useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import { useBillStore } from '../../store/useBillStore';
import { useToast } from '../../hooks/useToast';
import { Icon } from '../../components/Icon';
import { Modal } from '../../components/Modal';
import { groupBillsByDate, getDateLabel, formatMoney } from '../../lib/utils';

export default function Trash() {
  const { bills, restoreBill, permanentDeleteBill, clearTrash } = useBillStore();
  const toast = useToast();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const deletedBills = useMemo(() => bills.filter((b) => b.deleted), [bills]);
  const grouped = groupBillsByDate(deletedBills);

  return (
    <View className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <View className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 px-4 shadow-sm">
        <View className="h-12 flex items-center justify-between">
          <View className="w-8" />
          <Text className="text-base font-bold text-gray-800 dark:text-gray-100">回收站</Text>
          <View
            className="w-8 h-8 flex items-center justify-center active:bg-gray-100 dark:active:bg-gray-700 rounded-lg"
            onClick={() => setShowClearConfirm(true)}
          >
            <Icon name="Eraser" size={18} className="text-gray-700 dark:text-gray-300" />
          </View>
        </View>
      </View>

      <ScrollView scrollY className="pt-12 pb-4">
        <View className="px-4 py-4">
          {deletedBills.length > 0 ? (
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
                      <View
                        key={bill.id}
                        className={`flex items-center gap-3 p-4 ${
                          idx === group.bills.length - 1 ? '' : 'border-b border-gray-100 dark:border-gray-700'
                        }`}
                      >
                        <View className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0">
                          <Icon name={bill.icon} size={18} className="text-gray-500 dark:text-gray-400" />
                        </View>
                        <View className="flex-1 min-w-0">
                          <Text className="font-semibold text-gray-800 dark:text-gray-100 truncate block">
                            {bill.category}
                          </Text>
                          <Text className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 block">
                            {bill.date}
                          </Text>
                        </View>
                        <View className="text-right shrink-0 mr-3">
                          <Text className="font-bold text-gray-800 dark:text-gray-100 block">
                            {bill.type === 'income' ? '+' : '-'}{formatMoney(bill.amount)}
                          </Text>
                        </View>
                        <View className="flex gap-2">
                          <View
                            className="px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-600 text-xs font-medium"
                            onClick={() => {
                              restoreBill(bill.id);
                              toast.success('已恢复');
                            }}
                          >
                            <Text>恢复</Text>
                          </View>
                          <View
                            className="px-3 py-1.5 rounded-full bg-red-500/10 text-red-600 text-xs font-medium"
                            onClick={() => {
                              permanentDeleteBill(bill.id);
                              toast.success('已永久删除');
                            }}
                          >
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
        onConfirm={() => {
          clearTrash();
          setShowClearConfirm(false);
          toast.success('回收站已清空');
        }}
      >
        <Text className="text-sm text-gray-600 dark:text-gray-400 py-2 block">确定要清空回收站吗？此操作不可恢复！</Text>
      </Modal>
    </View>
  );
}
