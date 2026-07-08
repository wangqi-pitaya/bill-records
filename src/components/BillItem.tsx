import { useState, useCallback } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { Bill } from '../types';
import { Modal } from './Modal';
import { Icon } from './Icon';
import { formatMoney } from '../lib/utils';

interface BillItemProps {
  bill: Bill;
  onDelete: (id: string) => void;
  onEdit?: (bill: Bill) => void;
  isLast?: boolean;
}

export function BillItem({ bill, onDelete, onEdit, isLast = false }: BillItemProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleEdit = useCallback(() => {
    onEdit?.(bill);
  }, [bill, onEdit]);

  const handleDelete = useCallback(() => {
    onDelete(bill.id);
    setShowDeleteConfirm(false);
  }, [bill.id, onDelete]);

  return (
    <>
      <View
        className={`flex items-center gap-3 p-4 bg-white dark:bg-gray-800 ${
          isLast ? 'rounded-b-[16rpx]' : ''
        }`}
      >
        <View
          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
            bill.type === 'income'
              ? 'bg-income-100 dark:bg-green-900/30'
              : 'bg-expense-100 dark:bg-red-900/30'
          }`}
        >
          <Icon
            name={bill.icon}
            size={18}
            className={
              bill.type === 'income'
                ? 'text-income-600 dark:text-green-400'
                : 'text-expense-600 dark:text-red-400'
            }
          />
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
          <Text
            className={`font-bold whitespace-nowrap block ${
              bill.type === 'income'
                ? 'text-income-600 dark:text-green-400'
                : 'text-expense-600 dark:text-red-400'
            }`}
            style={{ fontSize: formatMoney(bill.amount).length > 10 ? 22 : formatMoney(bill.amount).length > 8 ? 24 : 32 }}
          >
            {bill.type === 'income' ? '+' : '-'}{formatMoney(bill.amount)}
          </Text>
          <Text className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 block">{bill.date}</Text>
        </View>
      </View>

      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="确认删除"
        showFooter
        confirmText="删除"
        confirmVariant="danger"
        onConfirm={handleDelete}
      >
        <Text className="text-sm text-gray-600 dark:text-gray-400 text-center py-2 block">
          确定要删除这条账单记录吗？删除后可在回收站找回。
        </Text>
      </Modal>
    </>
  );
}
