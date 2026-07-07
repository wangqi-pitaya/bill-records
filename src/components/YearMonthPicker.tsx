import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface YearMonthPickerProps {
  isOpen: boolean;
  mode: 'year' | 'month';
  initialYear: number;
  initialMonth: number;
  onClose: () => void;
  onConfirm: (year: number, month?: number) => void;
  minYear?: number;
  maxYear?: number;
}

export function YearMonthPicker({
  isOpen,
  mode,
  initialYear,
  initialMonth,
  onClose,
  onConfirm,
  minYear = 1900,
  maxYear = 2100,
}: YearMonthPickerProps) {
  const [viewYear, setViewYear] = useState(initialYear);
  const [viewMonth, setViewMonth] = useState(initialMonth);
  const [pageStartYear, setPageStartYear] = useState(initialYear - 5);

  useEffect(() => {
    if (isOpen) {
      setViewYear(initialYear);
      setViewMonth(initialMonth);
      setPageStartYear(initialYear - 5);
    }
  }, [isOpen, initialYear, initialMonth]);

  if (!isOpen) return null;

  const handlePrev = () => {
    if (mode === 'year') {
      const newStart = pageStartYear - 12;
      setPageStartYear(newStart);
    } else {
      if (viewYear > minYear) setViewYear(viewYear - 1);
    }
  };

  const handleNext = () => {
    if (mode === 'year') {
      const newStart = pageStartYear + 12;
      setPageStartYear(newStart);
    } else {
      if (viewYear < maxYear) setViewYear(viewYear + 1);
    }
  };

  const canGoPrev = mode === 'year' ? true : viewYear > minYear;
  const canGoNext = mode === 'year' ? true : viewYear < maxYear;

  const handleConfirm = () => {
    if (mode === 'year') {
      onConfirm(viewYear);
    } else {
      onConfirm(viewYear, viewMonth);
    }
  };

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
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={handlePrev}
              disabled={!canGoPrev}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-sm transition-colors ${
                canGoPrev
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  : 'bg-gray-50 dark:bg-gray-800 text-gray-300 dark:text-gray-700 cursor-not-allowed'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              {mode === 'year'
                ? `${pageStartYear} - ${pageStartYear + 11}`
                : `${viewYear}年`}
            </span>
            <button
              onClick={handleNext}
              disabled={!canGoNext}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-sm transition-colors ${
                canGoNext
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  : 'bg-gray-50 dark:bg-gray-800 text-gray-300 dark:text-gray-700 cursor-not-allowed'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {mode === 'year'
              ? Array.from({ length: 12 }, (_, i) => pageStartYear + i).map((year) => (
                  <button
                    key={year}
                    onClick={() => {
                      setViewYear(year);
                      if (mode === 'year') {
                        onConfirm(year);
                        onClose();
                      }
                    }}
                    className={`py-2 rounded-lg text-xs font-medium transition-colors ${
                      viewYear === year
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {year}年
                  </button>
                ))
              : Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <button
                    key={month}
                    onClick={() => setViewMonth(month)}
                    className={`py-2 rounded-lg text-xs font-medium transition-colors ${
                      viewMonth === month
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {month}月
                  </button>
                ))}
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
}
