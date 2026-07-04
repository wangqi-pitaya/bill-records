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
  pickerYear: number;
  setPickerYear: (year: number) => void;
  pickerMonth: number | null;
  setPickerMonth: (month: number | null) => void;
  availableYears: number[];
  confirmSelection: () => void;
}

export function useDateFilter(bills: { date: string }[]): DateFilterState {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'year' | 'month'>('year');
  const [pickerYear, setPickerYear] = useState(selectedYear);
  const [pickerMonth, setPickerMonth] = useState<number | null>(selectedMonth);

  useEffect(() => {
    setPickerYear(selectedYear);
    setPickerMonth(selectedMonth);
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
    setSelectedYear(pickerYear);
    setSelectedMonth(pickerMode === 'year' ? null : pickerMonth);
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
    pickerYear,
    setPickerYear,
    pickerMonth,
    setPickerMonth,
    availableYears,
    confirmSelection,
  };
}
