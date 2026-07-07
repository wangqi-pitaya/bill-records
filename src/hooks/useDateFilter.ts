import { useState, useMemo, useEffect } from 'react';

export interface DateFilterState {
  selectedYear: number;
  selectedMonth: number | null;
  setSelectedYear: (year: number) => void;
  setSelectedMonth: (month: number | null) => void;
  showDatePicker: boolean;
  setShowDatePicker: (show: boolean) => void;
  pickerMode: 'year' | 'month';
  setPickerMode: (mode: 'year' | 'month') => void;
  tempDate: string;
  setTempDate: (date: string) => void;
  availableYears: number[];
  confirmSelection: () => void;
}

const formatDateStr = (year: number, month?: number | null): string => {
  const m = month != null ? String(month).padStart(2, '0') : '01';
  return `${year}-${m}-01`;
};

export function useDateFilter(bills: { date: string }[]): DateFilterState {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'year' | 'month'>('year');
  const [tempDate, setTempDate] = useState(formatDateStr(selectedYear, selectedMonth));

  useEffect(() => {
    setTempDate(formatDateStr(selectedYear, selectedMonth));
    setPickerMode(selectedMonth === null ? 'year' : 'month');
  }, [showDatePicker, selectedYear, selectedMonth]);

  useEffect(() => {
    if (showDatePicker) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showDatePicker]);

  const availableYears = useMemo(() => {
    const years = new Set(bills.map(b => parseInt(b.date.split('-')[0])));
    years.add(currentYear);
    return Array.from(years).sort((a, b) => b - a);
  }, [bills, currentYear]);

  const confirmSelection = () => {
    const [y, m] = tempDate.split('-').map(Number);
    setSelectedYear(y);
    setSelectedMonth(pickerMode === 'year' ? null : m);
    setShowDatePicker(false);
  };

  return {
    selectedYear,
    selectedMonth,
    setSelectedYear,
    setSelectedMonth,
    showDatePicker,
    setShowDatePicker,
    pickerMode,
    setPickerMode,
    tempDate,
    setTempDate,
    availableYears,
    confirmSelection,
  };
}
