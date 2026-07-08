import { useState, useEffect, useCallback } from 'react';
import { useCategoryStore } from '../store/useCategoryStore';
import { useBillStore } from '../store/useBillStore';
import { useWalletStore } from '../store/useWalletStore';
import { useToast } from './useToast';
import { Category, BillType, Bill } from '../types';
import { formatDate } from '../lib/utils';

export interface UseBillFormOptions {
  editBill?: Bill | null;
  onSuccess?: () => void;
}

export function useBillForm({ editBill, onSuccess }: UseBillFormOptions = {}) {
  const toast = useToast();
  const addBill = useBillStore((state) => state.addBill);
  const updateBill = useBillStore((state) => state.updateBill);
  const getCategoriesByType = useCategoryStore((state) => state.getCategoriesByType);
  const currentWalletId = useWalletStore((state) => state.currentWalletId);

  const isEdit = !!editBill;

  const [activeTab, setActiveTab] = useState<BillType>('expense');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(formatDate(new Date()));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateAmount = useCallback((value: string): string => {
    let val = value.replace(/[^0-9.]/g, '');
    if (val.startsWith('.')) {
      val = '0' + val;
    }
    const parts = val.split('.');
    if (parts.length > 2) {
      val = parts[0] + '.' + parts[1];
    }
    if (parts[0] && parts[0].length > 1 && parts[0].startsWith('0')) {
      val = val.replace(/^0+/, '0');
      if (val === '0') {
        val = '0';
      } else if (val.startsWith('0.')) {
        val = '0.' + (parts[1] || '');
      }
    }
    if (parts[0] && parts[0].length > 9) {
      parts[0] = parts[0].slice(0, 9);
      val = parts[0] + (parts[1] !== undefined ? '.' + parts[1] : '');
    }
    if (parts[1] && parts[1].length > 2) {
      val = parts[0] + '.' + parts[1].slice(0, 2);
    }
    return val;
  }, []);

  const resetForm = useCallback(() => {
    setActiveTab('expense');
    setAmount('');
    setNote('');
    setDate(formatDate(new Date()));
    const categories = getCategoriesByType('expense');
    setSelectedCategory(categories.length > 0 ? categories[0] : null);
  }, [getCategoriesByType]);

  useEffect(() => {
    if (editBill) {
      setActiveTab(editBill.type);
      setAmount(editBill.amount.toString());
      setNote(editBill.note);
      setDate(editBill.date);
      const categories = getCategoriesByType(editBill.type);
      const cat = categories.find((c) => c.name === editBill.category);
      if (cat) setSelectedCategory(cat);
    } else {
      resetForm();
    }
  }, [editBill, getCategoriesByType, resetForm]);

  const handleTabChange = useCallback(
    (type: BillType) => {
      setActiveTab(type);
      const categories = getCategoriesByType(type);
      setSelectedCategory(categories.length > 0 ? categories[0] : null);
    },
    [getCategoriesByType]
  );

  const buildBillData = useCallback(() => {
    if (!selectedCategory || !amount) return null;
    return {
      type: selectedCategory.type,
      category: selectedCategory.name,
      icon: selectedCategory.icon,
      amount: parseFloat(amount),
      note,
      date,
      walletId: currentWalletId,
    };
  }, [selectedCategory, amount, note, date, currentWalletId]);

  const handleSave = useCallback(() => {
    const billData = buildBillData();
    if (!billData) return;

    setIsSubmitting(true);
    setTimeout(() => {
      if (isEdit && editBill) {
        updateBill(editBill.id, billData);
        toast.success('账单已更新');
      } else {
        addBill(billData);
        toast.success('账单已保存');
        resetForm();
      }
      setIsSubmitting(false);
      onSuccess?.();
    }, 150);
  }, [buildBillData, isEdit, editBill, updateBill, addBill, toast, onSuccess, resetForm]);

  const handleSaveAndContinue = useCallback(() => {
    const billData = buildBillData();
    if (!billData) return;

    setIsSubmitting(true);
    setTimeout(() => {
      addBill(billData);
      toast.success('已保存，继续记账');
      setAmount('');
      setNote('');
      setIsSubmitting(false);
    }, 150);
  }, [buildBillData, addBill, toast]);

  const currentCategories = getCategoriesByType(activeTab);
  const canSubmit = !!selectedCategory && !!amount && !isSubmitting;

  return {
    activeTab,
    selectedCategory,
    amount,
    note,
    date,
    showDatePicker,
    isSubmitting,
    isEdit,
    currentCategories,
    canSubmit,
    setActiveTab: handleTabChange,
    setSelectedCategory,
    setAmount: (val: string) => setAmount(validateAmount(val)),
    setNote,
    setDate,
    setShowDatePicker,
    handleSave,
    handleSaveAndContinue,
    resetForm,
    validateAmount,
  };
}
