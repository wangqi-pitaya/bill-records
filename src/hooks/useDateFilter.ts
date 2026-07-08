import { useState, useCallback } from 'react';

export function useDateFilter() {
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | null>(now.getMonth() + 1);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'year' | 'month'>('month');
  const [tempDate, setTempDate] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`);

  const confirmSelection = useCallback(() => {
    const [y, m] = tempDate.split('-').map(Number);
    setSelectedYear(y);
    if (pickerMode === 'month') {
      setSelectedMonth(m);
    } else {
      setSelectedMonth(null);
    }
    setShowDatePicker(false);
  }, [tempDate, pickerMode]);

  return {
    selectedYear,
    selectedMonth,
    showDatePicker,
    pickerMode,
    tempDate,
    setSelectedYear,
    setSelectedMonth,
    setShowDatePicker,
    setPickerMode,
    setTempDate,
    confirmSelection,
  };
}
