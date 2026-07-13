import { View, Text } from '@tarojs/components';
import { formatMoney } from '../lib/utils';

interface StatCardProps {
  income: number;
  expense: number;
  balance: number;
  color?: string;
}

export function StatCard({ income, expense, balance, color = '#3b82f6' }: StatCardProps) {
  const positive = balance >= 0;
  return (
    <View
      className="rounded-card shadow-card overflow-hidden"
      style={{ backgroundColor: color }}
    >
      {/* 第一行：结余 */}
      <View className="px-4 pt-4 pb-3 flex items-center justify-between">
        <Text className="text-sm text-white/90 font-medium">结余</Text>
        <Text className="text-xl font-bold text-white">
          {positive ? '+' : ''}{formatMoney(balance)}
        </Text>
      </View>

      {/* 第二行：支出和收入 */}
      <View className="px-4 pb-4 flex">
        <View className="flex-1">
          <View className="flex items-center gap-1">
            <Text className="text-xs text-white/70">支出</Text>
            <Text className="text-sm font-bold text-white">-{formatMoney(expense)}</Text>
          </View>
        </View>
        <View className="flex-1">
          <View className="flex items-center gap-1">
            <Text className="text-xs text-white/70">收入</Text>
            <Text className="text-sm font-bold text-white">+{formatMoney(income)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
