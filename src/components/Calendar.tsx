import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, X } from 'lucide-react';

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
        <div className="w-full select-none">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-0.5">
              <button
                onClick={handlePrevYearPage}
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
            </div>

            <span className="text-base font-semibold text-gray-800 dark:text-gray-100">
              {viewYear}年
            </span>

            <div className="flex items-center gap-0.5">
              <button
                onClick={handleNextYearPage}
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-700 transition-colors"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {yearPage.map((year) => {
              const isSelectedYear = mode === 'single' && value
                ? parseDate(value).getFullYear() === year
                : false;
              
              return (
                <button
                  key={year}
                  onClick={() => {
                    setViewYear(year);
                    handleSelectDate(year, 0);
                  }}
                  className={`py-3 rounded-lg text-sm font-medium transition-colors ${
                    isSelectedYear
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {year}年
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    return (
      <div className="w-full select-none">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-0.5">
            <button
              onClick={handlePrevYear}
              className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => handleSelectDate(viewYear, viewMonth)}
            className={`text-base font-semibold transition-colors ${
              isSelected(selectedDateStr)
                ? 'text-primary-500'
                : 'text-gray-800 dark:text-gray-100 hover:text-primary-500'
            }`}
          >
            {viewYear}年
          </button>

          <div className="flex items-center gap-0.5">
            <button
              onClick={handleNextYear}
              className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {months.map((month, index) => {
            const isSelectedMonth = mode === 'single' && value
              ? parseDate(value).getFullYear() === viewYear && parseDate(value).getMonth() === index
              : false;
            
            return (
              <button
                key={index}
                onClick={() => {
                  setViewMonth(index);
                  handleSelectDate(viewYear, index);
                }}
                className={`py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isSelectedMonth
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {month}
              </button>
            );
          })}
        </div>
      </div>
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
    <div className="w-full select-none">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-0.5">
          {config.showYearPicker && (
            <button
              onClick={handlePrevYear}
              className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
          )}
          {config.showMonthPicker && (
            <button
              onClick={handlePrevMonth}
              className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        <span className="text-base font-semibold text-gray-800 dark:text-gray-100">
          {viewYear}年{viewMonth + 1}月
        </span>

        <div className="flex items-center gap-0.5">
          {config.showMonthPicker && (
            <button
              onClick={handleNextMonth}
              className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
          {config.showYearPicker && (
            <button
              onClick={handleNextYear}
              className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-xs text-gray-500 dark:text-gray-400 py-1.5">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0">
        {allDays.map((dayInfo, idx) => {
          const dateStr = formatDateStr(new Date(dayInfo.year, dayInfo.month, dayInfo.day));
          const isCurrentMonth = dayInfo.month === viewMonth;
          const selected = isSelected(dateStr);
          const inRange = isInRange(dateStr);
          const rangeStartFlag = isRangeStart(dateStr);
          const rangeEndFlag = isRangeEnd(dateStr);
          const isToday = dateStr === today;

          return (
            <button
              key={idx}
              onClick={() => handleSelectDay(dayInfo)}
              className={`
                relative h-10 flex items-center justify-center text-sm transition-colors
                ${!isCurrentMonth ? 'text-gray-300 dark:text-gray-600' : 'text-gray-800 dark:text-gray-100'}
                ${selected && mode === 'single' ? 'bg-primary-500 text-white rounded-lg' : ''}
                ${selected && mode === 'range' ? 'bg-primary-500 text-white' : ''}
                ${inRange ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' : ''}
                ${rangeStartFlag && mode === 'range' ? 'rounded-l-lg' : ''}
                ${rangeEndFlag && mode === 'range' ? 'rounded-r-lg' : ''}
                ${!selected && !inRange && isToday ? 'text-primary-500 font-semibold' : ''}
                ${isCurrentMonth && !selected && !inRange ? 'hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg' : ''}
              `}
            >
              {dayInfo.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ==================== 单日期选择弹窗 ====================
interface CalendarPickerProps {
  isOpen: boolean;
  value: string;
  onConfirm: (date: string) => void;
  onClose: () => void;
  title?: string;
}

export function CalendarPicker({ isOpen, value, onConfirm, onClose, title = '选择日期' }: CalendarPickerProps) {
  const [tempDate, setTempDate] = useState(value);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center px-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-modal w-full max-w-[340px] overflow-hidden animate-scale-in">
        {/* 头部 */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">{title}</h3>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <X className="w-3 h-3 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* 日历 */}
        <div className="p-4">
          <Calendar
            mode="single"
            value={tempDate}
            onChange={setTempDate}
            config={{ showYearPicker: true, showMonthPicker: true, showDayPicker: true }}
          />
        </div>

        {/* 底部按钮 */}
        <div className="flex border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={onClose}
            className="flex-1 py-3 text-sm text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-r border-gray-100 dark:border-gray-700"
          >
            取消
          </button>
          <button
            onClick={() => {
              onConfirm(tempDate);
              onClose();
            }}
            className="flex-1 py-3 text-sm text-primary-500 dark:text-primary-400 font-medium hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
          >
            确定
          </button>
        </div>
      </div>
    </div>
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
}

export function CalendarRangePicker({ isOpen, startValue, endValue, onConfirm, onClose, title = '选择日期范围' }: CalendarRangePickerProps) {
  const [tempStart, setTempStart] = useState(startValue);
  const [tempEnd, setTempEnd] = useState(endValue);

  if (!isOpen) return null;

  const handleRangeChange = (start: string, end: string) => {
    setTempStart(start);
    setTempEnd(end);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center px-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-modal w-full max-w-[340px] overflow-hidden animate-scale-in">
        {/* 头部 */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">{title}</h3>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <X className="w-3 h-3 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* 已选范围展示 */}
        <div className="px-4 pt-3 pb-1">
          <div className="flex items-center justify-center gap-2 text-sm">
            <span className={`px-3 py-1 rounded-lg ${tempStart ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium' : 'text-gray-400 dark:text-gray-500'}`}>
              {tempStart || '开始日期'}
            </span>
            <span className="text-gray-400 dark:text-gray-500">~</span>
            <span className={`px-3 py-1 rounded-lg ${tempEnd ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium' : 'text-gray-400 dark:text-gray-500'}`}>
              {tempEnd || '结束日期'}
            </span>
          </div>
        </div>

        {/* 日历 */}
        <div className="p-4">
          <Calendar
            mode="range"
            startValue={tempStart}
            endValue={tempEnd}
            onRangeChange={handleRangeChange}
            config={{ showYearPicker: true, showMonthPicker: true, showDayPicker: true }}
          />
        </div>

        {/* 底部按钮 */}
        <div className="flex border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={onClose}
            className="flex-1 py-3 text-sm text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-r border-gray-100 dark:border-gray-700"
          >
            取消
          </button>
          <button
            onClick={() => {
              if (tempStart && tempEnd) {
                onConfirm(tempStart, tempEnd);
                onClose();
              }
            }}
            disabled={!tempStart || !tempEnd}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              tempStart && tempEnd
                ? 'text-primary-500 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
            }`}
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );
}
