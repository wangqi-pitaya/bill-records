import { useState, useCallback } from 'react';

export function useDateFilter() {
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | null>(now.getMonth() + 1);

  const confirmSelection = useCallback(() => {
    // kept for API compatibility if needed externally
  }, []);

  return {
    selectedYear,
    selectedMonth,
    setSelectedYear,
    setSelectedMonth,
    confirmSelection,
  };
}
