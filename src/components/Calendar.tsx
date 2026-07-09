import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { View, Text } from '@tarojs/components';
import { Modal } from './Modal';
import { Icon } from './Icon';

export type CalendarMode = 'single' | 'range';

export interface CalendarPickerConfig {
  showYearPicker?: boolean;
  showMonthPicker?: boolean;
  showDayPicker?: boolean;
}

interface CalendarProps {
  mode?: CalendarMode;
  value?: string;
  startValue?: string;
  endValue?: string;
  config?: CalendarPickerConfig;
  themeColor?: string;
  onChange?: (value: string) => void;
  onRangeChange?: (start: string, end: string) => void;
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

const formatDateStr = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseDate = (dateStr: string) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfWeek = (year: number, month: number) => {
  return new Date(year, month, 1).getDay();
};

const isSameDay = (a: string, b: string) => a === b;

const isBetween = (date: string, start: string, end: string) => {
  if (!start || !end) return false;
  const d = new Date(date).getTime();
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  const min = Math.min(s, e);
  const max = Math.max(s, e);
  return d > min && d < max;
};

export function Calendar({
  mode = 'single',
  value = formatDateStr(new Date()),
  startValue = '',
  endValue = '',
  config = { showYearPicker: true, showMonthPicker: true, showDayPicker: true },
  themeColor = '#10b981',
  onChange,
  onRangeChange,
}: CalendarProps) {
  const today = formatDateStr(new Date());

  const initYear = useMemo(() => {
    if (mode === 'single' && value) return parseDate(value).getFullYear();
    if (mode === 'range' && startValue) return parseDate(startValue).getFullYear();
    return new Date().getFullYear();
  }, [mode, value, startValue]);

  const initMonth = useMemo(() => {
    if (mode === 'single' && value) return parseDate(value).getMonth();
    if (mode === 'range' && startValue) return parseDate(startValue).getMonth();
    return new Date().getMonth();
  }, [mode, value, startValue]);

  const [viewYear, setViewYear] = useState(initYear);
  const [viewMonth, setViewMonth] = useState(initMonth);
  const [pageStartYear, setPageStartYear] = useState(() => {
    const midIndex = 4;
    return initYear - midIndex;
  });

  const [rangeStart, setRangeStart] = useState(startValue);
  const [rangeEnd, setRangeEnd] = useState(endValue);
  const [selecting, setSelecting] = useState(false);

  const isFirstMount = useRef(true);

  const handlePrevYear = useCallback(() => {
    setViewYear((y) => y - 1);
  }, []);

  const handleNextYear = useCallback(() => {
    setViewYear((y) => y + 1);
  }, []);

  const handlePrevMonth = useCallback(() => {
    setViewMonth((m) => {
      if (m === 0) {
        setViewYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  }, []);

  const handleNextMonth = useCallback(() => {
    setViewMonth((m) => {
      if (m === 11) {
        setViewYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  }, []);

  const handlePrevYearPage = useCallback(() => {
    setPageStartYear((s) => s - 9);
  }, []);

  const handleNextYearPage = useCallback(() => {
    setPageStartYear((s) => s + 9);
  }, []);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      const midIndex = 4;
      setPageStartYear(initYear - midIndex);
    }
  }, [initYear]);

  useEffect(() => {
    setViewYear(initYear);
    setViewMonth(initMonth);
  }, [initYear, initMonth]);

  const handleSelectDate = useCallback(
    (year: number, month: number, day: number = 1) => {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      if (mode === 'single') {
        onChange?.(dateStr);
        return;
      }

      if (mode === 'range') {
        if (!selecting || !rangeStart) {
          setRangeStart(dateStr);
          setRangeEnd('');
          setSelecting(true);
          onRangeChange?.(dateStr, '');
        } else {
          const start = rangeStart;
          const end = dateStr;
          const startTime = new Date(start).getTime();
          const endTime = new Date(end).getTime();

          let finalStart: string;
          let finalEnd: string;

          if (startTime <= endTime) {
            finalStart = start;
            finalEnd = end;
          } else {
            finalStart = end;
            finalEnd = start;
          }

          setRangeStart(finalStart);
          setRangeEnd(finalEnd);
          setSelecting(false);
          onRangeChange?.(finalStart, finalEnd);
        }
      }
    },
    [mode, onChange, onRangeChange, selecting, rangeStart]
  );

  const handleSelectDay = useCallback(
    (dayInfo: { day: number; month: number; year: number }) => {
      handleSelectDate(dayInfo.year, dayInfo.month, dayInfo.day);
    },
    [handleSelectDate]
  );

  const isInRange = (dateStr: string) => {
    if (mode !== 'range') return false;
    const s = rangeStart;
    const e = selecting ? '' : rangeEnd;
    if (!s || !e) return false;
    return isBetween(dateStr, s, e);
  };

  const isRangeStart = (dateStr: string) => {
    if (mode !== 'range') return false;
    return rangeStart === dateStr;
  };

  const isRangeEnd = (dateStr: string) => {
    if (mode !== 'range') return false;
    return rangeEnd === dateStr && !selecting;
  };

  const isSelected = (dateStr: string) => {
    if (mode === 'single') return isSameDay(dateStr, value);
    return isRangeStart(dateStr) || isRangeEnd(dateStr);
  };

  if (!config.showDayPicker) {
    const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    const selectedDateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-01`;

    if (config.showMonthPicker === false) {
      const yearPage = Array.from({ length: 9 }, (_, i) => pageStartYear + i);

      return (
        <View className="w-full select-none">
          <View className="flex items-center justify-between mb-4">
            <View className="flex items-center">
              <View
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 dark:text-gray-400 active:bg-gray-100 dark:active:bg-gray-700"
                onClick={handlePrevYearPage}
              >
                <Icon name="ChevronsLeft" size={16} />
              </View>
            </View>

            <Text className="text-base font-semibold text-gray-800 dark:text-gray-100">
              {viewYear}年
            </Text>

            <View className="flex items-center">
              <View
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 dark:text-gray-400 active:bg-gray-100 dark:active:bg-gray-700"
                onClick={handleNextYearPage}
              >
                <Icon name="ChevronsRight" size={16} />
              </View>
            </View>
          </View>

          <View className="grid grid-cols-3 gap-2">
            {yearPage.map((year) => {
              const isSelectedYear = mode === 'single' && value
                ? parseDate(value).getFullYear() === year
                : false;
              
              return (
                <View
                  key={year}
                  className={`py-3 rounded-lg text-sm font-medium text-center ${
                    isSelectedYear
                      ? 'text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 active:bg-gray-200 dark:active:bg-gray-600'
                  }`}
                  style={isSelectedYear ? { backgroundColor: themeColor } : undefined}
                  onClick={() => {
                    setViewYear(year);
                    handleSelectDate(year, 0);
                  }}
                >
                  <Text>{year}年</Text>
                </View>
              );
            })}
          </View>
        </View>
      );
    }

    return (
      <View className="w-full select-none">
        <View className="flex items-center justify-between mb-4">
          <View className="flex items-center">
            <View
              className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 dark:text-gray-400 active:bg-gray-100 dark:active:bg-gray-700"
              onClick={handlePrevYear}
            >
              <Icon name="ChevronsLeft" size={16} />
            </View>
          </View>

          <View
            className={`text-base font-semibold ${
              isSelected(selectedDateStr)
                ? ''
                : 'text-gray-800 dark:text-gray-100'
            }`}
            style={isSelected(selectedDateStr) ? { color: themeColor } : undefined}
            onClick={() => handleSelectDate(viewYear, viewMonth)}
          >
            <Text>{viewYear}年</Text>
          </View>

          <View className="flex items-center">
            <View
              className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 dark:text-gray-400 active:bg-gray-100 dark:active:bg-gray-700"
              onClick={handleNextYear}
            >
              <Icon name="ChevronsRight" size={16} />
            </View>
          </View>
        </View>

        <View className="grid grid-cols-4 gap-2">
          {months.map((month, index) => {
            const isSelectedMonth = mode === 'single' && value
              ? parseDate(value).getFullYear() === viewYear && parseDate(value).getMonth() === index
              : false;
            
            return (
              <View
                key={index}
                className={`py-2.5 rounded-lg text-sm font-medium text-center ${
                  isSelectedMonth
                    ? 'text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 active:bg-gray-200 dark:active:bg-gray-600'
                }`}
                style={isSelectedMonth ? { backgroundColor: themeColor } : undefined}
                onClick={() => {
                  setViewMonth(index);
                  handleSelectDate(viewYear, index);
                }}
              >
                <Text>{month}</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  }

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfWeek(viewYear, viewMonth);

  const prevDays: { day: number; month: number; year: number }[] = [];
  if (firstDay > 0) {
    const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1;
    const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
    const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);
    for (let i = firstDay - 1; i >= 0; i--) {
      prevDays.push({ day: daysInPrevMonth - i, month: prevMonth, year: prevYear });
    }
  }

  const currentDays: { day: number; month: number; year: number }[] = [];
  for (let i = 1; i <= daysInMonth; i++) {
    currentDays.push({ day: i, month: viewMonth, year: viewYear });
  }

  const totalCells = prevDays.length + currentDays.length;
  const totalRows = 6;
  const targetCells = totalRows * 7;
  const remaining = targetCells - totalCells;
  const nextDays: { day: number; month: number; year: number }[] = [];
  for (let i = 1; i <= remaining; i++) {
    const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1;
    const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;
    nextDays.push({ day: i, month: nextMonth, year: nextYear });
  }

  const allDays = [...prevDays, ...currentDays, ...nextDays];

  return (
    <View className="w-full select-none">
      <View className="flex items-center justify-between mb-3">
        <View className="flex items-center">
          {config.showYearPicker && (
            <View
              className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 dark:text-gray-400 active:bg-gray-100 dark:active:bg-gray-700"
              onClick={handlePrevYear}
            >
              <Icon name="ChevronsLeft" size={16} />
            </View>
          )}
          {config.showMonthPicker && (
            <View
              className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 dark:text-gray-400 active:bg-gray-100 dark:active:bg-gray-700"
              onClick={handlePrevMonth}
            >
              <Icon name="ChevronLeft" size={16} />
            </View>
          )}
        </View>

        <Text className="text-base font-semibold text-gray-800 dark:text-gray-100">
          {viewYear}年{viewMonth + 1}月
        </Text>

        <View className="flex items-center">
          {config.showMonthPicker && (
            <View
              className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 dark:text-gray-400 active:bg-gray-100 dark:active:bg-gray-700"
              onClick={handleNextMonth}
            >
              <Icon name="ChevronRight" size={16} />
            </View>
          )}
          {config.showYearPicker && (
            <View
              className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 dark:text-gray-400 active:bg-gray-100 dark:active:bg-gray-700"
              onClick={handleNextYear}
            >
              <Icon name="ChevronsRight" size={16} />
            </View>
          )}
        </View>
      </View>

      <View className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((d) => (
          <View key={d} className="text-center text-xs text-gray-500 dark:text-gray-400 py-1.5">
            <Text>{d}</Text>
          </View>
        ))}
      </View>

      <View className="grid grid-cols-7">
        {allDays.map((dayInfo, idx) => {
          const dateStr = formatDateStr(new Date(dayInfo.year, dayInfo.month, dayInfo.day));
          const isCurrentMonth = dayInfo.month === viewMonth;
          const selected = isSelected(dateStr);
          const inRange = isInRange(dateStr);
          const rangeStartFlag = isRangeStart(dateStr);
          const rangeEndFlag = isRangeEnd(dateStr);
          const isToday = dateStr === today;

          return (
            <View
              key={idx}
              className={`
                relative h-10 flex items-center justify-center text-sm
                ${!isCurrentMonth ? 'text-gray-300 dark:text-gray-600' : 'text-gray-800 dark:text-gray-100'}
                ${selected && mode === 'single' ? 'text-white rounded-lg' : ''}
                ${selected && mode === 'range' ? 'text-white' : ''}
                ${inRange ? 'text-primary-700 dark:text-primary-300' : ''}
                ${rangeStartFlag && mode === 'range' ? 'rounded-l-lg' : ''}
                ${rangeEndFlag && mode === 'range' ? 'rounded-r-lg' : ''}
                ${!selected && !inRange && isToday ? 'font-semibold' : ''}
                ${isCurrentMonth && !selected && !inRange ? 'active:bg-gray-100 dark:active:bg-gray-700 rounded-lg' : ''}
              `}
              style={{
                backgroundColor: selected
                  ? themeColor
                  : inRange
                  ? `${themeColor}20`
                  : 'transparent',
                color: !selected && !inRange && isToday ? themeColor : undefined,
              }}
              onClick={() => handleSelectDay(dayInfo)}
            >
              <Text>{dayInfo.day}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

// ==================== 单日期选择弹窗 ====================
interface CalendarPickerProps {
  isOpen: boolean;
  value: string;
  onConfirm: (date: string) => void;
  onClose: () => void;
  title?: string;
  themeColor?: string;
}

export function CalendarPicker({ isOpen, value, onConfirm, onClose, title = '选择日期', themeColor = '#10b981' }: CalendarPickerProps) {
  const [tempDate, setTempDate] = useState(value);

  useEffect(() => {
    if (isOpen) {
      setTempDate(value);
    }
  }, [isOpen, value]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      showFooter
      cancelText="取消"
      confirmText="确定"
      confirmColor={themeColor}
      onConfirm={() => {
        onConfirm(tempDate);
        onClose();
      }}
    >
      <View className="p-4">
        <Calendar
          mode="single"
          value={tempDate}
          onChange={setTempDate}
          themeColor={themeColor}
          config={{ showYearPicker: true, showMonthPicker: true, showDayPicker: true }}
        />
      </View>
    </Modal>
  );
}

// ==================== 区间日期选择弹窗 ====================
interface CalendarRangePickerProps {
  isOpen: boolean;
  startValue: string;
  endValue: string;
  onConfirm: (start: string, end: string) => void;
  onClose: () => void;
  title?: string;
  themeColor?: string;
}

export function CalendarRangePicker({ isOpen, startValue, endValue, onConfirm, onClose, title = '选择日期范围', themeColor = '#10b981' }: CalendarRangePickerProps) {
  const [tempStart, setTempStart] = useState(startValue);
  const [tempEnd, setTempEnd] = useState(endValue);

  useEffect(() => {
    if (isOpen) {
      setTempStart(startValue);
      setTempEnd(endValue);
    }
  }, [isOpen, startValue, endValue]);

  const handleRangeChange = (start: string, end: string) => {
    setTempStart(start);
    setTempEnd(end);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      showFooter
      cancelText="取消"
      confirmText="确定"
      confirmDisabled={!tempStart || !tempEnd}
      confirmColor={themeColor}
      onConfirm={() => {
        if (tempStart && tempEnd) {
          onConfirm(tempStart, tempEnd);
          onClose();
        }
      }}
    >
      <View className="px-4 pt-3 pb-1">
        <View className="flex items-center justify-center gap-2 text-sm">
          <View className={`px-3 py-1 rounded-lg ${tempStart ? 'text-white' : 'text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700'}`}
            style={tempStart ? { backgroundColor: themeColor } : undefined}
          >
            <Text>{tempStart || '开始日期'}</Text>
          </View>
          <Text className="text-gray-400 dark:text-gray-500">~</Text>
          <View className={`px-3 py-1 rounded-lg ${tempEnd ? 'text-white' : 'text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700'}`}
            style={tempEnd ? { backgroundColor: themeColor } : undefined}
          >
            <Text>{tempEnd || '结束日期'}</Text>
          </View>
        </View>
      </View>

      <View className="p-4">
        <Calendar
          mode="range"
          startValue={tempStart}
          endValue={tempEnd}
          onRangeChange={handleRangeChange}
          themeColor={themeColor}
          config={{ showYearPicker: true, showMonthPicker: true, showDayPicker: true }}
        />
      </View>
    </Modal>
  );
}

// ==================== 年月选择弹窗 ====================
interface YearMonthPickerProps {
  isOpen: boolean;
  value: string;
  onConfirm: (date: string) => void;
  onClose: () => void;
  mode: 'year' | 'month';
  themeColor?: string;
}

export function YearMonthPicker({ isOpen, value, onConfirm, onClose, mode, themeColor = '#10b981' }: YearMonthPickerProps) {
  const [tempValue, setTempValue] = useState(value);

  useEffect(() => {
    if (isOpen) {
      setTempValue(value);
    }
  }, [isOpen, value]);

  const handleConfirm = () => {
    onConfirm(tempValue);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'year' ? '选择年份' : '选择年月'}
      showFooter
      cancelText="取消"
      confirmText="确定"
      confirmColor={themeColor}
      onConfirm={handleConfirm}
    >
      <View className="p-4">
        <Calendar
          mode="single"
          value={tempValue}
          onChange={setTempValue}
          themeColor={themeColor}
          config={{
            showYearPicker: true,
            showMonthPicker: mode === 'month',
            showDayPicker: false,
          }}
        />
      </View>
    </Modal>
  );
}
