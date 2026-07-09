import { useRef, useEffect, useState } from 'react';
import { View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';
import { EChartOption } from 'taro-react-echarts';

interface EChartsWrapProps {
  option: EChartsOption;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function EChartsWrap({ option, height = 300, className = '', style }: EChartsWrapProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<echarts.ECharts | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const sys = Taro.getSystemInfoSync();
    const dpr = sys.pixelRatio || 2;

    const initChart = () => {
      if (!chartRef.current) return;
      
      const container = chartRef.current;
      const rect = container.getBoundingClientRect();
      
      if (rect.width === 0 || rect.height === 0) {
        const retryTimer = setTimeout(initChart, 100);
        return () => clearTimeout(retryTimer);
      }

      if (instanceRef.current) {
        instanceRef.current.dispose();
      }

      instanceRef.current = echarts.init(container, undefined, {
        devicePixelRatio: dpr,
        renderer: 'canvas',
      });
      instanceRef.current.setOption(option);
    };

    const timer = setTimeout(initChart, 50);

    const handleResize = () => {
      instanceRef.current?.resize();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
    }

    return () => {
      clearTimeout(timer);
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize);
      }
      instanceRef.current?.dispose();
      instanceRef.current = null;
    };
  }, [isMounted]);

  useEffect(() => {
    if (instanceRef.current) {
      instanceRef.current.setOption(option, true);
      instanceRef.current.resize();
    }
  }, [option]);

  return (
    <View className={className} style={{ width: '100%', height, ...style }}>
      <div ref={chartRef} style={{ width: '100%', height: '100%' }} />
    </View>
  );
}

export type { EChartsOption, EChartOption };
