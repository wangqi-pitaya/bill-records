import { View, Text } from '@tarojs/components';
import { formatMoney } from '../lib/utils';

interface StatCardProps {
  income: number;
  expense: number;
  balance: number;
  color?: string;
  showHeader?: boolean;
}

export function StatCard({ income, expense, balance, color = '#3b82f6', showHeader = true }: StatCardProps) {
  const positive = balance >= 0;
  return (
    <View
      className="rounded-card shadow-card p-5 relative overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${color} 0%, ${shadeColor(color, -20)} 100%)` }}
    >
      {/* 结余：金额放右侧，去掉颜色点 */}
      {showHeader && (
        <View className="flex items-start justify-between mb-4">
          <View className="flex flex-col">
            <Text className="text-xs text-white/80">结余</Text>
            <Text className="text-sm text-white/80 mt-0.5">{positive ? '本月结余' : '本月超支'}</Text>
          </View>
          <Text className="text-2xl font-bold text-white">
            {positive ? '+' : ''}{formatMoney(balance)}
          </Text>
        </View>
      )}
      <View className="flex">
        <View className="flex-1 flex flex-col">
          <Text className="text-xs text-white/80">收入</Text>
          <Text className="text-lg font-bold text-white mt-0.5">+{formatMoney(income)}</Text>
        </View>
        <View className="flex-1 flex flex-col">
          <Text className="text-xs text-white/80">支出</Text>
          <Text className="text-lg font-bold text-white mt-0.5">-{formatMoney(expense)}</Text>
        </View>
      </View>
    </View>
  );
}

// 加深/变浅颜色
function shadeColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;
  return '#' + (
    0x1000000 +
    (Math.max(Math.min(R, 255), 0) << 16) +
    (Math.max(Math.min(G, 255), 0) << 8) +
    Math.max(Math.min(B, 255), 0)
  ).toString(16).slice(1);
}
