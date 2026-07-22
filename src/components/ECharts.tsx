import { useEffect, useState } from 'react';
import { View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import type { EChartsOption } from 'echarts';
import EChart from 'taro-react-echarts';

interface EChartsWrapProps {
  option: EChartsOption;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function EChartsWrap({ option, height = 300, className = '', style }: EChartsWrapProps) {
  const [echarts, setEcharts] = useState<any>(null);

  useEffect(() => {
    let cancelled = false;
    import('echarts').then((mod) => {
      if (!cancelled) {
        setEcharts(() => mod.default || mod);
      }
    }).catch((err) => {
      console.error('Failed to load echarts:', err);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!echarts) {
    return <View className={className} style={{ width: '100%', height, ...style }} />;
  }

  return (
    <View className={className} style={{ width: '100%', height, ...style }}>
      <EChart echarts={echarts} option={option} height={height} />
    </View>
  );
}

export type { EChartsOption };
