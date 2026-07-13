import { useState, useCallback, useRef } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { Bill } from '../types';
import { Modal } from './Modal';
import { Icon } from './Icon';
import { formatMoney } from '../lib/utils';

interface BillItemProps {
  bill: Bill;
  onDelete: (id: string) => void;
  onEdit?: (bill: Bill) => void;
  isLast?: boolean;
  themeColor?: string;
}

export function BillItem({ bill, onDelete, onEdit, isLast = false, themeColor = '#10b981' }: BillItemProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [translateX, setTranslateX] = useState(0);
  const [isOpened, setIsOpened] = useState(false);

  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const currentTranslateRef = useRef(0);
  const directionRef = useRef<'horizontal' | 'vertical' | null>(null);
  const swipingRef = useRef(false);

  const SWIPE_THRESHOLD = 40;
  const ACTION_WIDTH = 160;

  const handleEdit = useCallback(() => {
    onEdit?.(bill);
  }, [bill, onEdit]);

  const handleDelete = useCallback(() => {
    onDelete(bill.id);
    setShowDeleteConfirm(false);
    setTranslateX(0);
    setIsOpened(false);
  }, [bill.id, onDelete]);

  const getClientX = (e: any) => {
    if (e.touches && e.touches[0]) return e.touches[0].clientX;
    if (e.changedTouches && e.changedTouches[0]) return e.changedTouches[0].clientX;
    return e.clientX;
  };
  const getClientY = (e: any) => {
    if (e.touches && e.touches[0]) return e.touches[0].clientY;
    if (e.changedTouches && e.changedTouches[0]) return e.changedTouches[0].clientY;
    return e.clientY;
  };

  const handleStart = (e: any) => {
    const x = getClientX(e);
    const y = getClientY(e);
    startXRef.current = x;
    startYRef.current = y;
    directionRef.current = null;
    swipingRef.current = true;
  };

  const handleMove = (e: any) => {
    if (!swipingRef.current) return;
    const x = getClientX(e);
    const y = getClientY(e);
    const dx = x - startXRef.current;
    const dy = y - startYRef.current;

    if (directionRef.current === null) {
      if (Math.abs(dx) > Math.abs(dy) + 5) {
        directionRef.current = 'horizontal';
      } else if (Math.abs(dy) > Math.abs(dx) + 5) {
        directionRef.current = 'vertical';
      }
    }

    if (directionRef.current === 'horizontal') {
      e.preventDefault?.();
      const base = isOpened ? -ACTION_WIDTH : 0;
      let next = base + dx;
      if (next > 0) next = 0;
      if (next < -ACTION_WIDTH) next = -ACTION_WIDTH;
      setTranslateX(next);
      currentTranslateRef.current = next;
    }
  };

  const handleEnd = () => {
    if (directionRef.current === 'horizontal') {
      if (currentTranslateRef.current < -SWIPE_THRESHOLD) {
        setTranslateX(-ACTION_WIDTH);
        setIsOpened(true);
      } else {
        setTranslateX(0);
        setIsOpened(false);
      }
    }
    directionRef.current = null;
    swipingRef.current = false;
  };

  const closeSwipe = useCallback(() => {
    setTranslateX(0);
    setIsOpened(false);
  }, []);

  const handleOuterClick = useCallback(() => {
    if (isOpened) {
      closeSwipe();
    }
  }, [isOpened, closeSwipe]);

  const handleInnerClick = useCallback(() => {
    if (isOpened) {
      closeSwipe();
    }
  }, [isOpened, closeSwipe]);

  const isTouch = Taro.getEnv() !== Taro.ENV_TYPE.WEB;

  return (
    <View
      className="relative overflow-hidden"
      onClick={handleOuterClick}
    >
      <View className="absolute right-0 top-0 bottom-0 flex" style={{ width: ACTION_WIDTH }}>
        <View
          className="flex-1 flex items-center justify-center text-white"
          style={{ backgroundColor: themeColor }}
          onClick={(e) => {
            e?.stopPropagation?.();
            closeSwipe();
            handleEdit();
          }}
        >
          <View className="flex flex-col items-center gap-0.5">
            <Icon name="Pencil" size={18} color="#fff" />
            <Text className="text-xs text-white">编辑</Text>
          </View>
        </View>
        <View
          className="flex-1 flex items-center justify-center bg-red-500 text-white"
          onClick={(e) => {
            e?.stopPropagation?.();
            closeSwipe();
            setShowDeleteConfirm(true);
          }}
        >
          <View className="flex flex-col items-center gap-0.5">
            <Icon name="Trash2" size={18} color="#fff" />
            <Text className="text-xs text-white">删除</Text>
          </View>
        </View>
      </View>

      <View
        className={`flex items-center gap-3 p-4 bg-white dark:bg-gray-800 ${
          isLast ? '' : 'border-b border-gray-100 dark:border-gray-700'
        }`}
        style={{
          transform: `translateX(${translateX}px)`,
          transition: swipingRef.current ? 'none' : 'transform 0.2s ease-out',
        }}
        onTouchStart={isTouch ? handleStart : undefined}
        onTouchMove={isTouch ? handleMove : undefined}
        onTouchEnd={isTouch ? handleEnd : undefined}
        onMouseDown={!isTouch ? handleStart : undefined}
        onMouseMove={!isTouch ? handleMove : undefined}
        onMouseUp={!isTouch ? handleEnd : undefined}
        onMouseLeave={!isTouch ? handleEnd : undefined}
        onClick={handleInnerClick}
      >
        <View
          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
            bill.type === 'income'
              ? 'bg-income-100 dark:bg-green-900/30'
              : 'bg-expense-100 dark:bg-red-900/30'
          }`}
        >
          <Icon
            name={bill.icon}
            size={18}
            className={
              bill.type === 'income'
                ? 'text-income-600 dark:text-green-400'
                : 'text-expense-600 dark:text-red-400'
            }
          />
        </View>

        <View className="flex-1 min-w-0">
          <Text className="font-semibold text-gray-800 dark:text-gray-100 truncate block">
            {bill.category}
          </Text>
          {bill.note && (
            <Text className="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5 block">
              {bill.note}
            </Text>
          )}
        </View>

        <View className="text-right shrink-0">
          <Text
            className={`font-bold whitespace-nowrap block ${
              bill.type === 'income'
                ? 'text-income-600 dark:text-green-400'
                : 'text-expense-600 dark:text-red-400'
            }`}
            style={{ fontSize: formatMoney(bill.amount).length > 10 ? 14 : formatMoney(bill.amount).length > 8 ? 16 : 20 }}
          >
            {bill.type === 'income' ? '+' : '-'}{formatMoney(bill.amount)}
          </Text>
          <Text className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 block">{bill.date}</Text>
        </View>
      </View>

      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="确认删除"
        showFooter
        confirmText="删除"
        confirmVariant="danger"
        onConfirm={handleDelete}
      >
        <Text className="text-sm text-gray-600 dark:text-gray-400 text-center py-2 block">
          确定要删除这条账单记录吗？删除后可在回收站找回。
        </Text>
      </Modal>
    </View>
  );
}
