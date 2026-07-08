import { View, Text } from '@tarojs/components';
import { formatMoney } from '../lib/utils';

interface StatCardProps {
  income: number;
  expense: number;
  balance: number;
  color?: string;
}

export function StatCard({ income, expense, balance, color }: StatCardProps) {
  return (
    <View className="bg-white dark:bg-gray-800 rounded-card shadow-card p-5 transition-colors">
      <View className="flex justify-between items-center mb-4">
        <View>
          <Text className="text-xs text-gray-400 dark:text-gray-500">结余</Text>
          <Text className={`text-xl font-bold mt-1 block ${balance >= 0 ? 'text-income-500' : 'text-expense-500'}`}>
            {balance >= 0 ? '+' : ''}{formatMoney(balance)}
          </Text>
        </View>
        {color && (
          <View className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
        )}
      </View>
      <View className="flex justify-between">
        <View>
          <Text className="text-xs text-gray-400 dark:text-gray-500">收入</Text>
          <Text className="text-base font-semibold text-income-500 mt-1 block">+{formatMoney(income)}</Text>
        </View>
        <View className="text-right">
          <Text className="text-xs text-gray-400 dark:text-gray-500">支出</Text>
          <Text className="text-base font-semibold text-expense-500 mt-1 block">-{formatMoney(expense)}</Text>
        </View>
      </View>
    </View>
  );
}
