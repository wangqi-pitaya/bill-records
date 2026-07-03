import { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { ChevronDown, X } from 'lucide-react';
import { useBillStore } from '../store/useBillStore';
import { StatCard } from '../components/StatCard';
import { BillItem } from '../components/BillItem';
import { FloatingButton } from '../components/FloatingButton';
import { AddBillDrawer } from '../components/AddBillDrawer';
import { Bill } from '../types';

const formatDate = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getDateLabel = (dateStr: string) => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const dayBefore = new Date(today);
  dayBefore.setDate(today.getDate() - 2);
  
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const weekday = weekdays[date.getDay()];
  
  if (dateStr === formatDate(today)) return `${month}月${day}日 今天`;
  if (dateStr === formatDate(yesterday)) return `${month}月${day}日 昨天`;
  if (dateStr === formatDate(dayBefore)) return `${month}月${day}日 前天`;
  
  return `${month}月${day}日 ${weekday}`;
};

const groupBillsByDate = (bills: Bill[]) => {
  const groups: Record<string, Bill[]> = {};
  bills.forEach(bill => {
    if (!groups[bill.date]) {
      groups[bill.date] = [];
    }
    groups[bill.date].push(bill);
  });
  
  const sortedDates = Object.keys(groups).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  
  return sortedDates.map(date => ({
    date,
    bills: groups[date],
    totalIncome: groups[date].filter(b => b.type === 'income').reduce((sum, b) => sum + b.amount, 0),
    totalExpense: groups[date].filter(b => b.type === 'expense').reduce((sum, b) => sum + b.amount, 0),
  }));
};

export default function Home() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { bills, deleteBill, getBillById } = useBillStore();

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  
  const [drawerOpen, setDrawerOpen] = useState(() => {
    return location.search.includes('add=true');
  });
  
  useEffect(() => {
    setDrawerOpen(location.search.includes('add=true'));
  }, [location.search]);
  
  const editBillId = searchParams.get('edit');
  const editBill = useMemo(() => {
    if (!editBillId) return null;
    return getBillById(editBillId) || null;
  }, [editBillId, getBillById]);

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);
  
  const availableYears = useMemo(() => {
    const years = new Set(bills.map(b => parseInt(b.date.split('-')[0])));
    years.add(currentYear);
    return Array.from(years).sort((a, b) => b - a);
  }, [bills, currentYear]);
  
  const filteredBills = useMemo(() => {
    return bills.filter(b => {
      const [y, m] = b.date.split('-').map(Number);
      if (y !== selectedYear) return false;
      if (selectedMonth !== null && m !== selectedMonth) return false;
      return true;
    });
  }, [bills, selectedYear, selectedMonth]);
  
  const yearStatistics = useMemo(() => {
    const income = filteredBills.filter(b => b.type === 'income').reduce((sum, b) => sum + b.amount, 0);
    const expense = filteredBills.filter(b => b.type === 'expense').reduce((sum, b) => sum + b.amount, 0);
    return { income, expense, balance: income - expense };
  }, [filteredBills]);
  
  const groupedBills = groupBillsByDate(filteredBills);

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

  const [showFloatingButton, setShowFloatingButton] = useState(true);
  const prevScrollY = useRef(0);

  useEffect(() => {
    const hasBillsInYear = bills.some(b => parseInt(b.date.split('-')[0]) === selectedYear);
    if (!hasBillsInYear) {
      const yearsWithBills = Array.from(new Set(bills.map(b => parseInt(b.date.split('-')[0])))).sort((a, b) => b - a);
      const nextYearWithData = yearsWithBills.find(y => y > selectedYear);
      if (nextYearWithData) {
        setSelectedYear(nextYearWithData);
        setSelectedMonth(null);
      } else if (yearsWithBills.length === 0) {
        if (selectedYear !== currentYear) {
          setSelectedYear(currentYear);
          setSelectedMonth(null);
        }
      }
    }
  }, [bills, selectedYear, currentYear]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > prevScrollY.current && currentScrollY > 100) {
        setShowFloatingButton(false);
      } else {
        setShowFloatingButton(true);
      }
      prevScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white px-4 shadow-sm">
        <div className="max-w-4xl mx-auto">
          <div className="h-12 flex items-center justify-center">
            <button
              onClick={() => setShowDatePicker(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="text-base font-bold text-gray-800">
                {selectedYear}年{selectedMonth !== null ? `${selectedMonth}月` : ''}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-16 pb-4">
        <div className="mb-6">
          <StatCard income={yearStatistics.income} expense={yearStatistics.expense} balance={yearStatistics.balance} />
        </div>

        {filteredBills.length > 0 ? (
          <div className="space-y-4">
            {groupedBills.map((group) => (
              <div key={group.date} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">{getDateLabel(group.date)}</span>
                  <div className="flex items-center gap-4">
                    {group.totalExpense > 0 && (
                      <span className="text-sm text-red-500">
                        <span className="text-gray-400 mr-1">支出</span>
                        <span className="font-semibold">-{group.totalExpense.toFixed(2)}</span>
                      </span>
                    )}
                    {group.totalIncome > 0 && (
                      <span className="text-sm text-green-500">
                        <span className="text-gray-400 mr-1">收入</span>
                        <span className="font-semibold">+{group.totalIncome.toFixed(2)}</span>
                      </span>
                    )}
                  </div>
                </div>
                <div className="divide-y divide-gray-50">
                  {group.bills.map((bill, idx) => (
                    <BillItem
                      key={bill.id}
                      bill={bill}
                      onDelete={deleteBill}
                      isLast={idx === group.bills.length - 1}
                      onEdit={(b) => {
                        setSearchParams({ add: 'true', edit: b.id });
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p>{selectedYear}年{selectedMonth !== null ? `${selectedMonth}月` : ''}暂无账单记录</p>
            <p className="text-sm mt-2">点击右下角按钮添加第一笔账单</p>
          </div>
        )}
      </main>

      <FloatingButton
        onClick={() => {
          setSearchParams({ add: 'true' });
        }}
        visible={showFloatingButton}
      />

      {showDatePicker && (
        <div
          className="fixed inset-0 z-[60] flex items-start"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowDatePicker(false);
          }}
        >
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative w-full bg-white rounded-b-2xl max-h-[80vh] overflow-auto animate-slide-down">
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => {
                    setPickerMode('year');
                    setPickerMonth(null);
                  }}
                  className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                    pickerMode === 'year'
                      ? 'bg-white text-emerald-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  按年
                </button>
                <button
                  onClick={() => setPickerMode('month')}
                  className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                    pickerMode === 'month'
                      ? 'bg-white text-emerald-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  按月
                </button>
              </div>
            </div>

            <div className="px-4 py-4">
              <div className="mb-4">
                <span className="text-sm font-medium text-gray-500 mb-2 block">年份</span>
                <div className="flex flex-wrap gap-2">
                  {availableYears.map(year => (
                    <button
                      key={year}
                      onClick={() => setPickerYear(year)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        pickerYear === year
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {year}年
                    </button>
                  ))}
                </div>
              </div>

              {pickerMode === 'month' && (
                <div>
                  <span className="text-sm font-medium text-gray-500 mb-2 block">月份</span>
                  <div className="grid grid-cols-4 gap-2">
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                      <button
                        key={month}
                        onClick={() => setPickerMonth(month)}
                        className={`px-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                          pickerMonth === month
                            ? 'bg-emerald-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {month}月
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-white px-4 py-3 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setShowDatePicker(false)}
                className="flex-1 py-2.5 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => {
                  setSelectedYear(pickerYear);
                  setSelectedMonth(pickerMode === 'year' ? null : pickerMonth);
                  setShowDatePicker(false);
                }}
                className="flex-1 py-2.5 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition-colors"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}

      <AddBillDrawer
        isOpen={drawerOpen}
        onClose={() => {
          window.history.back();
        }}
        editBill={editBill}
      />
    </div>
  );
}