import { useState } from 'react';
import { X } from 'lucide-react';

interface DatePickerProps {
  isOpen: boolean;
  value: string;
  onConfirm: (date: string) => void;
  onClose: () => void;
}

const formatDate = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getQuickDates = () => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const dayBefore = new Date(today);
  dayBefore.setDate(today.getDate() - 2);
  return [
    { label: '今天', value: formatDate(today) },
    { label: '昨天', value: formatDate(yesterday) },
    { label: '前天', value: formatDate(dayBefore) },
  ];
};

export const DatePicker = ({ isOpen, value, onConfirm, onClose }: DatePickerProps) => {
  const [tempDate, setTempDate] = useState(value);
  const [viewYear, setViewYear] = useState(() => parseInt(value.split('-')[0]));
  const [viewMonth, setViewMonth] = useState(() => parseInt(value.split('-')[1]) - 1);

  if (!isOpen) return null;

  const quickDates = getQuickDates();

  const handleConfirm = () => {
    onConfirm(tempDate);
    onClose();
  };

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const newDate = new Date(viewYear, viewMonth, day);
    setTempDate(formatDate(newDate));
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfWeek = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfWeek(viewYear, viewMonth);
  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const selectedDay = tempDate === formatDate(new Date(viewYear, viewMonth, 1)) || 
    (parseInt(tempDate.split('-')[0]) === viewYear && 
     parseInt(tempDate.split('-')[1]) - 1 === viewMonth)
    ? parseInt(tempDate.split('-')[2])
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-modal w-full max-w-[280px] overflow-hidden animate-scale-in">
        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">选择日期</h3>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <X className="w-3 h-3 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-3">
          <div className="flex items-center gap-1.5 mb-2">
            {quickDates.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  setTempDate(opt.value);
                  setViewYear(parseInt(opt.value.split('-')[0]));
                  setViewMonth(parseInt(opt.value.split('-')[1]) - 1);
                }}
                className={`flex-1 py-1 text-xs rounded-md font-medium transition-colors ${
                  tempDate === opt.value
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between mb-2">
            <button
              onClick={handlePrevMonth}
              className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 text-sm text-gray-700 dark:text-gray-300"
            >
              ‹
            </button>
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              {viewYear}年{viewMonth + 1}月
            </span>
            <button
              onClick={handleNextMonth}
              className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 text-sm text-gray-700 dark:text-gray-300"
            >
              ›
            </button>
          </div>

          <div className="grid grid-cols-7 gap-0.5 mb-0.5">
            {['日', '一', '二', '三', '四', '五', '六'].map((d) => (
              <div key={d} className="text-center text-[10px] text-gray-500 dark:text-gray-400 py-0.5">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {days.map((day, idx) => {
              if (day === null) return <div key={idx} />;
              const isSelected = day === selectedDay;
              const isToday = formatDate(new Date()) === formatDate(new Date(viewYear, viewMonth, day));
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectDay(day)}
                  className={`aspect-square rounded-md text-xs font-medium transition-colors ${
                    isSelected
                      ? 'bg-primary-500 text-white'
                      : isToday
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-xs text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-r border-gray-100 dark:border-gray-700"
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-2.5 text-xs text-primary-500 dark:text-primary-400 font-medium hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );
};