import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, Moon, Sun, Menu } from 'lucide-react';
import { useBillStore } from '../store/useBillStore';
import { useWalletStore } from '../store/useWalletStore';
import { useTheme } from '../hooks/useTheme';
import { useToast } from '../hooks/useToast';
import { useDateFilter } from '../hooks/useDateFilter';
import { useScrollFloatingButton } from '../hooks/useScrollFloatingButton';
import { StatCard } from '../components/StatCard';
import { BillItem } from '../components/BillItem';
import { FloatingButton } from '../components/FloatingButton';
import { AddBillDrawer } from '../components/AddBillDrawer';
import { Calendar } from '../components/Calendar';
import {
  getDateLabel,
  groupBillsByDate,
  filterBillsByDate,
  filterBillsByWallet,
  formatMoney,
} from '../lib/utils';

export default function Home() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { bills: allBills, softDeleteBill, getBillById } = useBillStore();
  const { wallets, currentWalletId } = useWalletStore();
  const { isDark, toggleTheme } = useTheme();
  const toast = useToast();

  const currentWallet = useMemo(() => {
    return wallets.find(w => w.id === currentWalletId);
  }, [wallets, currentWalletId]);

  const bills = useMemo(() => allBills.filter(b => !b.deleted), [allBills]);

  const walletBills = useMemo(
    () => filterBillsByWallet(bills, currentWalletId),
    [bills, currentWalletId]
  );

  const dateFilter = useDateFilter(walletBills);
  const { visible: floatingButtonVisible } = useScrollFloatingButton();

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

  const filteredBills = useMemo(
    () => filterBillsByDate(walletBills, dateFilter.selectedYear, dateFilter.selectedMonth),
    [walletBills, dateFilter.selectedYear, dateFilter.selectedMonth]
  );

  const yearStatistics = useMemo(() => {
    const income = filteredBills.filter(b => b.type === 'income').reduce((sum, b) => sum + b.amount, 0);
    const expense = filteredBills.filter(b => b.type === 'expense').reduce((sum, b) => sum + b.amount, 0);
    return { income, expense, balance: income - expense };
  }, [filteredBills]);

  const groupedBills = groupBillsByDate(filteredBills);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 px-4 shadow-sm transition-colors duration-300">
        <div className="max-w-4xl mx-auto">
          <div className="h-12 flex items-center justify-between">
            <button
              onClick={() => navigate('/wallets')}
              className="w-8 h-8 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <button
              onClick={() => dateFilter.setShowDatePicker(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <span className="text-base font-bold text-gray-800 dark:text-gray-100">
                {dateFilter.selectedYear}年{dateFilter.selectedMonth !== null ? `${dateFilter.selectedMonth}月` : ''}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>
            <button
              onClick={toggleTheme}
              className="w-8 h-8 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-16 pb-20">
        <div className="mb-6">
          <StatCard
            income={yearStatistics.income}
            expense={yearStatistics.expense}
            balance={yearStatistics.balance}
            color={currentWallet?.color}
          />
        </div>

        {filteredBills.length > 0 ? (
          <div className="space-y-4">
            {groupedBills.map((group) => (
              <div key={group.date} className="bg-white dark:bg-gray-800 rounded-card shadow-card overflow-hidden transition-colors duration-300">
                <div className="px-4 py-2.5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between gap-4 transition-colors duration-300">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap flex-shrink-0">{getDateLabel(group.date)}</span>
                  <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                    {group.totalExpense > 0 && (
                      <span className="text-xs text-expense-500 whitespace-nowrap text-right leading-none">
                        <span className="text-gray-400 dark:text-gray-500 mr-0.5">支出</span>
                        <span className="font-semibold">-{formatMoney(group.totalExpense)}</span>
                      </span>
                    )}
                    {group.totalIncome > 0 && (
                      <span className="text-xs text-income-500 whitespace-nowrap text-right leading-none">
                        <span className="text-gray-400 dark:text-gray-500 mr-0.5">收入</span>
                        <span className="font-semibold">+{formatMoney(group.totalIncome)}</span>
                      </span>
                    )}
                  </div>
                </div>
                <div className="divide-y divide-gray-50 dark:divide-gray-700">
                  {group.bills.map((bill, idx) => (
                    <BillItem
                      key={bill.id}
                      bill={bill}
                      onDelete={(id) => {
                        softDeleteBill(id);
                        toast.success('账单已删除，可在回收站找回');
                      }}
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
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <p>{dateFilter.selectedYear}年{dateFilter.selectedMonth !== null ? `${dateFilter.selectedMonth}月` : ''}暂无账单记录</p>
            <p className="text-sm mt-2">点击右下角按钮添加第一笔账单</p>
          </div>
        )}
      </main>

      <FloatingButton
        onClick={() => {
          setSearchParams({ add: 'true' });
        }}
        visible={floatingButtonVisible}
        color={currentWallet?.color}
        className="bottom-20"
      />

      {dateFilter.showDatePicker && (
        <div
          className="fixed inset-0 z-[60] flex items-start animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) dateFilter.setShowDatePicker(false);
          }}
        >
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative w-full bg-white dark:bg-gray-800 rounded-b-2xl max-h-[80vh] overflow-auto animate-slide-down transition-colors duration-300">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 transition-colors duration-300">
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => {
                    dateFilter.setPickerMode('year');
                  }}
                  className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                    dateFilter.pickerMode === 'year'
                      ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                  }`}
                >
                  年
                </button>
                <button
                  onClick={() => dateFilter.setPickerMode('month')}
                  className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                    dateFilter.pickerMode === 'month'
                      ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                  }`}
                >
                  月
                </button>
              </div>
            </div>

            <div className="px-4 py-4">
              <Calendar
                mode="single"
                value={dateFilter.tempDate}
                onChange={dateFilter.setTempDate}
                config={{
                  showYearPicker: true,
                  showMonthPicker: dateFilter.pickerMode === 'month',
                  showDayPicker: false,
                }}
              />
            </div>

            <div className="sticky bottom-0 bg-white dark:bg-gray-800 px-4 py-3 border-t border-gray-100 dark:border-gray-700 flex gap-3 transition-colors duration-300">
              <button
                onClick={() => dateFilter.setShowDatePicker(false)}
                className="flex-1 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                取消
              </button>
              <button
                onClick={dateFilter.confirmSelection}
                className="flex-1 py-2.5 rounded-lg bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors"
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
