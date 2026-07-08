import { useState, useMemo } from 'react';
import { View, Text, PickerView, PickerViewColumn } from '@tarojs/components';
import { Modal } from './Modal';

interface CalendarPickerProps {
  isOpen: boolean;
  value: string;
  onConfirm: (date: string) => void;
  onClose: () => void;
  title?: string;
}

export function CalendarPicker({ isOpen, value, onConfirm, onClose, title = '选择日期' }: CalendarPickerProps) {
  const [tempValue, setTempValue] = useState(value);

  const years = useMemo(() => Array.from({ length: 20 }, (_, i) => 2015 + i), []);
  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);
  const days = useMemo(() => Array.from({ length: 31 }, (_, i) => i + 1), []);

  const [y, m, d] = tempValue.split('-').map(Number);

  const yearIndex = years.indexOf(y) >= 0 ? years.indexOf(y) : years.indexOf(new Date().getFullYear());
  const monthIndex = m - 1;
  const dayIndex = d - 1;

  const handleChange = (e: any) => {
    const [yi, mi, di] = e.detail.value;
    const sy = years[yi] || new Date().getFullYear();
    const sm = months[mi] || 1;
    const sd = days[di] || 1;
    setTempValue(`${sy}-${String(sm).padStart(2, '0')}-${String(sd).padStart(2, '0')}`);
  };

  const handleConfirm = () => {
    onConfirm(tempValue);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      showFooter
      confirmText="确定"
      onConfirm={handleConfirm}
    >
      <View className="h-[400rpx]">
        <PickerView
          className="h-full"
          value={[yearIndex, monthIndex, dayIndex]}
          onChange={handleChange}
          indicatorStyle="height: 80rpx; line-height: 80rpx;"
        >
          <PickerViewColumn>
            {years.map((year) => (
              <View key={year} className="text-center leading-[80rpx]">
                <Text>{year}年</Text>
              </View>
            ))}
          </PickerViewColumn>
          <PickerViewColumn>
            {months.map((month) => (
              <View key={month} className="text-center leading-[80rpx]">
                <Text>{month}月</Text>
              </View>
            ))}
          </PickerViewColumn>
          <PickerViewColumn>
            {days.map((day) => (
              <View key={day} className="text-center leading-[80rpx]">
                <Text>{day}日</Text>
              </View>
            ))}
          </PickerViewColumn>
        </PickerView>
      </View>
    </Modal>
  );
}

interface YearMonthPickerProps {
  isOpen: boolean;
  value: string;
  onConfirm: (date: string) => void;
  onClose: () => void;
  mode: 'year' | 'month';
}

export function YearMonthPicker({ isOpen, value, onConfirm, onClose, mode }: YearMonthPickerProps) {
  const [tempValue, setTempValue] = useState(value);

  const years = useMemo(() => Array.from({ length: 20 }, (_, i) => 2015 + i), []);
  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);

  const [y, m] = tempValue.split('-').map(Number);
  const yearIndex = years.indexOf(y) >= 0 ? years.indexOf(y) : years.indexOf(new Date().getFullYear());
  const monthIndex = (m || 1) - 1;

  const handleChange = (e: any) => {
    const vals = e.detail.value;
    const sy = years[vals[0]] || new Date().getFullYear();
    if (mode === 'year') {
      setTempValue(`${sy}-01-01`);
    } else {
      const sm = months[vals[1]] || 1;
      setTempValue(`${sy}-${String(sm).padStart(2, '0')}-01`);
    }
  };

  const handleConfirm = () => {
    onConfirm(tempValue);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'year' ? '选择年份' : '选择年月'}
      showFooter
      confirmText="确定"
      onConfirm={handleConfirm}
    >
      <View className="h-[400rpx]">
        <PickerView
          className="h-full"
          value={mode === 'year' ? [yearIndex] : [yearIndex, monthIndex]}
          onChange={handleChange}
          indicatorStyle="height: 80rpx; line-height: 80rpx;"
        >
          <PickerViewColumn>
            {years.map((year) => (
              <View key={year} className="text-center leading-[80rpx]">
                <Text>{year}年</Text>
              </View>
            ))}
          </PickerViewColumn>
          {mode === 'month' && (
            <PickerViewColumn>
              {months.map((month) => (
                <View key={month} className="text-center leading-[80rpx]">
                  <Text>{month}月</Text>
                </View>
              ))}
            </PickerViewColumn>
          )}
        </PickerView>
      </View>
    </Modal>
  );
}
