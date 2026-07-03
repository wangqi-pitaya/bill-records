import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
  const navigate = useNavigate();
  const { bills, deleteBill } = useBillStore();
  
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

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
  
  const availableMonths = useMemo(() => {
    const months = new Set<number>();
    bills.filter(b => parseInt(b.date.split('-')[0]) === selectedYear).forEach(b => {
      months.add(parseInt(b.date.split('-')[1]));
    });
    for (let m = 1; m <= 12; m++) months.add(m);
    return Array.from(months).sort((a, b) => a - b);
  }, [bills, selectedYear]);
  
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

  const prevYear = () => {
    const idx = availableYears.indexOf(selectedYear);
    if (idx < availableYears.length - 1) {
      setSelectedYear(availableYears[idx + 1]);
    }
  };
  
  const nextYear = () => {
    const idx = availableYears.indexOf(selectedYear);
    if (idx > 0) {
      setSelectedYear(availableYears[idx - 1]);
    }
  };

  const prevMonth = () => {
    if (selectedMonth === null) {
      setSelectedMonth(12);
    } else if (selectedMonth > 1) {
      setSelectedMonth(selectedMonth - 1);
    } else {
      const idx = availableYears.indexOf(selectedYear);
      if (idx < availableYears.length - 1) {
        setSelectedYear(availableYears[idx + 1]);
        setSelectedMonth(12);
      }
    }
  };
  
  const nextMonth = () => {
    if (selectedMonth === null) {
      setSelectedMonth(1);
    } else if (selectedMonth < 12) {
      setSelectedMonth(selectedMonth + 1);
    } else {
      const idx = availableYears.indexOf(selectedYear);
      if (idx > 0) {
        setSelectedYear(availableYears[idx - 1]);
        setSelectedMonth(1);
      }
    }
  };

  const [showFloatingButton, setShowFloatingButton] = useState(true);
  const prevScrollY = useRef(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editBill, setEditBill] = useState<Bill | null>(null);

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
          <div className="h-12 flex items-center justify-between">
            <div></div>
            <div className="flex items-center gap-3">
              <button
                onClick={prevYear}
                disabled={availableYears.indexOf(selectedYear) === availableYears.length - 1}
                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-900 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-base font-bold text-gray-800">{selectedYear}年</span>
              <button
                onClick={nextYear}
                disabled={availableYears.indexOf(selectedYear) === 0}
                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-900 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <div></div>
          </div>
          <div className="h-10 flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setSelectedMonth(null)}
              className={`shrink-0 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedMonth === null
                  ? 'bg-emerald-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              全部
            </button>
            {availableMonths.map(month => (
              <button
                key={month}
                onClick={() => setSelectedMonth(month)}
                className={`shrink-0 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedMonth === month
                    ? 'bg-emerald-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {month}月
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-24 pb-4">
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
                        setEditBill(b);
                        setDrawerOpen(true);
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
          setEditBill(null);
          setDrawerOpen(true);
        }}
        visible={showFloatingButton}
      />

      <AddBillDrawer
        isOpen={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setEditBill(null);
        }}
        editBill={editBill}
      />
    </div>
  );
}