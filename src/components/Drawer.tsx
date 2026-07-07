import { X } from 'lucide-react';

export type DrawerDirection = 'top' | 'bottom' | 'left' | 'right';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  direction?: DrawerDirection;
  title?: string;
  showCloseButton?: boolean;
  closable?: boolean;
  children?: React.ReactNode;
  cancelText?: string;
  confirmText?: string;
  onCancel?: () => void;
  onConfirm?: () => void;
  showFooter?: boolean;
  footerButtons?: React.ReactNode;
  width?: string;
  height?: string;
}

const directionClasses: Record<DrawerDirection, {
  position: string;
  transform: string;
  openTransform: string;
  animate: string;
}> = {
  top: {
    position: 'top-0 left-0 right-0',
    transform: '-translate-y-full',
    openTransform: 'translate-y-0',
    animate: 'animate-slide-down',
  },
  bottom: {
    position: 'bottom-0 left-0 right-0',
    transform: 'translate-y-full',
    openTransform: 'translate-y-0',
    animate: 'animate-slide-up',
  },
  left: {
    position: 'top-0 left-0 bottom-0',
    transform: '-translate-x-full',
    openTransform: 'translate-x-0',
    animate: '',
  },
  right: {
    position: 'top-0 right-0 bottom-0',
    transform: 'translate-x-full',
    openTransform: 'translate-x-0',
    animate: '',
  },
};

export function Drawer({
  isOpen,
  onClose,
  direction = 'right',
  title,
  showCloseButton = true,
  closable = true,
  children,
  cancelText = '取消',
  confirmText = '确定',
  onCancel,
  onConfirm,
  showFooter = false,
  footerButtons,
  width = '85%',
  height = 'auto',
}: DrawerProps) {
  if (!isOpen) return null;

  const styles = directionClasses[direction];

  const handleOverlayClick = () => {
    if (closable) {
      onClose();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onClose();
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      onClose();
    }
  };

  const isVertical = direction === 'left' || direction === 'right';

  return (
    <div className="fixed inset-0 z-[100]">
      <div
        className="absolute inset-0 bg-black/40 transition-opacity"
        onClick={handleOverlayClick}
      />
      <div
        className={`absolute ${styles.position} bg-white dark:bg-gray-800 shadow-2xl flex flex-col transition-transform duration-300 ${
          isOpen ? styles.openTransform : styles.transform
        } ${direction === 'right' ? 'animate-slide-in-right' : ''}`}
        style={{
          width: isVertical ? width : '100%',
          height: !isVertical ? height : '100%',
          maxHeight: direction === 'bottom' ? '80vh' : undefined,
          maxWidth: direction === 'right' || direction === 'left' ? '360px' : undefined,
          borderRadius: direction === 'bottom' ? 'rounded-t-2xl' : direction === 'top' ? 'rounded-b-2xl' : undefined,
        }}
      >
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-4 h-12 border-b border-gray-100 dark:border-gray-700 shrink-0">
            {title && (
              <h2 className="text-base font-bold text-gray-800 dark:text-gray-100">{title}</h2>
            )}
            {!title && <div className="w-8" />}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        <div className="flex-1 overflow-auto">
          {children}
        </div>

        {showFooter && (
          <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex gap-3 shrink-0">
            {footerButtons ? (
              footerButtons
            ) : (
              <>
                <button
                  onClick={handleCancel}
                  className="flex-1 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300"
                >
                  {cancelText}
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 py-2.5 rounded-lg bg-primary-500 text-white text-sm font-medium"
                >
                  {confirmText}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}