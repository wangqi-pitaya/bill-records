import { View } from '@tarojs/components';
import type { EChartsOption } from 'echarts';
import EChart from 'taro-react-echarts';

interface EChartsWrapProps {
  option: EChartsOption;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function EChartsWrap({ option, height = 300, className = '', style }: EChartsWrapProps) {
  return (
    <View className={className} style={{ width: '100%', height, ...style }}>
      <EChart option={option} height={height} />
    </View>
  );
}

export type { EChartsOption };
