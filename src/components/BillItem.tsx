import { useState, useRef, useCallback } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import * as Icons from 'lucide-react';
import { Bill } from '../types';
import { Modal } from './Modal';
import { formatMoney } from '../lib/utils';

interface BillItemProps {
  bill: Bill;
  onDelete: (id: string) => void;
  onEdit?: (bill: Bill) => void;
  isLast?: boolean;
}

export const BillItem = ({ bill, onDelete, onEdit, isLast = false }: BillItemProps) => {
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const currentTranslateRef = useRef(0);

  const actionWidth = 140;

  const IconComponent = (Icons as unknown as Record<string, React.FC<{ className?: string }>>)[bill.icon] || Icons.Circle;

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    startYRef.current = e.touches[0].clientY;
    currentTranslateRef.current = translateX;
    setIsDragging(true);
    setIsScrolling(false);
  }, [translateX]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const diffX = e.touches[0].clientX - startXRef.current;
    const diffY = e.touches[0].clientY - startYRef.current;
    
    if (!isScrolling && Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > 5) {
      setIsScrolling(true);
      return;
    }
    
    if (isScrolling) return;
    
    let newTranslate = currentTranslateRef.current + diffX;
    
    if (newTranslate > 0) newTranslate = 0;
    if (newTranslate < -actionWidth) newTranslate = -actionWidth;
    
    setTranslateX(newTranslate);
  }, [isDragging, isScrolling]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    if (translateX < -actionWidth / 2) {
      setTranslateX(-actionWidth);
    } else {
      setTranslateX(0);
    }
  }, [translateX]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    startXRef.current = e.clientX;
    currentTranslateRef.current = translateX;
    setIsDragging(true);
  }, [translateX]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    const diff = e.clientX - startXRef.current;
    let newTranslate = currentTranslateRef.current + diff;
    
    if (newTranslate > 0) newTranslate = 0;
    if (newTranslate < -actionWidth) newTranslate = -actionWidth;
    
    setTranslateX(newTranslate);
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    if (translateX < -actionWidth / 2) {
      setTranslateX(-actionWidth);
    } else {
      setTranslateX(0);
    }
  }, [isDragging, translateX]);

  const handleMouseLeave = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    if (translateX < -actionWidth / 2) {
      setTranslateX(-actionWidth);
    } else {
      setTranslateX(0);
    }
  }, [isDragging, translateX]);

  const handleEdit = () => {
    onEdit?.(bill);
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    onDelete(bill.id);
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <div className={`relative overflow-hidden ${isLast ? 'rounded-br-xl' : ''}`}>
        <div className="absolute top-0 right-0 bottom-0 flex">
          <button
            onClick={handleEdit}
            className="w-16 h-full bg-primary-500 text-white flex items-center justify-center"
          >
            <Pencil className="w-5 h-5" />
          </button>
          <button
            onClick={handleDeleteClick}
            className="w-16 h-full bg-expense-500 text-white flex items-center justify-center"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        <div
          className={`bg-white dark:bg-gray-800 p-4 shadow-sm cursor-grab active:cursor-grabbing relative transition-colors duration-300 ${isLast ? 'rounded-br-xl' : ''}`}
          style={{ transform: `translateX(${translateX}px)` }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          <div className="flex items-center gap-3 select-none">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
              bill.type === 'income' ? 'bg-income-100 dark:bg-income-900/30' : 'bg-expense-100 dark:bg-expense-900/30'
            }`}>
              <IconComponent className={`w-5 h-5 ${
                bill.type === 'income' ? 'text-income-600 dark:text-income-400' : 'text-expense-600 dark:text-expense-400'
              }`} />
            </div>
            
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <div className="font-semibold text-gray-800 dark:text-gray-100 whitespace-nowrap overflow-hidden text-ellipsis">{bill.category}</div>
              {bill.note && (
                <div className="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5">{bill.note}</div>
              )}
            </div>
            
            <div className="text-right shrink-0 flex flex-col items-end">
              <div
                className={`font-bold whitespace-nowrap ${
                  bill.type === 'income' ? 'text-income-600 dark:text-income-400' : 'text-expense-600 dark:text-expense-400'
                }`}
                style={{
                  fontSize: formatMoney(bill.amount).length > 10 ? '10px' : formatMoney(bill.amount).length > 8 ? '12px' : '18px',
                }}
              >
                {bill.type === 'income' ? '+' : '-'}{formatMoney(bill.amount)}
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{bill.date}</div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="确认删除"
        showFooter
        confirmText="删除"
        confirmVariant="danger"
        onConfirm={handleConfirmDelete}
      >
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center py-2">
          确定要删除这条账单记录吗？删除后可在回收站找回。
        </p>
      </Modal>
    </>
  );
};