import { useState, useRef, useCallback } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import * as Icons from 'lucide-react';
import { Bill } from '../types';
import { ConfirmModal } from './ConfirmModal';

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

  const IconComponent = (Icons as Record<string, React.FC<{ className?: string }>>)[bill.icon] || Icons.Circle;

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
            className="w-16 h-full bg-emerald-500 text-white flex items-center justify-center"
          >
            <Pencil className="w-5 h-5" />
          </button>
          <button
            onClick={handleDeleteClick}
            className="w-16 h-full bg-red-500 text-white flex items-center justify-center"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        <div
          className={`bg-white p-4 shadow-sm cursor-grab active:cursor-grabbing relative ${isLast ? 'rounded-br-xl' : ''}`}
          style={{ transform: `translateX(${translateX}px)` }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          <div className="flex items-center gap-4 select-none">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
              bill.type === 'income' ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <IconComponent className={`w-6 h-6 ${
                bill.type === 'income' ? 'text-green-600' : 'text-red-600'
              }`} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-800 truncate">{bill.category}</div>
              {bill.note && (
                <div className="text-sm text-gray-500 truncate mt-0.5">{bill.note}</div>
              )}
            </div>
            
            <div className="text-right shrink-0">
              <div className={`text-lg font-bold ${
                bill.type === 'income' ? 'text-green-600' : 'text-red-600'
              }`}>
                {bill.type === 'income' ? '+' : '-'}¥{bill.amount.toFixed(2)}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">{bill.date}</div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="确认删除"
        message="确定要删除这条账单记录吗？删除后无法恢复。"
        confirmText="删除"
        cancelText="取消"
        type="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
};